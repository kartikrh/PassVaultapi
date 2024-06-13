const { createVendorIpQuery, deleteVendorIpQuery, updateIsActiveVendorIpQuery } = require("../repository/TableVendorIp");
const { callDataProvider, ServiceType, APIEndpointModuleType } = require("../utilities");

const getAllVendorIpervice = async (request, fastify) => {
    const {isActive} = request.body;
    let result;
    if(isActive == undefined){
        result = global.tblVendorIp;
    }else{
        result = global.tblVendorIp.filter(vendorIp => vendorIp.isActive == isActive);
    }
    return result || [];
}
const getByVendorIdervice = async (request, fastify) => {
    let {vendorId} = request.body;
    let vendorIp = await global.tblVendorIp.filter(item => item.vendorId == vendorId);
    return vendorIp || [];
}
const getByVendorIpIdService = async (request, fastify) => {
    const {vendorIpId} = request.body;
    let vendorIp = global.tblVendorIp.find(item => item.vendorIpId == vendorIpId);
    return vendorIp || {};
}
const saveVendorIpService = async (request, fastify) => {
    // validte vendor Id
    const validateVendor = await global.tblVendors.find(vendor => vendor.vendorId == request.body.vendorId);
    if (!validateVendor) {
        throw new Error("Vendor with this id not found");
    }
    // check if this ip already exists
    const validateVendorIp = await global.tblVendorIp.find(vendorIp => vendorIp.ipAddress == request.body.ipAddress && vendorIp.vendorId == request.body.vendorId);
    if (validateVendorIp) {
        throw new Error("This Vendor Ip already exists");
    }
    // create vendorIp object
    const data = await createVendorIpQuery(request.body , request,fastify);
    global.tblVendorIp.push(data);

    callDataProvider({
        vendorIpId : data.vendorIpId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorIpUpdate,
        data : data,
        type : "create"
    },fastify);
    return data;

}
const deleteVendorIpService = async (request, fastify) => {
    const {vendorIpId} = request.body;
    await deleteVendorIpQuery(vendorIpId, request, fastify);
    global.tblVendorIp = global.tblVendorIp.filter((ven)=>
        ! vendorIpId.includes(ven.vendorIpId)
    )
    callDataProvider({
        vendorIpId : vendorIpId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorIpUpdate,
        data : {
            vendorIpId : vendorIpId 
        },
        type : "delete"
    },fastify);
    return `VendorIp (s) deleted successfully`;
}
const activeInactiveVendorIpService = async (request, fastify) => {
    const {vendorIpId, isActive} = request.body;
    let index =await global.tblVendorIp.findIndex(item => item.vendorIpId == vendorIpId);
    if (index == -1) {
        throw new Error("VendorIp with this id not found");
    }
    await updateIsActiveVendorIpQuery(request.body, request, fastify);
    global.tblVendorIp[index].isActive = isActive;
    callDataProvider({
        vendorIpId : vendorIpId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorIpUpdate,
        data : global.tblVendorIp[index],
        type : "update"
    },fastify);
    
    return `VendorIp updated successfully`;
}
module.exports = {
    getByVendorIdervice,
    getByVendorIpIdService,
    saveVendorIpService,
    deleteVendorIpService,
    activeInactiveVendorIpService,
    getAllVendorIpervice
}