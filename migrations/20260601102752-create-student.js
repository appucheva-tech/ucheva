'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
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
      parentGuardiansfirstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentGuardianslastName: {
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('students');
  }
};
