'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feeStructures', {
      id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID,
            },
            adminId: {
              type: Sequelize.UUID,
              allowNull: false,
            },
            classId: {
              type: Sequelize.UUID,
              allowNull: false, 
            },
            feeType: {
              type: Sequelize.STRING,
              allowNull: false
            },
            amount: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            paymentOption: {
              type: Sequelize.ENUM('full payment','installment'),
              allowNull: false
            },
            numberOfInstallments: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            payableAmount: {
              type: Sequelize.INTEGER,
              allowNull: false
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
    await queryInterface.dropTable('feeStructures');
  }
};