const Case = require("../models/Case");

const runEscalationCheck = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await Case.updateMany(
    {
      status: { $in: ["Assigned", "In Progress", "Pending"] },
      assignedAt: { $lte: sevenDaysAgo, $ne: null },
      $or: [
        { lastCaseManagerResponseAt: null },
        { lastCaseManagerResponseAt: { $lte: sevenDaysAgo } },
      ],
    },
    { $set: { status: "Escalated" } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Escalation job: ${result.modifiedCount} cases escalated.`);
  }
};

const startEscalationJob = () => {
  setInterval(() => {
    runEscalationCheck().catch((error) => {
      console.error("Escalation job failed:", error.message);
    });
  }, 6 * 60 * 60 * 1000);

  runEscalationCheck().catch((error) => {
    console.error("Initial escalation check failed:", error.message);
  });
};

module.exports = { startEscalationJob, runEscalationCheck };
