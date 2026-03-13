const express = require("express");
const {
  createCase,
  getCases,
  getCaseById,
  assignCase,
  updateCaseStatus,
  getResolvedCases,
} = require("../controllers/caseController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, authorize("staff", "admin"), upload.single("file"), createCase);
router.get("/", protect, authorize("staff", "secretariat", "caseManager", "admin"), getCases);
router.get("/resolved/public", getResolvedCases);
router.get("/:id", protect, authorize("staff", "secretariat", "caseManager", "admin"), getCaseById);
router.put("/assign", protect, authorize("secretariat", "admin"), assignCase);
router.put("/update-status", protect, authorize("caseManager", "admin"), updateCaseStatus);

module.exports = router;
