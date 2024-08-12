const {
  deleteTemplateQuery,
  updateTemplateQuery,
  insertTemplateQuery,
  activeInactiveTemplateQuery,
  setIsDefaultFalseTemplateQuery,
  updateIsDefaultQuery,
} = require("../repository/TableTemplate");

const getAllTemplateService = async (request, fastify) => {
  const { isActive } = request.body;
  if (isActive == undefined) {
    return global.tblTemplate;
  }
  return global.tblTemplate.filter((item) => item.isActive === isActive);
};

const templateByIdService = async (request, fastify) => {
  const { templateId } = request.body;
  return (
    global.tblTemplate.find((item) => item.templateId === templateId) || null
  );
};

const deleteTemplateService = async (request, fastify) => {
  const { templateId } = request.body;
  // delete the template
  await deleteTemplateQuery(templateId, request, fastify);
  global.tblTemplate = global.tblTemplate.filter(
    (item) => !templateId.includes(item.templateId)
  );
  return `Template deleted successfully`;
};

const saveTemplateService = async (request, fastify) => {
  const { templateId } = request.body;
  if (templateId === 0) {
    return await createTemplateService(request, fastify);
  } else {
    return await updateTemplateService(request, fastify);
  }
};
const createTemplateService = async (request, fastify) => {
  if(request.body.isDefault && request.body.isDefault === true){
    await setIsDefaultFalseTemplateQuery( {
      templateType: request.body.templateType,
      type: request.body.type
    },request, fastify);
    // set isdefault false for this template
    global.tblTemplate.forEach((item) => {
      if (item.templateType === request.body.templateType && item.type === request.body.type) {
        item.isDefault = false;
      }
    })
  }
  const data = await insertTemplateQuery(
    {
      ...request.body,
    },
    request,
    fastify
  );

  global.tblTemplate.push(data[0]);
  return data;
};
const updateTemplateService = async (request, fastify) => {
  // validate the templateId
  const validateTemplateId = global.tblTemplate.find(
    (item) => item.templateId === request.body.templateId
  );
  if (!validateTemplateId) {
    throw new Error("Template with this Id not found");
  }
  if(request.body.isDefault && request.body.isDefault === true){
    await setIsDefaultFalseTemplateQuery( {
      templateType: request.body.templateType,
      type: request.body.type
    },request, fastify);
    // set isdefault false for this template
    global.tblTemplate.forEach((item) => {
      if (item.templateType === request.body.templateType && item.type === request.body.type) {
        item.isDefault = false;
      }
    })
  }
  const body = {
    templateId: request.body.templateId,
    templateType: request.body.templateType || validateTemplateId.templateType,
    type: request.body.type || validateTemplateId.type,
    title: request.body.title || validateTemplateId.title,
    description: request.body.description || validateTemplateId.description,
    isActive: request.body.isActive ? request.body.isActive : validateTemplateId.isActive,
    isDefault: request.body.isDefault ? request.body.isDefault : validateTemplateId.isDefault,
  };

  await updateTemplateQuery(body, request, fastify);
  const index = global.tblTemplate.findIndex(
    (item) => item.templateId === request.body.templateId
  );
  if(index !== -1){
    global.tblTemplate[index] = body;
  }
  return body;
};

const activeInactiveTemplateService = async (request, fastify) => {
  //validate the templateId
  const { templateId, isActive } = request.body;
  const validateTemplateId = global.tblTemplate.find(
    (item) => item.templateId === templateId
  );
  if (!validateTemplateId) {
    throw new Error("Template with this Id not found");
  }
  await activeInactiveTemplateQuery(
    {
      templateId,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblTemplate.findIndex(
    (item) => item.templateId === templateId
  );
  global.tblTemplate[index].isActive = isActive;

  return `Template updated successfully`;
};
const updateIsDefaultService = async (request , fastify) =>{
  const {templateId , isDefault} = request.body;
  //validate the templateId
  const template = global.tblTemplate.find(
    (item) => item.templateId === templateId
  )
  if(!template){
    throw new Error("Template with this Id not found.")
  }
  if(isDefault){
    await setIsDefaultFalseTemplateQuery( {
      templateType: template.templateType,
      type: template.type
    },request, fastify);
    // set isdefault false for this template
    global.tblTemplate.forEach((item) => {
      if (item.templateType === template.templateType && item.type === template.type) {
        item.isDefault = false;
      }
    })
  }
  await updateIsDefaultQuery({
    templateId,
    isDefault
  } , request , fastify)
  const index = global.tblTemplate.findIndex(
    (item) => item.templateId === templateId
  )
  if(index !== -1){
    global.tblTemplate[index].isDefault = isDefault
  }
  return `Template Updated Successfully`;
}
module.exports = {
  getAllTemplateService,
  templateByIdService,
  saveTemplateService,
  deleteTemplateService,
  activeInactiveTemplateService,
  updateIsDefaultService
};
