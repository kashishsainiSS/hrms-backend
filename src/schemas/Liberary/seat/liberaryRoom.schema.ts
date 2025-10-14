import mongoose, { Schema } from "mongoose";
import { ILibraryRoom } from "./utils/seat.interface";

const LibraryRoomSchema = new Schema<ILibraryRoom>({
  title: {
    type: String,
    required: true,
    description: "The name of the library room",
  },
  sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "LibrarySection",
      description: "Array of sections in the room",
    },
  ],
  description:{
    type : mongoose.Schema.Types.Mixed
  },
  ratings: {
    type : String
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    description: "The company to which the library belongs",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    description: "User who created the room record",
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
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
    description: "Date when the room was deleted (soft delete)",
  },
});

export default mongoose.model("LiberaryRoom", LibraryRoomSchema);
