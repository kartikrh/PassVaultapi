const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NewsModel = sequelize.define(
    "tblTeam",
    {
      wrNewsId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTitle: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrNews: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(200),
        allowNull: true,
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
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrTabs: {
        type: DataTypes.STRING(10000),
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return NewsModel;
};
