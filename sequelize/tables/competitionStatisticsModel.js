const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CompetitionStatisticsModel = sequelize.define(
        "tblCompetitionStatistics",
        {
            wrCompetitionStatisticsId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrEventTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrCompetitionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrCompetitionStatisticsTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrTeamId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrPlayerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrDisplayOrder: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrValue: {
                type: DataTypes.STRING(1000),
                allowNull: true
            },
            wrIsActive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrCreatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrCreatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrUpdatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrUpdatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            wrIsDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            wrDeletedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrDeletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            timestamps: false,
        }
    );
    return CompetitionStatisticsModel;
};
