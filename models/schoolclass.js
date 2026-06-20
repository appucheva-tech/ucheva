const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class schoolClasses extends Model {}

schoolClasses.init(
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
       staffId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "staffs",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      className: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentOption: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      teacherName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      assigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    modelName: 'schoolClasses', // We need to choose the model name
  },
);


module.exports = schoolClasses

