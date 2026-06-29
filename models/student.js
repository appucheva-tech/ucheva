const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class   student extends Model {}

student.init(
  {
    // Model attributes are defined here
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: DataTypes.UUIDV4
        },
        adminId:{
         type: Sequelize.UUID,
         allowNull: false,
        },
        parentId: {
        type: Sequelize.UUID,
         allowNull: true,
        },
        classId: {
        type: Sequelize.UUID,
        allowNull: false,
        },
        schoolUrl: {
         type: Sequelize.STRING,
         allowNull: false
        },
      admissionNumber: {
        type: Sequelize.STRING,
        unique: true
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
        allowNull: true,
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
        type: Sequelize.ENUM('nigerian', 'non nigerian'),
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
        allowNull: true,
      },
      attendanceStatus: {
        type: Sequelize.ENUM('present', 'absent'),
        allowNull: true,
      },
      session: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      religion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parentGuardiansFirstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentGuardiansLastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentGuardiansAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      relationship: {
        type: Sequelize.ENUM('father', 'mother', 'guardian'),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentGuardiansEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.ENUM('paid', 'part payment', 'unpaid'),
        defaultValue: 'unpaid'
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
