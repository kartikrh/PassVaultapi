// Admin CRUD for tblPaymentMethods -- mirrors services/packages.js exactly:
// reads come straight off global.tblPaymentMethods (loaded once at boot by
// utilities/fetchAllData.js), writes go to the DB and then patch the same
// in-memory array so every reader stays consistent without a re-query.
const {
  insertPaymentMethodQuery,
  updatePaymentMethodQuery,
  deletePaymentMethodQuery,
  activeInactivePaymentMethodQuery,
  isDefaultChangeQuery,
  isDefaultFalseQuery,
} = require("../repository/TablePaymentMethods");

const PAYMENT_METHOD_TYPES = ["QR", "BANK"];

const validatePaymentMethodBody = (body) => {
  if (!body.type || !PAYMENT_METHOD_TYPES.includes(body.type)) {
    throw new Error(`type must be one of ${PAYMENT_METHOD_TYPES.join(", ")}`);
  }
  if (!body.label) {
    throw new Error("label is required");
  }
  if (body.type === "QR" && !body.qrImageUrl) {
    throw new Error("qrImageUrl is required for a QR payment method");
  }
  if (body.type === "BANK" && (!body.bankName || !body.accountNumber)) {
    throw new Error("bankName and accountNumber are required for a bank payment method");
  }
};

const savePaymentMethodService = async (request, fastify) => {
  validatePaymentMethodBody(request.body);
  // Always insert as non-default first -- idxPaymentMethodOneDefault allows
  // at most one active+non-deleted row with isDefault = true, so inserting
  // straight in as the new default while the current one is still true
  // would violate it. Flip it true afterward, once the old default is
  // already unset (see below).
  const saveData = await insertPaymentMethodQuery({ ...request.body, isDefault: false }, fastify, request);
  global.tblPaymentMethods.push(saveData);
  if (request.body.isDefault) {
    await isDefaultFalseQuery(saveData.id, fastify, request);
    await isDefaultChangeQuery({ id: saveData.id, isDefault: true }, request, fastify);
    saveData.isDefault = true;
    global.tblPaymentMethods.forEach((item) => {
      item.isDefault = item.id === saveData.id;
    });
  }
  return saveData;
};

const editPaymentMethodService = async (request, fastify) => {
  const validateId = global.tblPaymentMethods.find((item) => item.id == request.body.id);
  if (!validateId) {
    throw new Error("Payment method with this Id not found");
  }
  validatePaymentMethodBody(request.body);

  const wantsDefault = request.body.isDefault ?? validateId.isDefault;

  const updateData = {
    type: request.body.type,
    label: request.body.label,
    qrImageUrl: request.body.qrImageUrl ?? null,
    upiId: request.body.upiId ?? null,
    bankName: request.body.bankName ?? null,
    accountHolderName: request.body.accountHolderName ?? null,
    accountNumber: request.body.accountNumber ?? null,
    ifscCode: request.body.ifscCode ?? null,
    branch: request.body.branch ?? null,
    instructions: request.body.instructions ?? null,
    isActive: request.body.isActive ?? validateId.isActive,
    // Same reasoning as savePaymentMethodService -- never write this row's
    // isDefault straight to true here; flip it true afterward once every
    // other row is confirmed unset.
    isDefault: false,
    id: parseInt(request.body.id, 10),
  };

  const modifiedData = await updatePaymentMethodQuery(updateData, fastify, request);

  const index = global.tblPaymentMethods.findIndex((item) => item.id == request.body.id);
  if (index !== -1) {
    global.tblPaymentMethods[index] = modifiedData;
  }

  if (wantsDefault) {
    await isDefaultFalseQuery(updateData.id, fastify, request);
    await isDefaultChangeQuery({ id: updateData.id, isDefault: true }, request, fastify);
    modifiedData.isDefault = true;
    global.tblPaymentMethods.forEach((item) => {
      item.isDefault = item.id === updateData.id;
    });
  }

  return modifiedData;
};

const savePaymentMethodEntryService = async (request, fastify) => {
  if (request.body.id == 0 || !request.body.id) {
    return await savePaymentMethodService(request, fastify);
  }
  return await editPaymentMethodService(request, fastify);
};

const allPaymentMethodsService = async (request) => {
  const { isActive } = request.body || {};
  if (isActive !== undefined) {
    return global.tblPaymentMethods.filter((item) => item.isActive === isActive);
  }
  return global.tblPaymentMethods;
};

const paymentMethodByIdService = async (request) => {
  const { id } = request.body;
  return global.tblPaymentMethods.find((item) => item.id === id) || null;
};

const deletePaymentMethodService = async (request, fastify) => {
  const { id } = request.body;
  await deletePaymentMethodQuery(id, fastify, request);
  global.tblPaymentMethods = global.tblPaymentMethods.filter((item) => !id.includes(item.id));
  return `Payment method(s) deleted successfully`;
};

const activeInactivePaymentMethodService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblPaymentMethods.find((item) => item.id === id);
  if (!validateId) {
    throw new Error("Payment method with this Id not found");
  }
  await activeInactivePaymentMethodQuery({ id, isActive }, request, fastify);
  const index = global.tblPaymentMethods.findIndex((item) => item.id == id);
  if (index !== -1) {
    global.tblPaymentMethods[index].isActive = isActive;
  }
  return `Payment method updated successfully`;
};

const isDefaultChangeService = async (request, fastify) => {
  const { id, isDefault } = request.body;
  const validateId = global.tblPaymentMethods.find((item) => item.id === id);
  if (!validateId) {
    throw new Error("Payment method with this Id not found");
  }

  if (isDefault) {
    // Unset every other row FIRST -- idxPaymentMethodOneDefault rejects a
    // moment where two rows both carry isDefault = true, which is exactly
    // what setting this row true before unsetting the current default would
    // produce.
    await isDefaultFalseQuery(id, fastify, request);
    await isDefaultChangeQuery({ id, isDefault: true }, request, fastify);
    global.tblPaymentMethods.forEach((item) => {
      item.isDefault = item.id === id;
    });
  } else {
    await isDefaultChangeQuery({ id, isDefault: false }, request, fastify);
    const index = global.tblPaymentMethods.findIndex((item) => item.id == id);
    if (index !== -1) {
      global.tblPaymentMethods[index].isDefault = false;
    }
  }

  return `Payment method updated successfully`;
};

module.exports = {
  savePaymentMethodEntryService,
  allPaymentMethodsService,
  paymentMethodByIdService,
  deletePaymentMethodService,
  activeInactivePaymentMethodService,
  isDefaultChangeService,
};
