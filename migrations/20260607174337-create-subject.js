'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subjects', {
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
      staffId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subjectName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableClasses: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      applicableDepartment:{
        type: Sequelize.STRING,
         allowNull: false,
      },
      subjectTeacher:{
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('subjects');
  }
};
  