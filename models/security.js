const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class security extends Model {}

security.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },
     firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      staffType: {
        type: Sequelize.ENUM('security', 'busary', 'teaching'),
        allowNull: false,
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
       },
       email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt:{
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'securities', // We need to choose the model name
  },
);


module.exports = security

