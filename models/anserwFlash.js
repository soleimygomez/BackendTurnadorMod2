module.exports = function (sequelize, DataTypes) {
  return sequelize.define('anserwFlash', {
    idAnserwFlash: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      defaultValue: null
    },
    texto: {
      type: DataTypes.STRING,
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    },
    idUser: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
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
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      autoIncrement: false,
      primaryKey: false,
      defaultValue: null
    },
    
  }, {
    tableName: 'anserwFlash'
  });

};