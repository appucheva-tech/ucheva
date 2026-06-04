'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawals', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
       adminId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
       walletId: {
         type: Sequelize.UUID,
         allowNull: false,
      },
       amount: {
        type: Sequelize.INTEGER,
       allowNull: false      },
       bankAccount: {
         type: Sequelize.STRING,
         allowNull: false
        },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: false
        },
      status: {
        type: Sequelize.ENUM('processing', 'successful', 'failed'),
        defaultValue: 'processing'
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
    await queryInterface.dropTable('withdrawals');
  }
};