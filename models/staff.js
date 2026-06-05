const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../database/database');

class staff extends Model {}

staff.init(
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
      schoolClassId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'schoolClasses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
        attendanceId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
         model: 'attendances',
          key: 'id'
         }
      },
       paymentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'payments',
          key: 'id'
        },
        onDelete: 'CASCADE'
        },
       announcementId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'announcements',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
        allowNull: false,
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
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      maritalStatus: {
        type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
        allowNull: false,
      },
      staffType: {
        type: Sequelize.ENUM('teaching', 'non-teaching'),
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      teachingType: {
        type: Sequelize.ENUM('class teacher', 'subject teacher'),
        allowNull: true
      },
       classAssigned: {
        type: Sequelize.STRING,
        allowNull: true
       },
       totalStudents: {
        type: Sequelize.INTEGER,
        allowNull: true
       },
       subjectAssigned: {
        type: Sequelize.STRING,
        allowNull: true
       },
       classesToTeach: {
        type: Sequelize.STRING,
        allowNull: true
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
    modelName: 'staff', // We need to choose the model name
  },
);



module.exports = staff