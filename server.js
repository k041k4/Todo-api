var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

// MODULES INITIATION
app.use(bodyParser.json());


// OPERATIONS
app.get('/', function(request, response) {
  response.send('Todo API root');
});

// Get All todos
app.get('/todos', function(request, response) {
  response.json(todos);
});

// Get Specific todo
app.get('/todos/:id', function(request, response) {
  var reqId = parseInt(request.params.id,10);
  var resTodo = _.findWhere(todos, {id: reqId});

  if (resTodo) {
    response.json(resTodo);
  } else {
    response.status(404).send();
  }
});

// Add data
app.post('/todos', function(request, response) {
  var body = request.body;

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return response.status(400).send();
  }

  body = _.pick(body, 'description', 'completed');
  // todos[todoNextId-1] = {
  //   id: todoNextId,
  //   description: body.description,
  //   completed: body.completed
  // };

  body.description = body.description.trim();
  body.id = todoNextId;
  todos.push(body);

  response.json(body);
  todoNextId++;
});

// SERVER INITIATION
app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});
