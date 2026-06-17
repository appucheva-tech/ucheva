'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('studentAttendances', {
        id: {
             allowNull: false,
             primaryKey: true,
             type: Sequelize.UUID,
           },
           studentId: {
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
              unique: true
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
    await queryInterface.dropTable('studentAttendances');
  }
};