'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adminProfiles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
         },
      schoolLogoUrl: {
        type: Sequelize.STRING,
        allowNull: true
         },
      schoolLogoPublicId: {
        type: Sequelize.STRING,
        allowNull: true
         },
      schoolType: {
        type: Sequelize.JSON,
        allowNull: true
         },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
        },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
        }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('adminProfiles');
  }
};