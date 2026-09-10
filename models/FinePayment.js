const mongoose = require("mongoose");

const finePaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    reason: {
      type: String,
      default: "Library Fee Penalty",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

finePaymentSchema.index({ transactionId: 1 });
finePaymentSchema.index({ memberId: 1 });

module.exports = mongoose.model("FinePayment", finePaymentSchema);
