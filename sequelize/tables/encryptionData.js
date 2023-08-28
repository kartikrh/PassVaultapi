const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EncryptedDataModel = sequelize.define(
    "tblEncryptedData",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrValue: {
        type: DataTypes.STRING(1000), // Use an appropriate data type for encrypted values
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return EncryptedDataModel;
};
