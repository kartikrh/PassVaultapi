const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventTypeModel = require("./eventTypeModel")(sequelize);
  const PlayerTypeModel = require("./playerTypeModel")(sequelize);

  const PlayerModel = sequelize.define(
    "tblPlayer",
    {
      wrPlayerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCountry: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrPlayerName: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      wrBowlingStyle: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsKipper: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsLeftHandedBatting: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsLeftArmFielding: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
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
      wrBatsmanAverage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrBatsmanStrikeRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrBowlerEconomy: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrBowlerAverage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrDisplayName: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  PlayerModel.belongsTo(EventTypeModel, {
    foreignKey: "wrEventTypeId",
    targetKey: "wrEventTypeId",
  });

  PlayerModel.belongsTo(PlayerTypeModel, {
    foreignKey: "wrPlayerTypeId",
    targetKey: "wrPlayerTypeId",
  });

  return PlayerModel;
};
