const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class wallets extends Model {}

wallets.init(
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
      schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentReceived: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      withdrawal: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalTransaction: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    modelName: 'wallets', // We need to choose the model name
  },
);


module.exports = wallets

