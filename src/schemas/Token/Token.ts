import mongoose, { Schema, Document } from "mongoose";

export interface IEmailToken extends Document {
  userId: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  metaData:mongoose.Schema.Types.Mixed;
  token: string;
  type: string;
  is_active:boolean;
  createdAt: Date;
  deletedAt:Date
}

const Token: Schema<IEmailToken> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company : {
    type : Schema.Types.ObjectId,
    ref : 'Company'
  },
  type: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  is_active:{
    type : Boolean,
    default : false
  },
  metaData : {
    type : mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deletedAt : {
    type : Date
  }
});

export default mongoose.model<IEmailToken>(
  "Token",
  Token
);