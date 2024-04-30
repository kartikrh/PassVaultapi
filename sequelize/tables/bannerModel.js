const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BannerModel = sequelize.define(
    "tblBanner",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrBannerType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrTitle: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(6000),
        allowNull: false,
      },
      wrIsPermanent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      wrLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrViewerCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
  return BannerModel;
};
