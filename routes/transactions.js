const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

router.post(
  "/issue",
  protect,
  authorize("librarian", "admin"),
  [
    body("bookId").notEmpty().withMessage("Book ID is required"),
    body("memberId").notEmpty().withMessage("Member ID is required"),
  ],
  validate,
  transactionController.issueBook
);

router.put(
  "/:id/return",
  protect,
  transactionController.returnBook
);

router.get(
  "/member/:id",
  protect,
  transactionController.getMemberHistory
);

router.get("/", protect, authorize("librarian", "admin"), transactionController.getAllTransactions);
router.get("/:id", protect, transactionController.getTransaction);

module.exports = router;
