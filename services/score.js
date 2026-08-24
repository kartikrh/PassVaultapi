const { dltDeviceQuery, saveDeviceQuery } = require("../repository/TableDevice");
const { getIdByValue } = require("../repository/TableUser");

const saveDeviceDataService = async (request, fastify) => {
    const devices = global.tblDevices || [];
    // go accroding to device type and then userId at the time only one data will be saved with one device type and userId or devictype and tempCId if not logged in
    let { deviceType, userId, tempCId } = request.body;
    if (userId && typeof userId === "string") {
      let checkExist = await getIdByValue({ clientId: userId }, request, fastify);
      userId = checkExist?.clientId ?? 0;
    }
    let deviceData = devices.filter((d) => d.deviceType === deviceType && (d.userId === userId || d.tempCId === tempCId));
    if(deviceData.length > 0){
        // delete the old device data
        let ids = deviceData.map((d) => d.deviceId);
        await dltDeviceQuery(
            ids,
            fastify,
            request
        );
        global.tblDevices = global.tblDevices.filter((d) => !ids.includes(d.deviceId));
        // save the new device data
        let dData = await saveDeviceQuery(
            { ...request.body, userId },
            fastify,
            request
        );
        global.tblDevices.push(dData);
        return dData;
    }
    else {
        // save the new device data
        let dData = await saveDeviceQuery(
            { ...request.body, userId },
            fastify,
            request
        );
        global.tblDevices.push(dData);
        return dData;
    }
}

const checkPanelLoadDataService = () => {
  return global?.isAllDataLoadedInGlobal ?? false;
}

module.exports = {
    saveDeviceDataService,
    checkPanelLoadDataService
 };
