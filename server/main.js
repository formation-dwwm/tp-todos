const path = require('path');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const TodoService = require('./TodoService');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname, './data/todos.db'), (err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to the in-memory SQlite database.');

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

    
    db.get(sql, [], (err, row) => {
        if(err){
            throw err;
        }

        if(!row){
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
            db.run(sql, [], function(err){
                if(err){ throw err; }

                // Seed data
                const sql = `
                INSERT INTO todos (title, content, done, createdAt) VALUES ($title, $content, $done, $createdAt)
                `;
                const params = {
                    $title: "First Todo",
                    $content: "Create Todo App !",
                    $done: false,
                    $createdAt: new Date()
                }
                db.run(sql, params, function(err) {
                    if (err) {
                      throw err;
                    }
                    console.log(`Seed data inserted ${this.changes}`);
                })
            })
        }

        console.log("Database ready !");
    });
  });

const todoSvc = new TodoService(db);

app.use(bodyParser.json());

// Disable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.get('/todos', function (req, res) {
    todoSvc.all({
        limit: req.query.limit,
        offset: req.query.offset
    })
        .then(todos => res.json(todos))
        .catch(err => res.status(500).json({ error: err.message }));
})

app.post('/todos', (req, res) => {
    const sql = `
    INSERT INTO todos (title, content, done, createdAt) VALUES ($title, $content, $done, $createdAt)
    `;
    const params = {
        $title: req.body.title,
        $content: req.body.content || "",
        $done: false,
        $createdAt: new Date()
    }
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
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

        res.json(formatTodo(newTodo));
    })
})

const formatTodos = (todos) => todos.map(formatTodo);
const formatTodo = (todo) => ({
    id: todo.id,
    title: todo.title,
    content: todo.content,
    done: !!todo.done,  // Convert tinyint back to boolean
    createdAt: todo.createdAt
});

app.get('/todos/:id', function (req, res) {
    todoSvc.get(req.params.id)
        .then(todo => {
            if(todo){
                res.json(todos)
            }else{
                res.status(404).json({ error: "Not found." });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
})

app.patch('/todos/:id', (req, res) => {
    todoSvc.patch(req.params.id, {
        limit: req.query.limit,
        offset: req.query.offset
    })
        .then(todos => res.json(todos))
        .catch(err => res.status(500).json({ error: err.message }));


    const patchedValuesNames = [];
    const patchedValues = [];

    ["title", "content", "done"].forEach(key => {
        if(req.body[key]){
            patchedValuesNames.push(key);
            patchedValues.push(req.body[key]);
        }
    });

    const sql = `
    UPDATE todos SET ${
        patchedValuesNames.map(n => `${n}=?`).join(', ')
    } WHERE id=?
    `;
    
    db.run(sql, [...patchedValues, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
})

app.delete('/todos/:id', (req, res) => {
    const sql = `
    DELETE FROM todos WHERE id=?
    `;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})