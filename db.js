var Sequelize = require('sequelize');   //Library
var env = process.env.NODE_ENV || 'development';   //environment setup
var sequelize;

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABSE_URL, {
    dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize(undefined /*Database*/, undefined /*Username*/, undefined /*Password*/, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
  });  //Instance
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');  // data model
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
