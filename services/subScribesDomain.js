const {
  insertSubScribeDomainQuery,
  deleteSubScribeDomainQuery,
  updateDomainStatusQuery,
  insertSubScribeSubDomainQuery,
  getDomainByIdQuery,
  updateActiveInactiveVideoApprovedQuery,
} = require("../repository/TableSubScibesDomain");
const { callClientAPI, APIEndpointModuleType, ServiceType } = require("../utilities");

const allSubScribesDomainService = async (request) => {
  const { isApproved, isVideoApproved } = request.body;
  let result = global.tblSubScribesDomain;
  if (isApproved !== undefined) {
    result = result.filter(
      (d) => d.isApproved === isApproved
    );
  }
  if (isVideoApproved !== undefined) {
    result = result.filter(
      (d) => d.isVideoApproved === isVideoApproved
    );
  }
  return result.sort((a, b) => b.createdDate - a.createdDate);
};
const getAllSubDomainDataService = async (request) => {
  return global.tblSubScribesSubDomain;
};
const insertSubDomainsService = async (request,fastify) => {
  let domainData = global.tblSubScribesDomain.find(
    (d) => d.subScribesDomainId == request.body.subScribesDomainId
  );
  const subDomainInDB =  global.tblSubScribesSubDomain.filter(
      (d) => d.subScribesDomainId === domainData.subScribesDomainId
  ).map((d) => d.siteSubDomain.toLowerCase());

  const newSubDomain = request.body.subDomains.filter(
    (d) => !subDomainInDB.includes(d.toLowerCase())
  );
  let subDomain;
  if(request.body.subDomains && request.body.subDomains.length > 0){
      const body = {
        subScribesDomainId: domainData.subScribesDomainId,
        subDomains: newSubDomain,
      };
      subDomain = await insertSubScribeSubDomainQuery(body ,request, fastify);
      global.tblSubScribesSubDomain.push(...subDomain);
  }
  // const subDomain = await insertSubScribeSubDomainQuery(request.body ,request, fastify);
  // global.tblSubScribesSubDomain.push(...subDomain);  
  domainData.subDomains = global.tblSubScribesSubDomain.filter(
    (d) => d.subScribesDomainId === domainData.subScribesDomainId
  );
  domainData.subDomainCount = domainData.subDomains.length;
  const index = global.tblSubScribesDomain.findIndex(
    (d) => d.subScribesDomainId === domainData.subScribesDomainId
  );
  global.tblSubScribesDomain[index] = domainData;
  return subDomain;
}
const insertDomainsService = async (request,fastify) => {
  // check if domain exist
  let domainData = global.tblSubScribesDomain.find(
    (d) => d.siteDomain?.toLowerCase() === request.body.siteDomain?.toLowerCase()
  );
  let subDomainData;
  if (!domainData) {
    domainData = await insertSubScribeDomainQuery(request, fastify);
    if(request.body.subDomains && request.body.subDomains.length > 0){
        const body = {
          subScribesDomainId: domainData.subScribesDomainId,
          subDomains: request.body.subDomains,
        };
        subDomainData = await insertSubScribeSubDomainQuery(body ,request, fastify);
        global.tblSubScribesSubDomain.push(
          ...subDomainData
        );
    }
    domainData.subDomains = global.tblSubScribesSubDomain.filter(
      (d) => d.subScribesDomainId === domainData.subScribesDomainId
    );
    domainData.subDomainCount = domainData.subDomains.length;
    global.tblSubScribesDomain.push(domainData);
    // const data = await getDomainByIdQuery(domainData.subScribesDomainId, fastify);
    // return data;
    return {
      domainData,
      subDomainData
    };
  }
  else {
    return null;
  }
}
const subScribeDomainByIdService = async (request) => {
  const { subScribesDomainId } = request.body;
  const result = global.tblSubScribesDomain.find(
    (d) => d.subScribesDomainId === subScribesDomainId
  );
  return result || null;
};
const saveSubScribeDomainService = async (request, fastify) => {
  // check if domain exist
  let domainData = global.tblSubScribesDomain.find(
    (d) => d.siteDomain?.toLowerCase() === request.body.siteDomain?.toLowerCase()
  );
  if(domainData){
    await insertSubScribeDomain(request, fastify);
    return {
      isApproved: domainData.isApproved,
    };
  }
  else{
    await insertSubScribeDomain(request, fastify);
    return {
      isApproved: false,
    }
  }
};
const deleteSubScribeDomainService = async (request, fastify) => {
  const { subScribesDomainId } = request.body;
  for (const id of subScribesDomainId) {
    await deleteSubScribeDomainQuery(id, fastify, request);
  }
  global.tblSubScribesDomain = global.tblSubScribesDomain.filter(
    (d) => !subScribesDomainId.includes(d.subScribesDomainId)
  );
  return "Domains Deleted Successfully";
};
const insertSubScribeDomain = async (request, fastify) => {
  // check if domain exist
  let domainData = global.tblSubScribesDomain.find(
    (d) => d.siteDomain?.toLowerCase() === request.body.siteDomain?.toLowerCase()
  );

  if (!domainData) {
    domainData = await insertSubScribeDomainQuery(request, fastify);
    if(request.body.subDomains && request.body.subDomains.length > 0){
        const body = {
          subScribesDomainId: domainData.subScribesDomainId,
          subDomains: request.body.subDomains,
        };
        const subDomainData = await insertSubScribeSubDomainQuery(body ,request, fastify);
        global.tblSubScribesSubDomain.push(
          ...subDomainData
        );
    }
    domainData.subDomains = global.tblSubScribesSubDomain.filter(
      (d) => d.subScribesDomainId === domainData.subScribesDomainId
    );
    domainData.subDomainCount = domainData.subDomains.length;
    global.tblSubScribesDomain.push(domainData);
    // const data = await getDomainByIdQuery(domainData.subScribesDomainId, fastify);
    // return data;
    return domainData;
  }
  // check if domain exist but any subDomains is new
  if(request.body.subDomains && request.body.subDomains.length > 0){
    // check which subDomains is new
    const subDomainInDB = global.tblSubScribesSubDomain.filter(
      (d) => d.subScribesDomainId === domainData.subScribesDomainId
    ).map((d) => d.siteSubDomain.toLowerCase());

    const newSubDomain = request.body.subDomains.filter(
      (d) => !subDomainInDB.includes(d.toLowerCase())
    );
    if(newSubDomain.length > 0){
      const body = {
        subScribesDomainId: domainData.subScribesDomainId,
        subDomains: newSubDomain,
      };
      const subDomain = await insertSubScribeSubDomainQuery(body ,request, fastify);
      global.tblSubScribesSubDomain.push(...subDomain);    
    }
  }
  // const data = await getDomainByIdQuery(domainData.subScribesDomainId, fastify);
  // update domain
  // const index = global.tblSubScribesDomain.findIndex(
  //   (d) => d.subScribesDomainId === domainData.subScribesDomainId
  // );
  // global.tblSubScribesDomain[index] = data;
  // return data;
  domainData.subDomains = global.tblSubScribesSubDomain.filter(
    (d) => d.subScribesDomainId === domainData.subScribesDomainId
  );
  domainData.subDomainCount = domainData.subDomains.length;
  const index = global.tblSubScribesDomain.findIndex(
    (d) => d.subScribesDomainId === domainData.subScribesDomainId
  );
  global.tblSubScribesDomain[index] = domainData;
  return domainData;
}
const approveDomainService = async (request, fastify) => {
  // validate domain
  const index = global.tblSubScribesDomain.findIndex(
    (d) => d.subScribesDomainId === request.body.subScribesDomainId
  );
  if (index == -1) {
    throw new Error("Domain not found");
  }

  // update domain
  await updateDomainStatusQuery(request, fastify);

  global.tblSubScribesDomain[index].isApproved = request.body.isApproved;

  await callClientAPI(
    {
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        data : {
          subScribesDomainId: request.body.subScribesDomainId,
          isApproved: request.body.isApproved,
        },
        type: "isApproved",
        module : "subScribesDomain"
      },
    },
    request,
    fastify,
    "services/subScribesDomain.js/approveDomainService"
  );
  return "Domain updated Successfully";
}

const activeInactiveVideoApprovedService = async (request, fastify) => {
  const index = global.tblSubScribesDomain.findIndex(
    (d) => d.subScribesDomainId === request.body.subScribesDomainId
  );
  if (index == -1) {
    throw new Error("Domain not found");
  }

  await updateActiveInactiveVideoApprovedQuery(request, fastify);

  global.tblSubScribesDomain[index].isVideoApproved = request.body.isVideoApproved;

  await callClientAPI(
    { 
      serviceType: ServiceType.clientAPI,
      moduleType: APIEndpointModuleType.updateSeoModule,
      data: {
        data : {
          subScribesDomainId: request.body.subScribesDomainId,
          isVideoApproved: request.body.isVideoApproved,
        },
        type: "isVideoApproved",
        module : "subScribesDomain"
      },
    },
    request,
    fastify,
    "services/subScribesDomain.js/activeInactiveVideoApprovedService"
  );
  return "Video approved updated Successfully";
}

module.exports = {
  allSubScribesDomainService,
  subScribeDomainByIdService,
  saveSubScribeDomainService,
  deleteSubScribeDomainService,
  approveDomainService,
  activeInactiveVideoApprovedService,
  getAllSubDomainDataService,
  insertSubDomainsService,
  insertDomainsService
};
