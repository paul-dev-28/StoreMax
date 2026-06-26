const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const protect = require("../middleware/auth");

// POST /api/auth/register  →  create a new user account
router.post("/register", registerUser);

// POST /api/auth/login     →  authenticate and return JWT
router.post("/login", loginUser);

// GET /api/auth/profile    →  protected test route (requires valid Bearer token)
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected Route Access Granted",
    user: req.user,            // { id: "..." } attached by protect middleware
  });
});

module.exports = router;
