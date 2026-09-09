// Client-facing "Upgrade Plan" flow (QR/bank transfer + a unique reference
// code) and its admin-side review queue. Mirrors the shape of
// services/vaultAuth.js: client endpoints read request.clientTokenInfo
// (see controller/middleware/vaultAuth.js's authorizeClient), admin
// endpoints read request.userTokenInfo (see controller/middleware/index.js's
// authorize).
const {
  getAllPlanUpgradeRequestsQuery,
  getPlanUpgradeRequestByIdQuery,
  getPendingRequestByClientQuery,
  getLatestRequestByClientQuery,
  insertPlanUpgradeRequestQuery,
  approveRequestQuery,
  rejectRequestQuery,
} = require("../repository/TablePlanUpgradeRequests");
const { findClientByIdQuery, updateClientPackageQuery } = require("../repository/TableClient");
const { insertClientActivityLogQuery } = require("../repository/TableClientActivityLog");
const { VaultActivityCodes } = require("../utilities/vaultConstants");

// GET /vault/plan/packages -- the plan picker for the Upgrade Plan screen.
// Same isActive+isDisplay filter as the public-facing package list
// elsewhere (isDisplay is the admin's "show this on the client-facing
// screens" flag, distinct from isActive), sorted the way the admin ordered
// them via displayOrder.
const getAvailablePlansService = async () => {
  return (global.tblPackages || [])
    .filter((item) => item.isActive && item.isDisplay)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
};

// Only the payment method the admin has flagged default is ever shown to a
// client -- see tblPaymentMethods' idxPaymentMethodOneDefault (at most one
// active+non-deleted default at a time).
const getDefaultPaymentMethodService = async () => {
  const method = (global.tblPaymentMethods || []).find((item) => item.isActive && item.isDefault);
  if (!method) {
    throw new Error("No payment method is configured yet -- please contact support");
  }
  return method;
};

// POST /vault/plan/upgradeRequest -- creates a PENDING request. No proof
// upload here (out of scope per the ask) -- just the plan the client wants
// and the unique transfer/reference code from their external payment.
// idxPlanUpgradeTransferCodeUnique / idxPlanUpgradeOnePendingPerClient are
// the real guarantees; the checks below just turn a constraint violation
// into a friendly error before the DB round trip.
const requestPlanUpgradeService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { packageId, transferCode } = request.body || {};

  if (!packageId || !transferCode) {
    throw new Error("packageId and transferCode are required");
  }

  const client = await findClientByIdQuery(WrClientId, fastify);
  if (!client) {
    throw new Error("Account not found");
  }

  const requestedPackage = (global.tblPackages || []).find(
    (item) => item.id === packageId && item.isActive
  );
  if (!requestedPackage) {
    throw new Error("Selected plan is not available");
  }
  if (client.packageId === packageId) {
    throw new Error("You are already on this plan");
  }

  const existingPending = await getPendingRequestByClientQuery(WrClientId, fastify);
  if (existingPending) {
    throw new Error("You already have a pending plan upgrade request");
  }

  const defaultMethod = await getDefaultPaymentMethodService();

  const requestId = await insertPlanUpgradeRequestQuery(
    {
      clientId: WrClientId,
      currentPackageId: client.packageId ?? null,
      requestedPackageId: packageId,
      paymentMethodId: defaultMethod.id,
      amount: requestedPackage.price ?? null,
      currency: requestedPackage.currency ?? null,
      transferCode: String(transferCode).trim(),
    },
    fastify
  );

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PLAN_UPGRADE_REQUESTED,
      refId: String(requestId),
      ipAddress: request.ip,
      clientId: WrClientId,
      entryName: requestedPackage.name || null,
    },
    fastify
  );

  return { requestId, status: "PENDING" };
};

// GET /vault/plan/upgradeRequest/mine -- so the Upgrade Plan screen can show
// "pending review" / "rejected: <reason>" instead of letting the client
// submit a second request while one is still outstanding.
const getMyPlanUpgradeRequestService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const latest = await getLatestRequestByClientQuery(WrClientId, fastify);
  return { request: latest };
};

// POST /vault/admin/planUpgrade/all -- staff review queue.
const getAllPlanUpgradeRequestsService = async (request, fastify) => {
  const { status, clientId, limit, offset } = request.body || {};
  const rows = await getAllPlanUpgradeRequestsQuery({ status, clientId, limit, offset }, fastify);
  return {
    rows,
    totalCount: rows[0]?.totalCount ? Number(rows[0].totalCount) : 0,
  };
};

const loadReviewer = (request) => ({
  id: request.userTokenInfo.WrUserId,
  name: request.userTokenInfo.WrUserName || null,
});

// POST /vault/admin/planUpgrade/approve -- the only place a request actually
// moves the client onto their new plan.
const approvePlanUpgradeRequestService = async (request, fastify) => {
  const { id } = request.body || {};
  if (!id) {
    throw new Error("id is required");
  }

  const planRequest = await getPlanUpgradeRequestByIdQuery(id, fastify);
  if (!planRequest) {
    throw new Error("Plan upgrade request not found");
  }
  if (planRequest.status !== "PENDING") {
    throw new Error(`This request has already been ${planRequest.status.toLowerCase()}`);
  }

  const reviewer = loadReviewer(request);
  // approveRequestQuery's WHERE also guards "wrStatus = 'PENDING'" against a
  // race with another admin reviewing the same request concurrently -- an
  // empty RETURNING means someone beat us to it since the check above.
  const updated = await approveRequestQuery(id, reviewer, fastify);
  if (!updated) {
    throw new Error("This request was already reviewed by someone else");
  }

  await updateClientPackageQuery(planRequest.clientId, planRequest.requestedPackageId, fastify);

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PLAN_UPGRADE_APPROVED,
      refId: String(id),
      ipAddress: request.ip,
      clientId: planRequest.clientId,
      entryName: reviewer.name,
    },
    fastify
  );

  return { id, status: "APPROVED" };
};

// POST /vault/admin/planUpgrade/reject
const rejectPlanUpgradeRequestService = async (request, fastify) => {
  const { id, reason } = request.body || {};
  if (!id || !reason) {
    throw new Error("id and reason are required");
  }

  const planRequest = await getPlanUpgradeRequestByIdQuery(id, fastify);
  if (!planRequest) {
    throw new Error("Plan upgrade request not found");
  }
  if (planRequest.status !== "PENDING") {
    throw new Error(`This request has already been ${planRequest.status.toLowerCase()}`);
  }

  const reviewer = loadReviewer(request);
  const updated = await rejectRequestQuery(id, reviewer, reason, fastify);
  if (!updated) {
    throw new Error("This request was already reviewed by someone else");
  }

  await insertClientActivityLogQuery(
    {
      activityType: VaultActivityCodes.PLAN_UPGRADE_REJECTED,
      refId: String(id),
      ipAddress: request.ip,
      clientId: planRequest.clientId,
      entryName: reviewer.name,
    },
    fastify
  );

  return { id, status: "REJECTED" };
};

module.exports = {
  getAvailablePlansService,
  getDefaultPaymentMethodService,
  requestPlanUpgradeService,
  getMyPlanUpgradeRequestService,
  getAllPlanUpgradeRequestsService,
  approvePlanUpgradeRequestService,
  rejectPlanUpgradeRequestService,
};
