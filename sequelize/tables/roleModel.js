const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoleModel = sequelize.define(
    "tblRole",
    {
      //* Auto increment primary key
      wrRoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      //* Role name defined by developer
      wrRoleName: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      //1: admin; 2: agent
      wrDisplayType: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isIn: {
            args: [[0, 1, 2]], //invalid:0,admin: 1; agent: 2;
            msg: "Invalid status value",
          },
        },
      },
      //* Description of the role
      wrDescription: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      //* Created by
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      //* Created date
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      //* Modified date
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      //* Modified by
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return RoleModel;
};
