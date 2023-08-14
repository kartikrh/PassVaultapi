
const tabsValidator = (body) =>{
    return {
        'wrTabName': body?.wrTabName || null,
        'WrDisplayName': body?.WrDisplayName || null,
        'wrDisplayType': (body?.wrDisplayType>0&&body?.wrDisplayType<3)?body.wrDisplayType: 0,
        'wrWebPage': body?.wrWebPage || null,
        'wrParentId': body?.wrParentId || 0,
        'wrIsActive': body?.wrIsActive || yes,
        'wrIsAdd': body?.wrIsAdd || null,
        'wrIsEdit': body?.wrIsEdit || null,
        'wrIsDelete': body?.wrIsDelete || null,
        'wrIsView': body?.wrIsView || yes,
        'wrAddWebpage': body?.wrAddWebpage || null,
        'wrIsMenu': body?.wrIsMenu || null,
        'wrIconName': body?.wrIconName || null,
        'wrDisplayOrder': body?.wrDisplayOrder || null
    };
    
}

module.exports={
    tabsValidator
}