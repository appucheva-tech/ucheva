const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class payment extends Model {}

payment.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
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
      studentId: { 
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "students",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      staffId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentType: {
        type: Sequelize.ENUM( 'card', 'bank transfer', 'mobile payment'),
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      currency: {
        type: Sequelize.ENUM('USD', 'EUR', 'NGN'),
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'payments', // We need to choose the model name
  },
);



module.exports = payment
