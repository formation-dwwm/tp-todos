const path = require('path');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const TodoService = require('./TodoService');

const API_VER = 1;
const API_BASE = `/api/v${API_VER}`;

const port = process.env.PORT || 3000;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.resolve(__dirname, './data/todos.db'), (err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to the SQlite database.');
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

app.get('/', (req, res) => {
    res.send("Nothing here... Please use API at /api/v1 endpoint.")
});

app.get(API_BASE + '/todos', function (req, res) {
    todoSvc.all({
        limit: req.query.limit,
        offset: req.query.offset
    })
        .then(todos => res.json(todos))
        .catch(err => res.status(500).json({ error: err.message }));
})

app.post(API_BASE + '/todos', (req, res) => {
    if(!req.body.title || req.body.title == ""){
        res.status(500).json({ error: "Property title is required to create a Todo." })
        return;
    }
    todoSvc.create(req.body.title, req.body.content)
        .then(todo => res.json(todo))
        .catch(err => res.status(500).json({ error: err.message }));
})


app.get(API_BASE + '/todos/:id', function (req, res) {
    todoSvc.get(req.params.id)
        .then(todo => {
            if(todo){
                res.json(todo)
            }else{
                res.status(404).json({ error: "Not found." });
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
})

app.patch(API_BASE + '/todos/:id', (req, res) => {
    const data = req.body;
    
    todoSvc.patch(req.params.id, data)
        .then(success => res.json(success))
        .catch(err => res.status(500).json({ error: err.message }));
})

app.delete(API_BASE + '/todos/:id', (req, res) => {
    todoSvc.remove(req.params.id)
        .then(success => res.json(success))
        .catch(err => res.status(500).json({ error: err.message }));
})

app.listen(port, function () {
  console.log(`Server started, API listening on http://localhost:${port}/ !`)
})