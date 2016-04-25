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
  var body = _.pick(request.body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    return response.status(400).send();
  }

  body.description = body.description.trim();
  body.id = todoNextId;
  todos.push(body);

  response.json(body);
  todoNextId++;
});

// Delete Data
app.delete('/todos/:id', function (request, response) {
  var reqId = parseInt(request.params.id,10);
  var resTodo = _.findWhere(todos, {id: reqId});

  if (resTodo) {
    todos = _.without(todos,resTodo);
    response.send('Deleted ' + JSON.stringify(resTodo));
  } else {
    response.status(404).json({"error": "No todo found with that id"});
  }
});

// Update Data
app.put('/todos/:id', function (request, response) {
  var reqId = parseInt(request.params.id,10);
  var resTodo = _.findWhere(todos, {id: reqId});
  var body = _.pick(request.body, 'description', 'completed');
  var validAttributes = {};

  if (!resTodo) {
    return response.status(404).json({"error": "No todo found with that id"});
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return response.status(400).send("Completed missing");
  }
  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
    return response.status(400).send("Description Missing");
  }

  _.extend(resTodo, validAttributes);
  response.json(resTodo);
});

// SERVER INITIATION
app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});
