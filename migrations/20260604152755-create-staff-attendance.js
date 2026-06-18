'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staffAttendances', {
     id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
    },
    adminId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    staffId: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    qrToken: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    timeCheckedIn: {
        type: Sequelize.DATE,
        allowNull: true
    },
    timeCheckedOut: {
        type: Sequelize.DATE,
        allowNull: true
    },
    staffName:{
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.ENUM('present', 'absent', 'late'),
        defaultValue: 'present'
    },
    expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
    },
    latitude:{
        type: Sequelize.DOUBLE
    },
    longitude:{
        type: Sequelize.DOUBLE
    },
    date:{
        type: Sequelize.DATEONLY,
        allowNull: false
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
    await queryInterface.dropTable('staffAttendances');
  }
};