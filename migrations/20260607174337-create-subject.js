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
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      classId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      staffId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subjectName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableSection: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableDepartment:{
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
  