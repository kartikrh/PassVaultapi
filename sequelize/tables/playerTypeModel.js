const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlayerTypeModel = sequelize.define(
    "tblPlayerType",
    {
      wrPlayerTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrPlayerType: {
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

  return PlayerTypeModel;
};
