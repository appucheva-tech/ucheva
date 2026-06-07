'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subjects', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      subjectName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableSection: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      aplicableDepartment:{
        type: Sequelize.STRING,
         allowNull: false,
      },
        adminId: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable('subjects');
  }
};
  