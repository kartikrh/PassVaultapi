const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const TeamMatchTypeModel = sequelize.define(
        "tblTeamMatchType",
        {
            wrTeamMatchTypeId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true,
            },
            wrTeamId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            wrTeamJerseyImage: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            wrTeamJerseyImagePath: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            wrMatchTypeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
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
    return TeamMatchTypeModel;
};
