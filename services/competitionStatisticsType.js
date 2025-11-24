const { insertCompetitionStatisticsTypeQuery, updateCompetitionStatisticsTypeByIdQuery, deleteCompetitionStatisticsTypeByIdQuery } = require("../repository/TableCompetitionStatisticsType");

const getAllCompetitionStatisticsTypeService = async (request, fastify) => {
    const { isActive, typeId, eventTypeId } = request.body;
    let competitionStatisticsTypes = global.tblCompetitionStatisticsType;

    if ("isActive" in request.body) {
        competitionStatisticsTypes = competitionStatisticsTypes.filter(item => item.isActive === isActive);
    }

    if (typeId && typeId !== 0) {
        competitionStatisticsTypes = competitionStatisticsTypes.filter(item => item.typeId === typeId);
    }

    if (eventTypeId && eventTypeId !== 0) {
        competitionStatisticsTypes = competitionStatisticsTypes.filter(item => item.eventTypeId === eventTypeId);
    }

    return competitionStatisticsTypes;
};

const getCompetitionStatisticsTypeByIdService = async (request, fastify) => {
    const { competitionStatisticsTypeId } = request.body;
    return global.tblCompetitionStatisticsType.find(item => item.competitionStatisticsTypeId === competitionStatisticsTypeId) || null;
};

const createCompetitionStatisticsTypeService = async (request, fastify) => {
    const { typeId, name, eventTypeId, displayOrder } = request.body;

    if (!typeId) {
        throw new Error("Type Id is required");
    } else if (!name) {
        throw new Error("Name is required");
    } else if (!eventTypeId) {
        throw new Error("Event Type Id is required");
    } else if (!displayOrder) {
        throw new Error("Display Order is required");
    }

    const checkExists = global.tblCompetitionStatisticsType.find(
        (item) => item.typeId === typeId && item.name.toLowerCase() === name.toLowerCase() && item.eventTypeId === eventTypeId
    );
    if (checkExists) {
        throw new Error("Competition Statistics Type already exists");
    }

    const checkDisplayOrderExists = global.tblCompetitionStatisticsType.find(
        (item) => item.typeId === typeId && item.displayOrder === displayOrder
    );
    if (checkDisplayOrderExists) {
        throw new Error("Competition Statistics Type display order already exists");
    }

    const result = await insertCompetitionStatisticsTypeQuery(request.body, fastify, request);
    global.tblCompetitionStatisticsType.push(result);

    return result;
};

const updateCompetitionStatisticsTypeService = async (request, fastify) => {
    const { competitionStatisticsTypeId, displayOrder } = request.body;
    const checkExists = global.tblCompetitionStatisticsType.find(item => item.competitionStatisticsTypeId === competitionStatisticsTypeId);

    if (!checkExists) {
        throw new Error("Competition Statistics Type with this id not Found");
    }

    const checkDisplayOrderExists = global.tblCompetitionStatisticsType.find(
        (item) => item.typeId === checkExists.typeId && item.displayOrder === displayOrder
    );
    if (checkDisplayOrderExists) {
        throw new Error("Competition Statistics Type display order already exists");
    }

    const updateData = {
        keyName: request.body.keyName ?? checkExists.keyName,
        displayOrder: request.body.displayOrder ?? checkExists.displayOrder,
        description: request.body.description ?? checkExists.description,
        ...("isActive" in request.body ? {
            isActive: request.body.isActive
        } : {
            isActive: checkExists.isActive
        }),
        competitionStatisticsTypeId
    };

    const result = await updateCompetitionStatisticsTypeByIdQuery(updateData, fastify, request);
    const index = global.tblCompetitionStatisticsType.findIndex(item => item.competitionStatisticsTypeId === competitionStatisticsTypeId);
    global.tblCompetitionStatisticsType[index] = result;

    return result;
};

const saveCompetitionStatisticsTypeService = async (request, fastify) => {
    const { competitionStatisticsTypeId } = request.body;

    if (competitionStatisticsTypeId === 0) {
        return await createCompetitionStatisticsTypeService(request, fastify);
    } else {
        return await updateCompetitionStatisticsTypeService(request, fastify);
    }
};

const deleteCompetitionStatisticsTypeService = async (request, fastify) => {
    const { competitionStatisticsTypeId } = request.body;
    await deleteCompetitionStatisticsTypeByIdQuery(competitionStatisticsTypeId, fastify, request);

    global.tblCompetitionStatisticsType = global.tblCompetitionStatisticsType.filter(
        (item) => !competitionStatisticsTypeId.includes(item.competitionStatisticsTypeId)
    );
    return true;
};

module.exports = {
    getAllCompetitionStatisticsTypeService,
    getCompetitionStatisticsTypeByIdService,
    saveCompetitionStatisticsTypeService,
    deleteCompetitionStatisticsTypeService
};