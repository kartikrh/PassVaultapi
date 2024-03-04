const {
  insertSubScribeDomainQuery,
  deleteSubScribeDomainQuery,
  updateDomainStatusQuery,
  insertSubScribeSubDomainQuery,
  getDomainByIdQuery,
} = require("../repository/TableSubScibesDomain");

const allSubScribesDomainService = async (request) => {
  const { isApproved } = request.body;
  if (isApproved !== undefined) {
    const domains = global.tblSubScribesDomain.filter(
      (d) => d.isApproved === isApproved
    );
    return domains;
  }
  return global.tblSubScribesDomain;
};
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
    await deleteSubScribeDomainQuery(id, fastify);
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
        await insertSubScribeSubDomainQuery(body ,request, fastify);
    }
    const data = await getDomainByIdQuery(domainData.subScribesDomainId, fastify);
    global.tblSubScribesDomain.push(data);
    return data;
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
      await insertSubScribeSubDomainQuery(body ,request, fastify);
    }
  }
  const data = await getDomainByIdQuery(domainData.subScribesDomainId, fastify);
  // update domain
  const index = global.tblSubScribesDomain.findIndex(
    (d) => d.subScribesDomainId === domainData.subScribesDomainId
  );
  global.tblSubScribesDomain[index] = data;
  return data;
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

  return "Domain updated Successfully";
}
module.exports = {
  allSubScribesDomainService,
  subScribeDomainByIdService,
  saveSubScribeDomainService,
  deleteSubScribeDomainService,
  approveDomainService
};
