
const getAllEntitySocketService = async (request, fastify) => {
    const { isActive } = request.body;
    if (isActive === undefined) {
        return global.tblEntitySockets || [];
    }
    return global.tblEntitySockets.filter((item) => item.isActive === isActive) || [];
}

module.exports = {
    getAllEntitySocketService,
}