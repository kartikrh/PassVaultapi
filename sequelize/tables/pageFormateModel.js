const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PageFormatModel = sequelize.define(
    "tblPageFormat",
    {
      wrPageFormatId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrPageFormatName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrPageName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrDescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedBy: {
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
      },
    },
    {
      timestamps: false,
    }
  );
  return PageFormatModel;
};
