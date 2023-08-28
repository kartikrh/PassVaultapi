const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PermissionModel = sequelize.define(
    "tblPermission",
    {
      wrPermissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      wrRoleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTabId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsView: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsAdd: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsDelete: {
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
    },
    {
      timestamps: false,
    }
  );
  PermissionModel.associate = function (models) {
    PermissionModel.belongsTo(models.Role, {
      foreignKey: "wrRoleId",
      as: "Role",
    });
    PermissionModel.belongsTo(models.Tab, { foreignKey: "wrTabId", as: "Tab" });
  };
  return PermissionModel;
};
