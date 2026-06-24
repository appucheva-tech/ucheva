'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawals', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: DataTypes.UUIDV4
            },
            adminId:{
               type: Sequelize.UUID,
               allowNull: false,
            },
            walletId:{
               type: Sequelize.UUID,
               allowNull: false,
            },
            accountNumber: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            accountName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            bankName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            amount: {
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
    await queryInterface.dropTable('withdrawals');
  }
};