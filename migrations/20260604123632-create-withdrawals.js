'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawals', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      walletId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
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
        allowNull: false
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
        allowNull: true
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
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('withdrawals', ['adminId']);
    await queryInterface.addIndex('withdrawals', ['walletId']);
    await queryInterface.addIndex('withdrawals', ['status']);
    await queryInterface.addIndex('withdrawals', ['reference'], {
      unique: true,
      name: 'withdrawals_reference_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('withdrawals');
  }
};
