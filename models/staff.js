const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class staff extends Model {}

staff.init(
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
       schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false
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
        type: Sequelize.ENUM('nigerian', 'non-nigerian'),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      maritalStatus: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: false,
      },
       attendanceStatus: {
        type: Sequelize.ENUM( 'present', 'absent', 'late'),
        defaultValue: 'absent',
      },
      staffType: {
        type: Sequelize.ENUM('teaching staff', 'non-teaching staff'),
        allowNull: false,
      },
      staffRole: {
        type: Sequelize.ENUM('teacher', 'bursary', 'security'),
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'staff',
      },
      teacherType: {
        type: Sequelize.ENUM('subject teacher', 'class teacher'),
        allowNull: true
      },
       classAssigned: {
        type: Sequelize.STRING, 
        allowNull: true
       },
       totalStudents: {
        type: Sequelize.INTEGER,
        allowNull: true
       },
       subjectAssigned: {
        type: Sequelize.JSON,
        allowNull: true
       },
       classesToTeach: {
        type: Sequelize.JSON,
        allowNull: true
      },
      department: {
        type: Sequelize.STRING,
        allowNull: true
      },
       password: {
        type: Sequelize.STRING,
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
      qualification: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      staffUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      staffPublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      signatureUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      signaturePublicId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      staffToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      staffTokenExpiresAt: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isVerified: {
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
    modelName: 'staff', // We need to choose the model name
  },
);



module.exports = staff