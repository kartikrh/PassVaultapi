const {
  insertSubScribeDomainQuery,
  deleteSubScribeDomainQuery,
  updateDomainStatusQuery,
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
  return await insertSubScribeDomain(request, fastify);
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
    (d) => d.siteDomain.toLowerCase() === request.body.siteDomain.toLowerCase()
  );
  // if no data found then insert
  if (domainData) {
    throw new Error("Domain already exist");
  }
  const createData = await insertSubScribeDomainQuery(request, fastify);
  global.tblSubScribesDomain.push(createData);
  return createData;
};
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
