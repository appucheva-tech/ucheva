'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staffs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
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
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM,
        values: ['male', 'female'],
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING,
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
      phoneNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
        type: Sequelize.TEXT,
      },
       totalStudents: {
        type: Sequelize.INTEGER,
      },
       subjectAssigned: {
        type: Sequelize.TEXT
      },
       classesToTeach: {
        type: Sequelize.TEXT
      }, 
      department: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staffs');
  }
};
  