const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class announcement extends Model {}

announcement.init(
  {
    // Model attributes are defined here
      id:{
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
         model: 'admins',
         key: 'id'
              }
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      announcementTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      announcementContent: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     audience: {
        type: Sequelize.ENUM('staff', 'students', 'both'),
        allowNull: false,
      },
      sendOption: {
        type: Sequelize.ENUM('immediately', 'scheduled'),
        allowNull: false,
      },
      scheduledTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      saveAsTemplate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      unread: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    modelName: 'announcement', // We need to choose the model name
  },
);


module.exports = announcement