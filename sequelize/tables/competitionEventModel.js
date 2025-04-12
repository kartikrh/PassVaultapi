const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CompEventModel = sequelize.define(
    "tblCompetitionEvent",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrCompetitionId : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wrCommentaryId : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wrCreatedAt : {
            type: DataTypes.DATE,
            allowNull: false,
        },
        wrCreatedBy : { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
      timestamps: false,
    }
  );

  return CompEventModel;
};
