'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qrCodes', {
         // Model attributes are defined here
       id:{
          type:Sequelize.UUID,
          primaryKey:true,
          defaultValue: Sequelize.UUIDV4
        },
        adminId:{
            type: Sequelize.UUID,
            allowNull: false
        },
        schoolUrl:{
          type: Sequelize.STRING,
          allowNull: false
        },
        qrToken:{
          type: Sequelize.STRING,
          allowNull: false,
          unique:true
        }, 
         latitude: {
          type: Sequelize.DOUBLE,
          allowNull: true
        },
        longitude: {
          type: Sequelize.DOUBLE,
          allowNull: true
        },
        address: {
          type: Sequelize.STRING,
          allowNull: true
        },
        date:{
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        expiresAt:{
          type:Sequelize.DATE,
          allowNull:false
        },
        status:{
            type:Sequelize.ENUM('active', 'expired'),
            defaultValue:'active'
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
    await queryInterface.dropTable('qrCodes');
  }
};