var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

// MODULES INITIATION
app.use(bodyParser.json());


// OPERATIONS
app.get('/', function(request, response) {
  response.send('Todo API root');
});

// Get /todos?completed=true&description=work
app.get('/todos', middleware.requireAuthentication, function(request, response) {
  var query = request.query;
  var where = {
    userId: request.user.get('id')
  };

  if (_.has(query,'completed') && query.completed === 'true') {
    where.completed = true;
  } else if (_.has(query,'completed') && query.completed === 'false') {
    where.completed = false;
  }
  if (_.has(query,'description')) {
    where.description = {
      $like: '%' + query.description + '%'
    };
  }
  db.todo.findAll({
    where: where
  }).then(function(todos){
    if (todos) {
      response.status(200).json(todos);
    } else {
      response.status(404).send('No data found for specified query' );
    }
  }).catch(function(e) {
    response.status(500).json(e);
  });
});

// Get Specific todo
app.get('/todos/:id', middleware.requireAuthentication, function(request, response) {
  var reqId = parseInt(request.params.id,10);

  db.todo.findById(reqId).then(function(todo){
    if (!!todo && todo.userId === request.user.get('id')) {
      response.status(200).json(todo);
    } else {
      response.status(404).send('Todo with ID ' + reqId + ' doesn\'t exists' );
    }
  }).catch(function(e) {
    response.status(500).json(e);
  });
});

// Add data
app.post('/todos', middleware.requireAuthentication, function(request, response) {
  var body = _.pick(request.body, 'description', 'completed');

  body.description = body.description.trim();

  db.todo.create(body).then(function(todo) {
      request.user.addTodo(todo).then(function() {
        return todo.reload();   //refresh todo after adding user ID
      }).then(function(todo) {
      response.status(200).json(todo);
      });
  }).catch(function(e) {
      response.status(400).json(e);
  });
});

// Delete Data
app.delete('/todos/:id', middleware.requireAuthentication, function (request, response) {
  var reqId = parseInt(request.params.id,10);

  db.todo.destroy({
    where: {
      id: reqId,
      userId: request.user.get('id')
    }
  }).then(function(rowsDeleted) {
    if (rowsDeleted > 0) {
      response.status(204).send(toString(rowsDeleted) + ' rows deleted');
    } else {
      response.status(404).send('No data found' );
    }
  }).catch(function(e) {
    response.status(500).json(e);
  });
});

// Update Data
app.put('/todos/:id', middleware.requireAuthentication, function (request, response) {
  var reqId = parseInt(request.params.id,10);
  var body = _.pick(request.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }
  if (body.hasOwnProperty('description')) {
    attributes.description = body.description.trim();
  }

  db.todo.findById(reqId).then(function(todo) {
    if (todo && todo.userId === request.user.get('id')) {
      todo.update(attributes).then(function (todo) {
        response.json(todo.toJSON());
      }, function(e) {
        response.status(400).json(e);
      });
    } else {
      response.status(404).send('Todo with ID ' + reqId + ' doesn\'t exists' );
    }
  }, function(e) {
    response.status(500).json(e);
  });
});


// Add user data
app.post('/users', function(request, response) {
  var body = _.pick(request.body, 'email', 'password');

  db.user.create(body).then(function(user) {
      response.status(200).json(user.toPublicJSON());
  }).catch(function(e) {
      response.status(400).json(e);
  });
});

// User Login
app.post('/users/login', function(request, response) {
  var body = _.pick(request.body, 'email', 'password');
  var userInstance;

  db.user.authenticate(body).then(function(user) {
    var token = user.generateToken('authentication');
    userInstance = user;

    // Token to DB
    return db.token.create({
      token: token
    });
  }).then(function(tokenInstance) {
    response.status(200).header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
  }).catch (function() {
    response.status(401).send();
  });
});

app.delete('/users/login', middleware.requireAuthentication, function (request, response) {
  var reqId = parseInt(request.params.id,10);

  request.token.destroy().then(function() {
    response.status(204).send();
  }).catch(function() {
    response.status(500).send();
  });
});

// Database Synchronization
db.sequelize.sync({
  force: true
}).then(function() {
  console.log('Database is Initiated');
  // Server Setup
  app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
  });
});
