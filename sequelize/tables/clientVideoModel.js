const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClientVideoModel = sequelize.define(
    "tblClientVideo",
    {
        wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTitle: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      wrURL: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      wrImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCredit: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrViewerCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
    }
  );

  return ClientVideoModel;
};