const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class feeStructures extends Model {}

feeStructures.init(
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
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'feeStructures', // We need to choose the model name
  },
);



module.exports = feeStructures
