const express = require('express')
const app = express();
const sqlite3 = require('sqlite3');
const TodoRouter = require('./TodoRouter');
const path = require('path');
const TodoService = require('./TodoService');

const port = process.env.PORT || 3000;

// Init db
const db = new sqlite3.Database(path.resolve(__dirname, './data/todos.db'), (err) => {
    if (err) {
    throw err;
    }
    console.log('Connected to the SQlite database.');
});

// Init our model
const todoSvc = new TodoService(db);



// Disable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');

    // authorized headers for preflight requests
    // https://developer.mozilla.org/en-US/docs/Glossary/preflight_request
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

// Setup API endpoints
TodoRouter.setup(app, todoSvc);

// Start web server
app.listen(port, function () {
  console.log(`Server started, API listening on http://localhost:${port}/ !`)
})