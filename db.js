var Sequelize = require('sequelize');   //Library
var env = process.env.NODE_ENV || 'development';   //environment setup
var sequelize;


//Initiate Instance
if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });
} else {
  sequelize = new Sequelize(undefined /*Database*/, undefined /*Username*/, undefined /*Password*/, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
  });
}

var db = {};

//Import Data Models
db.todo = sequelize.import(__dirname + '/models/todo.js');  // todo data model
db.user = sequelize.import(__dirname + '/models/user.js');  // user data model
db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Create Foreign Keys and getters/setters
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;
