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
                   type: Sequelize.ENUM(
                       'Present',
                       'Absent',
                       'Late'
                   ),
                   defaultValue: 'Present'
               },
               expiresAt: {
                   type: Sequelize.DATE,
                   allowNull: false
               }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staffAttendances');
  }
};