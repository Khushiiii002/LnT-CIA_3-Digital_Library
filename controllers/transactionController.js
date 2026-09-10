const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const User = require("../models/User");
const MembershipPlan = require("../models/MembershipPlan");
const Hold = require("../models/Hold");
const { calculateFine, addDays, isOwnerOrStaff } = require("../utils/helpers");

// Module 4: Issue a book
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, memberId } = req.body;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(409).json({
        success: false,
        message: "No copies available for issue",
        errorCode: "NO_COPIES_AVAILABLE",
      });
    }

    const member = await User.findById(memberId);
    if (!member || !member.isActive) {
      return res.status(404).json({
        success: false,
        message: "Member not found or inactive",
        errorCode: "MEMBER_NOT_FOUND",
      });
    }

    const plan = await MembershipPlan.findOne({
      memberType: member.memberType,
      isActive: true,
    });
    const loanDays = plan ? plan.loanDurationDays : 14;

    // Check borrowing limits
    if (plan) {
      const activeLoans = await Transaction.countDocuments({
        memberId,
        status: { $in: ["issued", "overdue"] },
      });

      if (activeLoans >= plan.maxBooksAllowed) {
        return res.status(409).json({
          success: false,
          message: `Member has reached the maximum borrowing limit of ${plan.maxBooksAllowed} books`,
          errorCode: "BORROWING_LIMIT_REACHED",
        });
      }
    }

    // Check for duplicate issue
    const existingTransaction = await Transaction.findOne({
      bookId,
      memberId,
      status: { $in: ["issued", "overdue"] },
    });

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message: "Member already has this book issued",
        errorCode: "DUPLICATE_ISSUE",
      });
    }

    const issueDate = new Date();
    const dueDate = addDays(issueDate, loanDays);

    const transaction = await Transaction.create({
      bookId,
      memberId,
      issuedBy: req.user._id,
      issueDate,
      dueDate,
      status: "issued",
      bookTitle: book.title,
      memberName: member.name,
    });

    book.availableCopies -= 1;
    await book.save();

    // Fulfill any pending hold for this book by this member
    const pendingHold = await Hold.findOne({
      bookId,
      memberId,
      status: "pending",
    });
    if (pendingHold) {
      pendingHold.status = "fulfilled";
      await pendingHold.save();
    }

    await transaction.populate("bookId", "title author isbn");
    await transaction.populate("memberId", "name email membershipId");
    await transaction.populate("issuedBy", "name");

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Module 5: Return a book
exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (req.user.role === "member" && transaction.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to return this transaction",
        errorCode: "FORBIDDEN",
      });
    }

    if (transaction.status === "returned") {
      return res.status(409).json({
        success: false,
        message: "Book has already been returned",
        errorCode: "ALREADY_RETURNED",
      });
    }

    const returnDate = new Date();
    transaction.returnDate = returnDate;
    transaction.status = "returned";

    // Calculate fine using the member's own membership plan
    if (returnDate > transaction.dueDate) {
      const member = await User.findById(transaction.memberId);
      const plan = await MembershipPlan.findOne({
        memberType: member ? member.memberType : "student",
        isActive: true,
      });
      const finePerDay = plan ? plan.finePerDay : 2;
      transaction.fine = calculateFine(transaction.dueDate, returnDate, finePerDay);
    }

    await transaction.save();

    // Update book availability
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    // Fulfill pending holds
    const nextHold = await Hold.findOne({
      bookId: transaction.bookId,
      status: "pending",
    }).sort({ requestedAt: 1 });

    if (nextHold) {
      nextHold.status = "fulfilled";
      await nextHold.save();
    }

    await transaction.populate("bookId", "title author isbn");
    await transaction.populate("memberId", "name email membershipId");

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Module 11: Member borrowing history
exports.getMemberHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const memberId = req.params.id;

    if (!isOwnerOrStaff(req.user, memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this member's borrowing history",
        errorCode: "FORBIDDEN",
      });
    }

    const query = { memberId };

    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate("bookId", "title author isbn category")
      .populate("issuedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all transactions (librarian/admin)
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, bookId, memberId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bookId) query.bookId = bookId;
    if (memberId) query.memberId = memberId;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate("bookId", "title author isbn")
      .populate("memberId", "name email membershipId")
      .populate("issuedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single transaction
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("bookId", "title author isbn category")
      .populate("memberId", "name email membershipId")
      .populate("issuedBy", "name");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (!isOwnerOrStaff(req.user, transaction.memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this transaction",
        errorCode: "FORBIDDEN",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};
