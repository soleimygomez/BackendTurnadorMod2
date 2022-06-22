const { truncateSync } = require("fs-extra");

module.exports = function(sequelize, DataTypes) {

  return sequelize.define('User',
   {
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      defaultValue: null
    }, 
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    },
    count:{
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: 0,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    },
    createdAt: {
      type: 'TIMESTAMP',
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    Role_idRole: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null,
       
    },
    updatedAt: {
      type: 'TIMESTAMP',    
      allowNull: true,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    }
  }, {
    tableName: 'user'
  });

  
};