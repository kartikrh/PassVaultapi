// for test purposes
const { DataTypes } = require("sequelize");
const sequelize = require('../../sequelize/config/singleInstance')

module.exports = (sequelize) => {
  const UserModel = sequelize.define('tblUser', {
    WrUserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    WrUserName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    WrPassword: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    WrRoleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    WrUserType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      //0: default, 1:Admin, 2:agent, 3:client
      validate: {
        isIn: {
          args: [[0, 1, 2, 3]], // Define valid numbers
          msg: 'Invalid status value',
        },
      },
    },
    WrMobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    WrIsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    WrIsSuperAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    WrCreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrCreatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    WrCreatedType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrModifyBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrModifyDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    WrModifyType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrIsDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    WrDeleteBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    WrDeleteDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    WrAllowMultipleLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    WrSubAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },  {
    timestamps: false,
  });

  return UserModel;
};
