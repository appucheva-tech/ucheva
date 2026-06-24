const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class withdrawal extends Model {}

withdrawal.init(
  {
    // Model attributes are defined here
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      adminId:{
         type: Sequelize.UUID,
         allowNull: false,
      },
      walletId:{
         type: Sequelize.UUID,
         allowNull: false,
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.STRING(200),
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
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'withdrawal', // We need to choose the model name
  },
);

module.exports = withdrawal
