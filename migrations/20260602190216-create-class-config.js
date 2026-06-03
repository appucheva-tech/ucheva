'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('classConfigs', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
             adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            adminId: { 
              type: Sequelize.UUID 
            },
            section: {
              type: Sequelize.STRING
            },
            classFrom: {
              type: Sequelize.STRING
            },
            classTo: {
              type: Sequelize.STRING
            },
            armFrom: {
              type: Sequelize.STRING
            },
            armTo: {
              type: Sequelize.STRING
            },
            classes: {
              type: Sequelize.TEXT
            },
            arms: {
              type: Sequelize.TEXT
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
    await queryInterface.dropTable('classConfigs');
  }
};