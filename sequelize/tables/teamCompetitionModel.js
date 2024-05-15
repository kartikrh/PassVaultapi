const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TeamModel = require("./teamModel")(sequelize);
  const CompetitionModel = require("./compititionModel")(sequelize);
  const TeamCompetitionModel = sequelize.define(
    "tblTeamCompetition",
    {
      wrTeamCompetitionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCompetitionOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRefCompetitionId: {
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

  TeamCompetitionModel.belongsTo(TeamModel, {
    foreignKey: "wrTeamId",
    targetKey: "wrTeamId",
  });

  TeamCompetitionModel.belongsTo(CompetitionModel, {
    foreignKey: "wrRefCompetitionId",
    targetKey: "wrCompetitionId",
  });

  return TeamCompetitionModel;
};
