'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      id:{
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
      announcementTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      announcementContent: {
        type: Sequelize.STRING,
        allowNull: false,
      },
     audience: {
        type: Sequelize.ENUM('staff', 'parents'),
        allowNull: false,
      },
      sendOption: {
        type: Sequelize.ENUM('immediately', 'scheduled'),
        defaultValue: 'immediately',
        allowNull: false,
      },
      scheduledTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      saveAsTemplate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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
    await queryInterface.dropTable('announcements');
  }
};