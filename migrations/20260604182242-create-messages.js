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
             adminId: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: "admins",
                key: "id"
              },
              onDelete: 'CASCADE'
            },
            email: {
              type: Sequelize.STRING
            },
            name: {
              type: Sequelize.STRING
            },
            subject: {
              type: Sequelize.STRING
            },
            message: {
              type: Sequelize.STRING
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
    await queryInterface.dropTable('messages');
  }
};