const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("memberType").optional().isIn(["student", "faculty"]),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.get("/profile", protect, authController.getProfile);

// Librarian/Admin routes
router.get("/users", protect, authorize("librarian", "admin"), authController.getAllUsers);
router.put("/users/:id/deactivate", protect, authorize("admin"), authController.deactivateUser);

// Librarian/Admin: Create librarian account
router.post(
  "/librarian",
  protect,
  authorize("admin", "librarian"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.createLibrarian
);

module.exports = router;
