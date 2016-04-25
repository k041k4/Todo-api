var express = require('express');
var bodyParser = require('body-parser');
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
  var resTodo;
  var reqId = parseInt(request.params.id,10);

// todos.forEach( function(todo) {
//   if (todo.id === reqId) {
//     resTodo = todo;
//   }
// });
// if (resTodo) {
//   response.json(resTodo);
// } else {
//   response.status(404).send();
// }

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === reqId) {
      resTodo = true;
    }
  }
  if (resTodo) {
    response.json(todos[reqId - 1]);
//    response.send('To Do #' + request.params.id + '/n' + 'EXISTS!');
  } else {
    response.status(404).send();
  }
});

// Add data
app.post('/todos', function(request, response) {
  var body = request.body;

  // todos[todoNextId-1] = {
  //   id: todoNextId,
  //   description: body.description,
  //   completed: body.completed
  // };

  body.id = todoNextId;
  todos.push(body);

  response.json(body);
  todoNextId++;
});

// SERVER INITIATION
app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});
