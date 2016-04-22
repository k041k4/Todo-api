var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
  id: 1,
  description: 'zavolaj mame',
  completed: false
}, {
  id: 2,
  description: 'chod do obchodu',
  completed: false
} ,{
  id: 3,
  description: 'zobud sa',
  completed: true
}];

app.get('/', function(request, response) {
  response.send('Todo API root');
});

// All todos
app.get('/todos', function(request, response) {
  response.json(todos);
});

// Specific todos
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


app.listen(PORT, function() {
  console.log('Express listening on port ' + PORT);
});
