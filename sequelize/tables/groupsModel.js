const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GroupsModel = sequelize.define(
    "tblGroups",
    {
    wrGroupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    wrGroupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wrIsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  });

  return GroupsModel;
};
