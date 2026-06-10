const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class studentAttendance extends Model {}

studentAttendance.init(
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
          model: "admins",
          key: "id"
        }
      },
      staffId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "staffs",
          key: "id"
        }
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent'),
        allowNull: false,
      },
       studentClass: {
        type: Sequelize.STRING,
      },
       studentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      classTeacher: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      whatsAppNotification: {
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
    modelName: 'studentAttendance', // We need to choose the model name
  },
);

module.exports = studentAttendance