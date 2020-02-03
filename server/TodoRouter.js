const bodyParser = require('body-parser')

const API_VER = 1;
const API_BASE = `/api/v${API_VER}`;

class TodoRouter {

    // Set up routes for an express instance
    static setup(app, todoSvc){
        

        app.use(bodyParser.json());

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

        app.get(API_BASE + '/todos/count', function (req, res) {
            todoSvc.count()
                .then(count => res.json({ count }))
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
    }

}

module.exports = TodoRouter;