'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'parentFirstName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('students', 'parentLastName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('students', 'parentProfileUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('students', 'parentProfilePublicId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('students', 'parentPassword', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('students', 'parentPassword');
    await queryInterface.removeColumn('students', 'parentProfilePublicId');
    await queryInterface.removeColumn('students', 'parentProfileUrl');
    await queryInterface.removeColumn('students', 'parentLastName');
    await queryInterface.removeColumn('students', 'parentFirstName');
  },
};
