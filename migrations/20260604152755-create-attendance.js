'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
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
      staffId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      classId:{
        type: Sequelize.UUID,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent'),
        allowNull: false,
      },
       studentClass: {
        type: Sequelize.STRING,
      },
       studentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      classTeacher: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      whatsAppNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      staffName:{
        type: Sequelize.STRING,
      },
      timeCheckedIn: {
        type: Sequelize.DATE,
      },
      timeCheckedOut: {
        type: Sequelize.DATE,
      },
       staffRole:{
        type: Sequelize.ENUM('teacher', 'admin', 'bursary', 'other'),
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
    await queryInterface.dropTable('attendances');
  }
};