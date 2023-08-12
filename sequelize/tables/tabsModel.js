const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {

  const TabModel = sequelize.define('tblTab', {
    //* Auto increment primary key
    wrTabId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    //* Tab name defined by developer
    wrTabName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    //* Name that will be displayed to the client (admin) on react
    WrDisplayName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    //1: admin; 2: agent
    wrDisplayType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isIn: {
          args: [[1, 2]], //admin: 1; agent: 2;
          msg: 'Invalid status value',
        },
      },
    },
    //* Routes=> this given page is on "/xyz" route on react
    wrWebPage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    //* If it is a parent: 0; if it is below a parent: parentId(wrTabId)
    wrParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    //* If it is still used or no longer used
    wrIsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* Am i giving the add permission to wrDisplayType(admin/agent)?
    wrIsAdd: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* Am i giving the edit permission to wrDisplayType(admin/agent)?
    wrIsEdit: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* Am i giving the delete permission to wrDisplayType(admin/agent)?
    wrIsDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* Am i giving the view permission to wrDisplayType(admin/agent)?
    wrIsView: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* when I click add, to add below this route.. 
    //* what is the route on the front end.
    wrAddWebpage: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    //TODO: ask MANAGER about this
    //! for now default: false
    wrIsMenu: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    //* CSS name of Icon from @mui/materials
    wrIconName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    //* Order in which it is shown
    wrDisplayOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: false,
  });

  return TabModel;
};