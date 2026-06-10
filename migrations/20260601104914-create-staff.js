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
        allowNull: true,
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
      phoneNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      staffType: {
        type: Sequelize.ENUM('teaching', 'non-teaching'),
        allowNull: false,
      },

      role: {
        type: Sequelize.ENUM('staff', 'admin'),
        allowNull: false,
      },
      teachingType: {
        type: Sequelize.ENUM('class teacher', 'subject teacher', 'security','busary'),
        allowNull: true
      },
       classAssigned: {
        type: Sequelize.STRING,
      },
       totalStudents: {
        type: Sequelize.INTEGER,
      },
       subjectAssigned: {
        type: Sequelize.TEXT
      },
       classesToTeach: {
        type: Sequelize.STRING
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
  