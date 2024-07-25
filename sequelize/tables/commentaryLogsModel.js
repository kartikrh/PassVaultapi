const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryModel = sequelize.define(
    "tblCommentaryLogs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRequestBody: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrResponse :{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrGlobal :{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrExtraData : {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrCreatedDate : {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      wrCreatedBy : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return CommentaryModel;
};
