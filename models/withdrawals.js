const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class withdrawals extends Model {}

withdrawals.init(
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
       walletId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "wallets",
          key: "id"
        },
        onDelete: 'CASCADE'
      },
      withdrawalId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false      },
      bankAccount: {
        type: Sequelize.STRING,
        allowNull: false
      },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('processing', 'successful', 'failed'),
        defaultValue: 'processing'
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
    modelName: 'withdrawals', // We need to choose the model name
  },
);


module.exports = withdrawals

