const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BowlingTypeModel = sequelize.define(
    "tblBowlingType",
    {
      wrBowlingTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrBowlingType: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return BowlingTypeModel;
};
