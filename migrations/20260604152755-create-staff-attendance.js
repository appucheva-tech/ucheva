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
             type: Sequelize.ENUM('teacher', 'admin', 'bursary','other'),
            },
           createdAt: {
             type: Sequelize.DATE,
             allowNull: false
           },
           updatedAt: {
             type: Sequelize.DATE,
             allowNull: false
           }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staffAttendances');
  }
};