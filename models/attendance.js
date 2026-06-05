const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class attendance extends Model {}

attendance.init(
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
        allowNull: false,
        references: {
          model: "staffs",
          key: "id"
        }
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
      classid:{
        type: Sequelize.UUID,
        allowNull: false,
        references: {
         model: 'schoolClasses',
         key: 'id'
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
      whatAppNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      staffName:{
        type: Sequelize.STRING,
      },
      timeCheckedIn: {
        type: Sequelize.DATE,
      },
      timeCheckedOut: {
        type: Sequelize.DATE,
      },
       staffRole:{
        type: Sequelize.ENUM('teacher', 'admin', 'other'),
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
    modelName: 'attendance', // We need to choose the model name
  },
);

module.exports = attendance