const express = require("express");
const { body, query } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { 
  searchBooks, 
  getAllBooks, 
  getBook, 
  addBook, 
  updateBook, 
  deleteBook 
} = require("../controllers/bookController");

const router = express.Router();
const adminAuth = [protect, authorize("librarian", "admin")];

// Search Route
router.get(
  "/search",
  [
    query(["title", "author", "category"]).optional().isString(),
    query("available").optional().isBoolean(),
  ],
  validate,
  searchBooks
);

// Collection Routes
router.route("/")
  .get(getAllBooks)
  .post(
    adminAuth,
    [
      body(["title", "author", "isbn", "category"]).notEmpty().withMessage("Required field"),
      body("totalCopies").isInt({ min: 1 }).withMessage("Total copies must be at least 1"),
    ],
    validate,
    addBook
  );

// Resource Routes
router.route("/:id")
  .get(getBook)
  .put(adminAuth, updateBook)
  .delete(adminAuth, deleteBook);

module.exports = router;
