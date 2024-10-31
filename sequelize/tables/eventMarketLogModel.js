const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const eventMarketModel = sequelize.define(
    "tblEventMarketLogs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrRequestBody : {
        type: DataTypes.JSON,
        allowNull: false
      },
      wrResponse : {
        type: DataTypes.JSON,
        allowNull: false
      },
      wrError : {
        type: DataTypes.JSON,
        allowNull: true
      },
      wrCreatedAt : {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue : DataTypes.NOW
      },
      wrCreatedBy : {
        type: DataTypes.INTEGER,
        allowNull: true
      },
    },
    {
      timestamps: false,
    }
  );

  return eventMarketModel;
};
