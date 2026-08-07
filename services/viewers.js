const getViewersService = async (request) => {
    const { type, typeId, whitelabelId } = request.body;

    const result = global.tblViewers.filter((item) => {
        return (
            (type === undefined || type === 0 || item.type === type) &&
            (typeId === undefined || typeId === 0 || item.typeId === typeId) &&
            (whitelabelId === undefined || whitelabelId === 0 || item.whitelabelId === whitelabelId)
        );
    });

    const whitelabelIds = [...new Set(result.map(item => item.whitelabelId))];;
    const whitelabelData = global.tblWhitelabels.filter(item => whitelabelIds.includes(item.id)).map(item => ({ whitelabelId: item.id, domain: item.domain }));

    const whitelabelMap = Object.fromEntries(
        global.tblWhitelabels.map(item => [item.id, item.domain])
    );

    return Object.values(
        result.reduce((acc, { type, typeId, whitelabelId, viewerCount }) => {
            if (!acc[typeId]) {
                acc[typeId] = {
                    type,
                    typeId,
                    result: {}
                };
            }

            acc[typeId].result[whitelabelId] =
                (acc[typeId].result[whitelabelId] || 0) + viewerCount;

            return acc;
        }, {})
    ).map(group => ({
        type: group.type,
        typeId: group.typeId,
        result: Object.entries(group.result).map(([whitelabelId, viewerCount]) => ({
            whitelabelId: Number(whitelabelId),
            domain: whitelabelMap[whitelabelId],
            viewerCount
        }))
    }));
};

module.exports = {
    getViewersService
}