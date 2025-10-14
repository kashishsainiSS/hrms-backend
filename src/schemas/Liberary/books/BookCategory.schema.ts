import mongoose, { Schema, Document } from "mongoose";

export interface BookCategoryI extends Document {
  title: string;
  company?:mongoose.Schema.Types.ObjectId;
  description?: mongoose.Schema.Types.Mixed;
  user?:mongoose.Schema.Types.ObjectId;
  coverImage?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt : Date
}

const BookCategorySchema: Schema<BookCategoryI> = new Schema<BookCategoryI>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Company',
    required:true
  },
  coverImage: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true
  },
  description: {
    type: mongoose.Schema.Types.Mixed,
    trim: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date
  },
  deletedAt : {
    type : Date
  }
});

const BookCategoryModel = mongoose.model<BookCategoryI>("BookCategory", BookCategorySchema);
export default BookCategoryModel;
