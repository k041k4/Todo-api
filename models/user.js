var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7,20]
      },
      set: function (value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value,salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if (typeof user.email === 'string' && user.email.length > 0) {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function(resolve, reject) {
          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          }
          body.email = body.email.trim();
          body.password = body.password.trim();
          user.findOne({
            where: {
              email: body.email
            }
          }).then(function(user){
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              return reject();
            }
            //Correct Password
            resolve(user);
          }, function (e) {
            reject();
          });
        });
      },
      findByToken: function(token) {
        return new Promise(function(resolve,reject) {
          try {
            //Decode token
            var decodedJWT = jwt.verify(token,'qwerty098');
            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abs123!@#$');
            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
            //Find user
            user.findById(tokenData.id).then(function(user) {
              if (user) {
                resolve(user);
              } else {
                reject();
              }
            }, function(e) {
              reject();
            });
          } catch (e) {
            reject();
          }
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'email', 'id', 'createdAt', 'updatedAt');
      },
      generateToken: function(type) {
        if (!_.isString(type)) {
          return undefined;
        }
        try {
          var stringData = JSON.stringify({
            id: this.get('id'),
            type: type
          });
          // ID Encryption
          var encryptedData = cryptojs.AES.encrypt(stringData, 'abs123!@#$').toString();
          // Token to Sign
          var token = jwt.sign({
            token: encryptedData
          }, 'qwerty098');
          // Token returned
          return token;
        } catch(e) {
          return undefined;
        }
      }
    }
  });
  return user;
};
