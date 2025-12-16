const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CompititionModel = sequelize.define(
    "tblCompetition",
    {
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCompetition: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRefID: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsTrending: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
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
      wrDrsCount : {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      wrSetOfRules: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrIsCompetitionStatisticsCalculation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }
    },
    {
      timestamps: false,
    }
  );

  return CompititionModel;
};
