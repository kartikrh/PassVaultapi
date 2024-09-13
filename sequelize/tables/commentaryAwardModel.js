const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryAwardModel = sequelize.define(
    "tblCommentaryAwards",
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
      wrAwardId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrTeamId : {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wrPlayerId : {
        type: DataTypes.INTEGER,
        allowNull: false
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

  return CommentaryAwardModel;
};
