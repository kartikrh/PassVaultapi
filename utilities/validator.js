const tabsValidator = (body) => {
  return {
    wrTabName: body?.tabName || null,
    WrDisplayName: body?.displayName || null,
    wrDisplayType:
      body?.displayType > 0 && body?.displayType < 3 ? body.displayType : 0,
    wrWebPage: body?.webPage || null,
    wrParentId: body?.parentId || 0,
    wrIsActive: body?.isActive || true,
    wrIsAdd: body?.isAdd || null,
    wrIsEdit: body?.isEdit || null,
    wrIsDelete: body?.isDelete || null,
    wrIsView: body?.isView || true,
    wrAddWebpage: body?.addWebpage || null,
    wrIsMenu: body?.isMenu || null,
    wrIconName: body?.iconName || null,
    wrDisplayOrder: body?.displayOrder || null,
  };
};

module.exports = {
  tabsValidator,
};
