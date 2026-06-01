const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class admin extends Model {}

admin.init(
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
        allowNull: false
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false
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
      otp: {
        type: Sequelize.STRING,
        allowNull: false
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
        defaultValue: 0
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
    modelName: 'admin', // We need to choose the model name
  },
);

module.exports = admin