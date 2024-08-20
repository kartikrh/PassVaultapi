const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const thirdParyApisModel = sequelize.define(
    "tblThirdPartyApis",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrProviderName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      wrUrl: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrType: {
        type: DataTypes.INTEGER,
        allowNull: false, // 1 => Socket, 2 => API
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wrIsConnect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );
  return thirdParyApisModel;
};
