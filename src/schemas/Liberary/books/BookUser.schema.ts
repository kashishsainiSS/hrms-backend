import mongoose, { model, Schema } from "mongoose";

const BookUserSchema = new Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LibraryBook",
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  borrowCondition: {
    type: String,
    enum: ["new", "good", "worn", "damaged"],
    default: "good",
    required: true
  },
  returnCondition: {
    type: String,
    enum: ["new", "good", "worn", "damaged"]
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  borrowDuration: {
    type: Number,
    default: 14,
    required: true
  },
  maxRenewals: {
    type: Number,
    default: 2
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  renewals: [
    {
      renewalDate: { type: Date, default: Date.now },
      newDueDate: { type: Date, required: true },
      payment: {
        amount: { type: Number },
        paid: { type: Boolean, default: false },
        paymentDate: { type: Date },
        details: { type: String },
      },
      details: { type: String },
    },
  ],
  auditTrail: [
    {
      action: { type: String, required: true },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    },
  ],
});

export default model("LibraryBookUser", BookUserSchema);
