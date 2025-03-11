const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MatchTypeBowlingPredictor = sequelize.define(
    "tblMatchTypeBowlingPredictor",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        wrMatchTypeId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrBowlingTypeId : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrPossibility : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrCreatedAt : {
            type: DataTypes.DATE,
            allowNull: false
        },
        wrCreatedBy : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wrUpdatedAt : {
            type: DataTypes.DATE,
            allowNull: false
        },
        wrUpdatedBy : {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        timestamps: false,
    }
  );
  return MatchTypeBowlingPredictor;
};
