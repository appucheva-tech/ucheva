'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallets', {
             id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,            },
             adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            schoolUrl: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            paymentReceived: {
              type: Sequelize.INTEGER,
              allowNull: true,
              defaultValue: 0
            },
            withdrawal: {
              type: Sequelize.INTEGER,
              allowNull: true,
              defaultValue: 0
            },
            balance: {
              type: Sequelize.INTEGER,
              allowNull: true,
              defaultValue: 0
            },
            totalTransaction: {
              type: Sequelize.INTEGER,
              allowNull: true,
              defaultValue: 0
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
    await queryInterface.dropTable('wallets');
  }
};