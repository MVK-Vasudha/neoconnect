const express = require("express");
const { createPoll, getPolls, votePoll } = require("../controllers/pollController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("secretariat", "admin"), createPoll);
router.get("/", protect, authorize("staff", "secretariat", "caseManager", "admin"), getPolls);
router.post("/vote", protect, authorize("staff"), votePoll);

module.exports = router;
