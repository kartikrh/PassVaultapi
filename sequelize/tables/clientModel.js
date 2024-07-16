// for test purposes
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClientModel = sequelize.define(
    "tblClient",
    {
      wrClientID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrClientName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrUserName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrPassword: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrIsAllowMultiLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      wrCreateType: {
        type: DataTypes.INTEGER,
      },
      wrModifyBy: {
        type: DataTypes.INTEGER,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      wrCreateType: {
        type: DataTypes.INTEGER,
      },
      wrIsDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrEmailID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrIsMobileVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrMobileNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrIpAddress: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrGoogleID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return ClientModel;
};
