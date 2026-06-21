'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schoolClasses', {
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
            staffId: {
             type: Sequelize.UUID,
             allowNull: true,
             references: {
               model: "staffs",
               key: "id"
             },
             onDelete: 'CASCADE'
           },
           schoolUrl: {
             type: Sequelize.STRING,
             allowNull: false,
           },
           className: {
             type: Sequelize.STRING,
             allowNull: false
           },
           paymentOption: {
             type: Sequelize.ENUM('full payment', 'installment'),
             allowNull: false
           },
           numberOfInstallments: {
             type: Sequelize.INTEGER,
             allowNull: true
           },
           payableAmount: {
             type: Sequelize.INTEGER,
             allowNull: true
           },
           amount: {
             type: Sequelize.DECIMAL(10, 2),
             allowNull: false
           },
           teacherName: {
             type: Sequelize.STRING,
             allowNull: true
           },
           assigned: {
             type: Sequelize.BOOLEAN,
             defaultValue: false,
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
    await queryInterface.dropTable('schoolClasses');
  }
};
