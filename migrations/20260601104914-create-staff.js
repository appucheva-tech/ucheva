'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staffs', {
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
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },
            staffProfileUrl: {
              type: Sequelize.STRING,
              allowNull: true
            },
            staffProfilePublicId: {
              type: Sequelize.STRING,
              allowNull: true
            },
            schoolUrl: {
              type: Sequelize.STRING,
              allowNull: false
            },
            firstName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            lastName: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            otherName: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            gender: {
              type: Sequelize.ENUM('male', 'female'),
              allowNull: false,
            },
            dateOfBirth: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            nationality: {
              type: Sequelize.ENUM('nigerian', 'non-nigerian'),
              allowNull: true,
            },
            address: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            maritalStatus: {
              type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
              allowNull: true,
            },
             attendanceStatus: {
              type: Sequelize.ENUM( 'present', 'absent', 'late'),
              defaultValue: 'absent',
            },
            role: {
              type: Sequelize.STRING,
              defaultValue: 'staff',
            },
             password: {
              type: Sequelize.STRING,
            },
            phoneNumber: {
              type: Sequelize.INTEGER,
              allowNull: false,
              unique: true,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
            },
            qualification: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            staffUrl: {
              type: Sequelize.STRING,
              allowNull: true
            },
            staffPublicId: {
              type: Sequelize.STRING,
              allowNull: true
            },
            signatureUrl: {
              type: Sequelize.STRING,
              allowNull: true
            },
            signaturePublicId: {
              type: Sequelize.STRING,
              allowNull: true
            },
            staffToken: {
              type: Sequelize.STRING,
              allowNull: true
            },
            staffTokenExpiresAt: {
              type: Sequelize.DATE
            },
            isActive: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            },
            isVerified: {
              type: Sequelize.BOOLEAN,
              defaultValue: false
            },
            loginAttempts: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
              allowNull: false
            },
            lockUntil: {
              type: Sequelize.DATE
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staffs');
  }
};
  