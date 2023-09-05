const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PageFormatModel = require("./pageFormateModel")(sequelize);
  const PageModel = sequelize.define(
    "tblPage",
    {
      wrPageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrPageTitle: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrPageHeading: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrPageName: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrAlias: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrIsLink: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrLinkURL: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrPageFormatId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsOpenInNewTab: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrPageContent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrSEOWord: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrSEODescription: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrDynamicParameters: {
        type: DataTypes.STRING,
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
  PageModel.belongsTo(PageFormatModel, {
    foreignKey: "wrPageFormatId",
    targetKey: "wrPageFormatId",
  });
  return PageModel;
};
