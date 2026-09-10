const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const fineController = require("../controllers/fineController");

// Issue a fine directly to a member
router.post(
  "/issue",
  protect,
  authorize("librarian", "admin"),
  [
    body("memberId").notEmpty().withMessage("Member ID is required"),
    body("amount").isNumeric().withMessage("Valid amount is required"),
  ],
  validate,
  fineController.issueFine
);

router.post(
  "/pay",
  protect,
  fineController.payFine
);

router.post(
  "/waive",
  protect,
  authorize("librarian", "admin"),
  fineController.waiveFine
);

router.get("/member/:memberId", protect, fineController.getMemberFines);
router.get("/", protect, authorize("librarian", "admin"), fineController.getAllFinePayments);

module.exports = router;
