const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class subject extends Model {}

subject.init(
  {
    // Model attributes are defined here
id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      subjectName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableSection: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      aplicableDepartment:{
        type: Sequelize.STRING,
         allowNull: false,
      },
        adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'admins', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
 },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'subjects', // We need to choose the model name
  },
);


module.exports = subject             