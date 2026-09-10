const FinePayment = require("../models/FinePayment");
const Transaction = require("../models/Transaction");
const { isOwnerOrStaff } = require("../utils/helpers");

// Issue a fine directly to a member (Student or Faculty)
exports.issueFine = async (req, res, next) => {
  try {
    const { memberId, amount, reason } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Member ID and fine amount are required",
        errorCode: "MISSING_FIELDS",
      });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
        errorCode: "NOT_FOUND",
      });
    }



    const payment = await FinePayment.create({
      memberId,
      amount: Number(amount),
      reason: reason || "Manual Fee Assessment",
      status: "pending",
      collectedBy: req.user._id,
    });

    await payment.populate("memberId", "name email membershipId memberType");
    await payment.populate("collectedBy", "name");

    res.status(201).json({
      success: true,
      message: `Fine of $${amount} issued to ${member.name} successfully`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Pay fine
exports.payFine = async (req, res, next) => {
  try {
    const { transactionId, fineId } = req.body;

    if (fineId) {
      const fine = await FinePayment.findById(fineId);
      if (!fine) {
        return res.status(404).json({
          success: false,
          message: "Fine record not found",
          errorCode: "NOT_FOUND",
        });
      }
      fine.status = "paid";
      fine.paidAt = new Date();
      fine.collectedBy = req.user._id;
      await fine.save();

      return res.status(200).json({
        success: true,
        message: "Fine paid successfully",
        data: fine,
      });
    }

    if (transactionId) {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
          errorCode: "NOT_FOUND",
        });
      }

      if (transaction.fine <= 0) {
        return res.status(400).json({
          success: false,
          message: "No fine to pay for this transaction",
          errorCode: "NO_FINE",
        });
      }

      if (transaction.finePaid) {
        return res.status(409).json({
          success: false,
          message: "Fine has already been paid",
          errorCode: "FINE_ALREADY_PAID",
        });
      }

      const payment = await FinePayment.create({
        transactionId,
        memberId: transaction.memberId,
        amount: transaction.fine,
        reason: `Overdue fine for ${transaction.bookTitle || 'book loan'}`,
        collectedBy: req.user._id,
        status: "paid",
        paidAt: new Date(),
      });

      transaction.finePaid = true;
      await transaction.save();

      await payment.populate("transactionId", "bookTitle memberName dueDate returnDate fine");
      await payment.populate("memberId", "name email membershipId");
      await payment.populate("collectedBy", "name");

      return res.status(201).json({
        success: true,
        message: "Fine paid successfully",
        data: payment,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Please provide either fineId or transactionId",
      errorCode: "MISSING_FIELDS",
    });
  } catch (error) {
    next(error);
  }
};

// Waive fine (librarian/admin)
exports.waiveFine = async (req, res, next) => {
  try {
    const { transactionId, fineId, reason } = req.body;

    if (fineId) {
      const fine = await FinePayment.findById(fineId);
      if (!fine) {
        return res.status(404).json({
          success: false,
          message: "Fine record not found",
          errorCode: "NOT_FOUND",
        });
      }
      fine.status = "waived";
      fine.reason = reason || fine.reason;
      await fine.save();

      return res.status(200).json({
        success: true,
        message: "Fine waived successfully",
        data: fine,
      });
    }

    if (transactionId) {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
          errorCode: "NOT_FOUND",
        });
      }

      if (transaction.fine <= 0) {
        return res.status(400).json({
          success: false,
          message: "No fine to waive for this transaction",
          errorCode: "NO_FINE",
        });
      }

      const payment = await FinePayment.create({
        transactionId,
        memberId: transaction.memberId,
        amount: transaction.fine,
        reason: reason || `Waived overdue fine for ${transaction.bookTitle || 'book loan'}`,
        collectedBy: req.user._id,
        status: "waived",
      });

      transaction.finePaid = true;
      await transaction.save();

      await payment.populate("transactionId", "bookTitle memberName dueDate returnDate fine");
      await payment.populate("memberId", "name email membershipId");

      return res.status(200).json({
        success: true,
        message: "Fine waived successfully",
        data: payment,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Please provide either fineId or transactionId",
      errorCode: "MISSING_FIELDS",
    });
  } catch (error) {
    next(error);
  }
};

// Get fine payment history for a member
exports.getMemberFines = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    if (!isOwnerOrStaff(req.user, memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this member's fine history",
        errorCode: "FORBIDDEN",
      });
    }

    const payments = await FinePayment.find({ memberId })
      .populate("transactionId", "bookTitle dueDate returnDate fine")
      .populate("collectedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get all fine payments (librarian/admin)
exports.getAllFinePayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await FinePayment.countDocuments(query);
    const payments = await FinePayment.find(query)
      .populate("transactionId", "bookTitle memberName")
      .populate("memberId", "name email membershipId memberType")
      .populate("collectedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        payments,
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
