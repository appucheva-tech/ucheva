const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class admins extends Model {}

admins.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },  
      schoolName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },  
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'admin'
      },
      finishedOnboarding: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      otp: {
        type: Sequelize.STRING,
      },
      otpExpiresAt: {
        type: Sequelize.DATE
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      passwordReset: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      loginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lockUntil: {
        type: Sequelize.DATE
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
    modelName: 'admins', // We need to choose the model name
  },
);

module.exports = admins