const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class classConfigs extends Model {}

classConfigs.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },
       adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "admins",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      adminId: { 
        type: Sequelize.UUID 
      },
      section: {
        type: Sequelize.STRING
      },
      classFrom: {
        type: Sequelize.STRING
      },
      classTo: {
        type: Sequelize.STRING
      },
      armFrom: {
        type: Sequelize.STRING
      },
      armTo: {
        type: Sequelize.STRING
      },
      classes: {
        type: Sequelize.JSON,
        allowNull: false
      },
      arms: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'classConfigs', // We need to choose the model name
  },
);

module.exports = classConfigs