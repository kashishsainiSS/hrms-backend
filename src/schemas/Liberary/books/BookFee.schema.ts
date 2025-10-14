import mongoose, { Schema, Document } from "mongoose";

enum FeeType {
  LATE_FEE = 'late_fee',
  DAMAGE_FEE = 'damage_fee',
  PROCESSING_FEE = 'processing_fee'
}

export interface FeeInterface extends Document {
  transactionId: Schema.Types.ObjectId;
  amount: string;
  feeType: FeeType;
  reason?: {
    code: string;
    description?: string;
  };
  paid: boolean;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

const BookFeeSchema: Schema<FeeInterface> = new Schema<FeeInterface>({
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'BookTransaction',
    required: true,
    index: true
  },
  amount: {
    type: String
  },
  feeType: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    code: {
      type: String,
      enum: ['EXCESSIVE_DELAY', 'BOOK_DAMAGE', 'PROCESSING_ERROR'],
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  paid: {
    type: Boolean,
    default: false
  },
  paymentDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date
  },
});

const BookFeeModel = mongoose.model<FeeInterface>("BookFee", BookFeeSchema);
export default BookFeeModel;