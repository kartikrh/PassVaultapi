const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TeamModel = require("./teamModel")(sequelize);
  const TeamPlayersModel = sequelize.define(
    "tblTeamPlayers",
    {
      wrTeamPlayerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRefPlayerId: {
        type: DataTypes.INTEGER,
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
    },
    {
      timestamps: false,
    }
  );

  TeamPlayersModel.belongsTo(TeamModel, {
    foreignKey: "wrTeamId",
    targetKey: "wrTeamId",
  });

  return TeamPlayersModel;
};
