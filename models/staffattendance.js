const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class StaffAttendance extends Model {}

StaffAttendance.init({

    id: {
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },

    adminId: {
        type: Sequelize.UUID,
        allowNull: false,   
        references: {
            model: 'admins',
            key: 'id'
        }
    },
    staffId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'staffs',
            key: 'id'
        }
    },
    schoolUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    qrToken: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    timeCheckedIn: {
        type: Sequelize.DATE,
        allowNull: true
    },
    timeCheckedOut: {
        type: Sequelize.DATE,
        allowNull: true
    },
    status: {
        type: Sequelize.ENUM('present', 'absent', 'late'),
        defaultValue: 'Present'
    },
    expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
    },
    latitude:{
        type: Sequelize.DOUBLE
    },
    longitude:{
        type: Sequelize.DOUBLE
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
    sequelize,
    modelName: 'staffAttendance'
})

module.exports = StaffAttendance