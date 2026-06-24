'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
            adminId:{
               type: Sequelize.UUID,
               allowNull: false,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            name: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            subject: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            message: {
              type: Sequelize.STRING(200),
              allowNull: false,
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
    await queryInterface.dropTable('messages');
  }
};