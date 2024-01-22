const tabsValidator = (body) => {
  return {
    wrTabName: body?.tabName || null,
    WrDisplayName: body?.displayName || null,
    wrDisplayType:
      body?.displayType > 0 && body?.displayType < 3 ? body.displayType : 0,
    wrWebPage: body?.webPage || null,
    wrParentId: body?.parentId || 0,
    wrIsActive: body.hasOwnProperty('isActive') ? body.isActive :  true,
    wrIsAdd: body.hasOwnProperty('isAdd') ?  body.isAdd : null,
    wrIsEdit: body.hasOwnProperty('isEdit') ? body.isEdit : null,
    wrIsDelete:  body.hasOwnProperty('isDelete') ? body.isDelete : null,
    wrIsView: body.hasOwnProperty('isView') ? body.isView : true,
    wrAddWebpage: body?.addWebpage || null,
    wrIsMenu: body.hasOwnProperty('isMenu') ? body.isMenu : null,
    wrIconName: body?.iconName || null,
    wrDisplayOrder: body?.displayOrder || null,
  };
};

module.exports = {
  tabsValidator,
};
