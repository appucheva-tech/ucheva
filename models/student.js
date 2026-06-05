const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class student extends Model {}

student.init(
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
      otherName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.UUID,
        references: {
          model: 'admins',
          key: 'id'
        }
      },
      staffId:{
        type: Sequelize.UUID,
        references: {
          model: 'staffs',
          key: 'id'
        }

      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      nationality: {
        type: Sequelize.ENUM('nigerian', 'non-nigerian'),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      studentClass: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      session: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      parentGuardiansName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      relationship: {
        type: Sequelize.ENUM('father', 'mother', 'guardian'),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
    modelName: 'student', // We need to choose the model name
  },
);

module.exports = student