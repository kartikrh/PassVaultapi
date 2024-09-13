const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AwardModel= sequelize.define(
    "tblAwards",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrName : {
        type: DataTypes.STRING,
        allowNull: false
      },
      wrIsShowOnSummary : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false
      },
      wrDisplayOrder : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrIsActive : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false
      },
      wrCreatedAt : {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue : DataTypes.NOW
      },
      wrCreatedBy : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    },
    {
      timestamps: false,
    }
  );

  return AwardModel
};
