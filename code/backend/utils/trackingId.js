const Case = require("../models/Case");

const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const prefix = `NEO-${year}-`;

  const latestCase = await Case.findOne({ trackingId: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .select("trackingId");

  let serial = 1;
  if (latestCase?.trackingId) {
    const current = Number(latestCase.trackingId.split("-")[2]);
    serial = Number.isNaN(current) ? 1 : current + 1;
  }

  return `${prefix}${String(serial).padStart(3, "0")}`;
};

module.exports = { generateTrackingId };
