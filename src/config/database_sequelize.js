const { Sequelize } = require('sequelize');


'use-strict';

const config = require('../config/db_config.json');
const sequelize = new Sequelize(

  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialectBd,

    pool: {
      max: config.max,
      min: config.min,
      require: config.require,
      idle: config.idle
    },
    logging: console.log,
    logging: function (str) {
      // do your own logging
      console.log("####################################################################11");
      console.log(str);
      console.log("####################################################################22");

    }
  }
);
var db = {};
try {
  sequelize.authenticate();
  console.log('Connection has been established successfully. sequelize===================');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
db.sequelize = sequelize;
db.Sequelize = Sequelize;
//******************************************************* sequelize ****************************
db.auth = require('../../models/auth.js')(sequelize, Sequelize);
db.rol = require('../../models/rol.js')(sequelize, Sequelize);
db.user = require('../../models/user.js')(sequelize, Sequelize);
db.comment=require('../../models/comment.js')(sequelize, Sequelize);
db.message=require('../../models/message.js')(sequelize, Sequelize);
db.anserwFlash=require('../../models/anserwFlash.js')(sequelize, Sequelize);

db.auth.belongsTo(db.user, { foreignKey: 'User_idUser' });
db.user.hasOne(db.auth, { foreignKey: 'User_idUser' });

db.message.belongsTo(db.comment, { foreignKey: 'idComment' });
db.comment.hasOne(db.message, { foreignKey: 'idComment' }); 

db.rol.hasOne(db.user, { foreignKey: 'Role_idRole' });
db.user.belongsTo(db.rol, { foreignKey: 'Role_idRole' });

db.message.belongsTo(db.user, { foreignKey: 'idUser' });
db.user.hasOne(db.message, { foreignKey: 'idUser' });

db.anserwFlash.belongsTo(db.user, { foreignKey: 'idUser' });
db.user.hasOne(db.anserwFlash, { foreignKey: 'idUser' });

module.exports = db;

