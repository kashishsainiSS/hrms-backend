import mongoose, { Schema, Document } from "mongoose";

enum TransactionType {
  ISSUE = 'issue',
  RETURN = 'return'
}

enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending'
}

interface Fine {
  amount: number;
  reason?: string;
}

interface Payment {
  paymentDate: Date;
  amount: number;
  method: 'cash' | 'credit' | 'online';
  transactionId?: string;
}

export interface TransactionInterface extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  copyId: string;
  transactionType: TransactionType;
  transactionDate: Date;
  dueDate?: Date;
  returnDate?: Date;
  fineDetails?: Fine;
  paymentHistory?: Payment[];
  overdueStatus?: boolean;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema: Schema<TransactionInterface> = new Schema<TransactionInterface>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'LiberaryBook',
    required: true
  },
  copyId: {
    type: String
  },
  transactionType: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  transactionDate: {
    type: Date,
    default: new Date()
  },
  dueDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  fineDetails: {
    amount: {
      type: Number,
      default: 0
    },
    reason: {
      type: String
    }
  },
  paymentHistory: [
    {
      paymentDate: {
        type: Date,
        default: Date.now
      },
      amount: {
        type: String,
        required: true
      },
      method: {
        type: String,
        enum: ['cash', 'credit', 'online'],
        required: true
      },
      transactionId: {
        type: String
      }
    }
  ],
  overdueStatus: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date
  }
});

const BookTransactionModel = mongoose.model<TransactionInterface>("BookTransaction", TransactionSchema);
export default BookTransactionModel;