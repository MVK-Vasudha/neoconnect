const express = require("express");
const { register, login, getUsers } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, authorize("secretariat", "admin"), getUsers);

module.exports = router;
