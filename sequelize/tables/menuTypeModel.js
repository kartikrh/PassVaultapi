const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BlockModel = require("./blockModel")(sequelize);

  const MenuTypeModel = sequelize.define(
    "tblMenuType",
    {
      wrMenuTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrBlockId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMenuTypeName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrNoOfLevel: {
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
  MenuTypeModel.belongsTo(BlockModel, {
    foreignKey: "wrBlockId",
    targetKey: "wrBlockId",
  });
  return MenuTypeModel;
};
