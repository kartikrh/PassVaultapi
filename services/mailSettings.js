const { insertMailSettingsQuery, updateMailSettingsQuery, deleteMailSettingsQuery, isDefaultChangeQuery, isDefaultFalseQuery, activeInactiveMailSettingsQuery } = require("../repository/TableMailSettings");
const { encrypt, decrypt } = require("../utilities/index");

const saveMailSettings = async (request, fastify, data) => {
    const validateEmail = global.tblMailSettings.find((item) =>
        item?.email?.toLowerCase() === data.body?.email?.toLowerCase()
    );
    if (validateEmail) {
        throw new Error("Email already exists");
    }
    const saveData = await insertMailSettingsQuery(data.body, fastify, request);
    if (data.body.mailType === 1 && data.body.isDefault === true ||
        data.body.mailType === 2 && data.body.isDefault === true) {
        await isDefaultFalseQuery(saveData, fastify, {...request.body})
        global.tblMailSettings.forEach((item) => {
            if (item.id !== saveData.id && item.mailType === data.body.mailType) {
                item.isDefault = false;
            }
        });
    }
    global.tblMailSettings.push(saveData);
    return saveData;
}

const editMailSettings = async (request, fastify, data) => {
    const updateData = {
        id: data.body.id,
        email: data.body.email,
        userName: data.body.userName,
        password: data.body.password,
        mailType: data.body.mailType,
        smtpAddress: data.body.smtpAddress,
        portNumber: data.body.portNumber,
        isEnableSSL: data.body.isEnableSSL,
        isActive: data.body.isActive,
        isDefault: data.body.isDefault,
    };
    const validateEmail = global.tblMailSettings.find((item) =>
        item?.email?.toLowerCase() === updateData?.email?.toLowerCase() &&
        item.id !== updateData.id
    );
    if (validateEmail) {
        throw new Error("Email already exists");
    }

    const validate = global.tblMailSettings.find((item) =>
        item.id === updateData.id
    );
    if (!validate) {
        throw new Error("Mail settings id not found");
    }

    if (updateData.mailType === 1 && updateData.isDefault === true ||
        updateData.mailType === 2 && updateData.isDefault === true) {
        await isDefaultFalseQuery(updateData, fastify, {...request.body})
        global.tblMailSettings.forEach((item) => {
            if (item.id !== updateData.id && item.mailType === updateData.mailType) {
                item.isDefault = false;
            }
        });
    }

    await updateMailSettingsQuery(updateData, fastify, request);
    const index = global.tblMailSettings.findIndex(
        (item) => item.id === updateData.id
    );
    if (index !== -1) {
        global.tblMailSettings[index] = updateData;
    }
    return updateData
}

const allMailSettings = async (request) => {
    const { isActive } = request.body;
    if (isActive == undefined) {
        return global.tblMailSettings;
    }
    return global.tblMailSettings.filter((item) => item.isActive === isActive);

};

const mailSettingsById = async (request) => {
    const { id } = request.body;
    const result = global.tblMailSettings.find(
        (item) => item.id === id
    );
    const decryptPassword = await decrypt(result.password);
    return {...result, password: decryptPassword} || null;
};

const createMailSettings = async (request, fastify) => {
    let password = encrypt(request.body.password);
    request.body.password = password

    if (request.body.id === 0) {
        return await saveMailSettings(request, fastify, request);
    } else {
        return await editMailSettings(request, fastify, request);
    }
};


const deleteMailSettings = async (request, fastify) => {
    const { id } = request.body;

    await deleteMailSettingsQuery(id, fastify, request);
    global.tblMailSettings = global.tblMailSettings.filter(
        (item) => !id.includes(item.id)
    );

    return `Mail setting(s) deleted successfully`;
};

const changeIsDefaultStage = async (request, fastify) => {
    const body = request.body;
    body.isDefault = Boolean(body.isDefault);

    const result = global.tblMailSettings.find(
        (item) => item.id === body.id
    );

    if (result.mailType === 1 && body.isDefault || result.mailType === 2 && body.isDefault) {
        body.mailType = result.mailType;
        await isDefaultFalseQuery(body, fastify, request);
        global.tblMailSettings.forEach((item) => {
            if (item.id !== body.id && item.mailType === body.mailType) {
                item.isDefault = false;
            }
        });
    }

    await isDefaultChangeQuery(body, fastify, request);
    const index = global.tblMailSettings.findIndex(
        (item) => item.id === body.id
    );

    if (index !== -1) {
        global.tblMailSettings[index].isDefault = body.isDefault;
    }

    return `IsDefault stage changed successfully`;
};

const activeInactiveMailSettings = async (request, fastify) => {
    const { id, isActive } = request.body;
    const validateApiId = global.tblMailSettings.find((item) => item.id === id);
    if (!validateApiId) {
        throw new Error("Mail settings with this Id not found");
    }
    await activeInactiveMailSettingsQuery(
        {
            id,
            isActive,
        },
        request,
        fastify
    );

    const index = global.tblMailSettings.findIndex((item) => item.id === id);
    if (index != -1) {
        global.tblMailSettings[index].isActive = isActive;
    }

    return `Mail settings updated successfully`;
};

module.exports = {
    allMailSettings,
    mailSettingsById,
    createMailSettings,
    deleteMailSettings,
    changeIsDefaultStage,
    activeInactiveMailSettings
};
