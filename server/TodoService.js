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
            db.run(sql, params, function(err) {
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
            
            db.run(sql, [...patchedValues, id], function(err) {
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
            db.run(sql, [id], function(err) {
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