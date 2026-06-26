const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class withdrawals extends Model {}

withdrawals.init(
  {
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
        model: 'admins',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    walletId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    schoolUrl: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'NGN'
    },
    accountNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    accountName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bankName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bankCode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    reference: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    koraReference: {
      type: Sequelize.STRING,
      allowNull: true
    },
    narration: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Ucheva withdrawal'
    },
    status: {
      type: Sequelize.ENUM('processing', 'successful', 'failed'),
      allowNull: false,
      defaultValue: 'processing'
    },
    failureReason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    providerResponse: {
      type: Sequelize.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('providerResponse');
        if (!rawValue) return null;

        try {
          return JSON.parse(rawValue);
        } catch (error) {
          return rawValue;
        }
      },
      set(value) {
        this.setDataValue(
          'providerResponse',
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      }
    },
    requestDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    processedAt: {
      type: Sequelize.DATE,
      allowNull: true
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
    sequelize,
    modelName: 'withdrawals'
  }
);

module.exports = withdrawals;
