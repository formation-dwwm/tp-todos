const formatTodos = (todos) => todos.map(formatTodo);
const formatTodo = (todo) => ({
    id: todo.id,
    title: todo.title,
    content: todo.content,
    done: !!todo.done,  // Convert tinyint back to boolean
    createdAt: todo.createdAt
});

class TodoService {
    constructor(db){
        if(!db){
            throw new Error("Todo Svc needs a valid sqlite3 db instance to run.")
        }

        this.db = db;

        return this.initDatabase();
    }

    initDatabase(){
        new Promise((resolve, reject) => {
            this.checkTableExistance()
                .then(exists => {
                    if(!exists){
                        return this.createDatabase()
                                .then(() => this.createInitialData())
                                .then(() => resolve(true));
                    }else{
                        resolve(false);
                    }
                })
                .catch(err => reject(err));
        })
        
    }

    checkTableExistance(){
        return new Promise((resolve, reject) => {
            // Check if table exists
            const sql = `
            SELECT 
                name
            FROM 
                sqlite_master 
            WHERE 
                type ='table' AND 
                name LIKE 'todos';
            `;
            this.db.get(sql, [], (err, row) => {
                if(err){
                    reject(err);
                    return;
                }
        
                resolve(!!row);
            });

        })
    }

    createDatabase(){
        return new Promise((resolve, reject) => {
            // Create table and seed data
            const sql = `
            CREATE TABLE todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                done TINYINT(1) NOT NULL,
                createdAt DATETIME NOT NULL
            );
            `;
            this.db.run(sql, [], function(err){
                if(err){ 
                    reject(err);
                    return; 
                }
                resolve();
            });
        })
    }

    createInitialData(){
        // Seed data
        return this.create("First Todo", "Create Todo App !");
    }

    all({ limit, offset }){
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM todos ORDER BY createdAt LIMIT ? OFFSET ?`;

            limit = limit || 30;
            offset = offset || 0;

            this.db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(formatTodos(rows));
            });
        });
    }

    get(id){
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM todos WHERE id=?`;

            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if(!row){
                    resolve(null);
                    return;
                }

                resolve(formatTodo(row));
            });
        });
    }

    create(title, content = ""){
        return new Promise((resolve, reject) => {
            const sql = `
            INSERT INTO todos (title, content, done, createdAt) VALUES ($title, $content, $done, $createdAt)
            `;
            const params = {
                $title: title,
                $content: content,
                $done: false,
                $createdAt: new Date()
            }
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                const todoId = this.lastID;
                const newTodo = {
                    id: todoId,
                    title: params.$title,
                    content: params.$content,
                    done: !!params.$done,
                    createdAt: params.$createdAt
                };

                resolve(formatTodo(newTodo));
            })
        })
    }

    patch(id, data){
        return new Promise((resolve, reject) => {
            const patchedValuesNames = [];
            const patchedValues = [];

            ["title", "content", "done"].forEach(key => {
                if(data[key]){
                    patchedValuesNames.push(key);
                    patchedValues.push(data[key]);
                }
            });

            const sql = `
            UPDATE todos SET ${
                patchedValuesNames.map(n => `${n}=?`).join(', ')
            } WHERE id=?
            `;
            
            this.db.run(sql, [...patchedValues, id], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ success: true });
            });
        })
    }

    remove(id){
        return new Promise((resolve, reject) => {
            const sql = `
            DELETE FROM todos WHERE id=?
            `;
            this.db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ success: true });
            });
        })
    }
}

module.exports = TodoService;