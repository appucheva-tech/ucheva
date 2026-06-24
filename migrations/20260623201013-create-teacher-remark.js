'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacherRemarks', {
      id: {
        type:          Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey:    true,
      },
      report_card_id: {
        type:      Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      teacher_id: {
        type:      Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      remark: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
      },
      updated_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacherRemarks');
  }
};