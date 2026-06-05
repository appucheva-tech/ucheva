'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
      },
        attendanceId: {
        type: Sequelize.UUID,
        allowNull: false,
        },
        classId: {
        type: Sequelize.UUID,
        allowNull: false,
        },
        announcementId: {
        type: Sequelize.UUID,
        allowNull: false,
        },
        paymentId: {
        type: Sequelize.UUID,
        allowNull: false,
       },
       walletId: {
        type: Sequelize.UUID,
        allowNull: false,
       },
       staffId:{
        type: Sequelize.UUID,
        allowNull: false,
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
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      adminId: {
        type: Sequelize.UUID,
        
      },
      staffId:{
        type: Sequelize.UUID,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('students');
  }
};