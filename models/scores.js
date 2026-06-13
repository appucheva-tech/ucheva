const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class scores extends Model {}

scores.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      studentId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "students",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      staffId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "staffs",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      subject: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      className: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      studentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      admissionNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      continuousAssessment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      exam: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'scores', // We need to choose the model name
  },
);



module.exports = scores