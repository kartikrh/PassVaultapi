const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaneltyRunsModel = sequelize.define(
    "tblPaneltyRuns",
    {
      wrPaneltyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrDesc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrRun: {
        type: DataTypes.INTEGER,
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
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return PaneltyRunsModel;
};
