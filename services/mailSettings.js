const { insertMailSettingsQuery, updateMailSettingsQuery, deleteMailSettingsQuery, isDefaultChangeQuery, isDefaultFalseQuery } = require("../repository/TableMailSettings");
const bcrypt = require("bcrypt");

const allMailSettings = async (request) => {
    const result = global.tblMailSettings;
    return result;
};

const mailSettingsById = async (request) => {
    const { id } = request.body;
    const result = global.tblMailSettings.find(
        (item) => item.id === id
    );
    return result || null;
};

const createMailSettings = async (request, fastify) => {
    let password = bcrypt.hashSync(request.body.password, 10);
    request.body.password = password

    if (request.body.id === 0) {
        const validateEmail = global.tblMailSettings.find((item) =>
            item?.email?.toLowerCase() === request?.body?.email?.toLowerCase()
        );
        if (validateEmail) {
            throw new Error("Email already exists");
        }
        if (request.body.mailType === 1 && request.body.isDefault === true ||
            request.body.mailType === 2 && request.body.isDefault === true) {
            await isDefaultFalseQuery(request.body, fastify, request)
            global.tblMailSettings.forEach((item) => {
                if (item.id !== request.body.id && item.mailType === request.body.mailType) {
                    item.isDefault = false;
                }
            });
        }
        const saveData = await insertMailSettingsQuery(request.body, fastify, request);
        global.tblMailSettings.push(saveData);
        return saveData;
    } else {
        const updateData = {
            id: request.body.id,
            email: request.body.email,
            userName: request.body.userName,
            password: request.body.password,
            mailType: request.body.mailType,
            smtpAddress: request.body.smtpAddress,
            portNumber: request.body.portNumber,
            isEnableSSL: request.body.isEnableSSL,
            isActive: request.body.isActive,
            isDefault: request.body.isDefault,
        };
        const validateEmail = global.tblMailSettings.find((item) =>
            item?.email?.toLowerCase() === updateData?.email?.toLowerCase() &&
            item.id !== updateData.id
        );
        if (validateEmail) {
            throw new Error("Email already exists");
        }

        if (updateData.mailType === 1 && updateData.isDefault === true ||
            updateData.mailType === 2 && updateData.isDefault === true) {
            await isDefaultFalseQuery(updateData, fastify, request)
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

        global.tblMailSettings[index] = updateData;

        return updateData
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
    const result = global.tblMailSettings.find(
        (item) => item.id === body.id
    );
    
    if (result.mailType === 1 && body.isDefault === true || result.mailType === 2 && body.isDefault === true) {
        body.mailType = result.mailType
        await isDefaultFalseQuery(body, fastify, request)
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

    global.tblMailSettings[index].isDefault = body.isDefault;

    return `IsDefault stage changed successfully`;
};

module.exports = {
    allMailSettings,
    mailSettingsById,
    createMailSettings,
    deleteMailSettings,
    changeIsDefaultStage
};
