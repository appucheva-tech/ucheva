'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
       id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
     parentName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentType: {  
        type: Sequelize.ENUM( 'card', 'bank transfer', 'mobile payment'),
        allowNull: false,
      },
       paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
       paymentStatus: {
        type: Sequelize.ENUM('success', 'pending', 'failed'),
        allowNull: false,
      },
      reference:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM('USD', 'EUR', 'NGN'),
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
    await queryInterface.dropTable('payments');
  }
};