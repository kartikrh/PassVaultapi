const {DataTypes} = require('sequelize');
module.exports = (sequelize) => {
  const MatchTypePredictorModel = sequelize.define(
    'tblMatchTypePredictor',
    {
        wrMatchTypePredictorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrMatchTypeId : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        wrOver : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrBall : {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        wrRunPerBall : {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        wrOrder : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }
  );
  

  return MatchTypePredictorModel;
};
