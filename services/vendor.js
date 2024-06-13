
const { createVendorQuery, deleteVendorQuery, updateIsActiveVendorQuery, updateIsIPCheckQuery, updateVendorQuery } = require("../repository/TableVendor");
const { genrateKey, callDataProvider, ServiceType, APIEndpointModuleType } = require("../utilities");

const getAllVendorService = async(request , fastify) => {
    const {isActive} = request.body;
    let result;
    if(isActive == undefined){
        result = global.tblVendors;
    }
    else{
        result = global.tblVendors.filter((item) => item.isActive === isActive);
    }
    return result || [];
}
const getVendorByIdService = async(request , fastify) => {
    const {vendorId} = request.body;
    const result = global.tblVendors.find((item) => item.vendorId === vendorId);
    return result || null;
}
const saveVendorService = async(request , fastify) => {
    const {vendorId} = request.body;
    if(vendorId == 0){
        return await createVendorService(request , fastify);    
    }
    else{
        return await updateVendorService(request , fastify);
    }
}
const createVendorService = async(request , fastify) => {
    // check if the name already exists
    let {name} = request.body;
    name = name.trim();
    const validateVendorName = global.tblVendors.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if(validateVendorName){
        throw new Error("Vendor with this name already exists");
    }
    let key = genrateKey();
    while(global.tblVendors.find((item) => item.key === key)){
        key = genrateKey();
    }

    const body = {
        ...request.body,
        name : name,
        key : key,
    }
    const data = await createVendorQuery(body,request , fastify);

    global.tblVendors.push(data);

    callDataProvider({
        vendorId : data.vendorId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorUpdate,
        data : data,
        type : "create"
    })
    return data;
}
const updateVendorService = async(request , fastify) => {
    //validate vendor id
    const {vendorId,name} = request.body;
    const validateVendorId = global.tblVendors.find((item) => item.vendorId === vendorId);
    if(!validateVendorId){
        throw new Error("Vendor with this id not found");
    }
    // check if the name already exists
    const validateVendorName = global.tblVendors.find((item) => item.name.toLowerCase() === name.trim().toLowerCase() 
    && item.vendorId !== vendorId);

    if(validateVendorName){
        throw new Error("Vendor with this name already exists");
    }
    const body = {
        vendorId : vendorId,
        name : name.trim(),
        key : validateVendorId.key,
        subscriptionDate :request.body.subscriptionDate || validateVendorId.subscriptionDate,
        expiryDate : request.body.expiryDate || validateVendorId.expiryDate,
        isActive : request.body.hasOwnProperty("isActive") ? request.body.isActive : validateVendorId.isActive,
        isIPCheck : request.body.hasOwnProperty("isIPCheck") ? request.body.isIPCheck : validateVendorId.isIPCheck,
    }

    const data = await updateVendorQuery(body,request , fastify);

    const index = global.tblVendors.findIndex((item) => item.vendorId === vendorId);
    global.tblVendors[index] = data;
    callDataProvider({
        vendorId : data.vendorId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorUpdate,
        data : data,
        type : "update"
    })
    return data;
}
const deleteVendorService = async(request , fastify) => {
    const {vendorId} = request.body;
    await deleteVendorQuery(vendorId,request , fastify);
    global.tblVendors = global.tblVendors.filter((item) => 
        !vendorId.includes(item.vendorId)
    );
    global.tblVendorIp = global.tblVendorIp.filter((item) =>
        !vendorId.includes(item.vendorId)
    );

    callDataProvider({    
        vendorId :vendorId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorUpdate,
        data : {
            vendorId : vendorId
        },    
        type : "delete"
    })

    return `Vendor(s) deleted successfully`;
}
const activeInactiveVendorService = async(request , fastify) => {
    const {vendorId,isActive} = request.body;
   
    const index = global.tblVendors.findIndex((item) => item.vendorId === vendorId);
    if(index === -1){
        throw new Error("Vendor with this id not found");
    }
    const data = await updateIsActiveVendorQuery(request.body,request , fastify);

    global.tblVendors[index].isActive = request.body.isActive;
    callDataProvider({    
        vendorId :vendorId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorUpdate,
        data : data,    
        type : "update"
    })
    return `Vendor status updated successfully`;
}
const updateIsIPCheckService = async(request , fastify) => {
    const {vendorId,isIPCheck} = request.body;
    const index = global.tblVendors.findIndex((item) => item.vendorId === vendorId);
    if(index === -1){
        throw new Error("Vendor with this id not found");
    }
    await updateIsIPCheckQuery(request.body,request , fastify);
    global.tblVendors[index].isIPCheck = isIPCheck;

    callDataProvider({
        vendorId : vendorId,
        serviceType : ServiceType.dataProviderAPI,
        moduleType : APIEndpointModuleType.vendorUpdate,
        data : global.tblVendors[index],
        type : "update"
    })
    return `Vendor updated successfully`;
}
module.exports = {
    getAllVendorService,
    getVendorByIdService,
    saveVendorService,
    deleteVendorService,
    activeInactiveVendorService,
    updateIsIPCheckService
}