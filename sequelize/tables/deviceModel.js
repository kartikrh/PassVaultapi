const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeviceModel = sequelize.define(
    "tblDevices",
    {
      wrDeviceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrPushEndpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      wrPushP256DH: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrPushAuth: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      wrUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrUserType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return DeviceModel;
};
