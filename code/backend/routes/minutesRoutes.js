const express = require("express");
const { uploadMinutes, getMinutes } = require("../controllers/minutesController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, authorize("secretariat", "admin"), upload.single("file"), uploadMinutes);
router.get("/", getMinutes);

module.exports = router;
