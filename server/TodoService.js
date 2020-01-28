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
}

module.exports = TodoService;