var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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

// Get /todos?completed=true&q=work
app.get('/todos', function(request, response) {
  var query = request.query;
  var where = {};

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
app.get('/todos/:id', function(request, response) {
  var reqId = parseInt(request.params.id,10);

  db.todo.findById(reqId).then(function(todo){
    if (!!todo) {
      response.status(200).json(todo);
    } else {
      response.status(404).send('Todo with ID ' + reqId + ' doesn\'t exists' );
    }
  }).catch(function(e) {
    response.status(500).json(e);
  });
});

// Add data
app.post('/todos', function(request, response) {
  var body = _.pick(request.body, 'description', 'completed');

  body.description = body.description.trim();

  db.todo.create(body).then(function(todo) {
      response.status(200).json(todo);
  }).catch(function(e) {
      response.status(400).json(e);
  });
});

// Delete Data
app.delete('/todos/:id', function (request, response) {
  var reqId = parseInt(request.params.id,10);

  db.todo.destroy({
    where: {
      id: reqId
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

  // if (resTodo) {
  //   todos = _.without(todos,resTodo);
  //   response.send('Deleted ' + JSON.stringify(resTodo));
  // } else {
  //   response.status(404).json({"error": "No todo found with that id"});
  // }
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


db.sequelize.sync({
//  force: true
}).then(function() {
  console.log('Database is Initiated');
  // SERVER INITIATION
  app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
  });
});
