import mongoose, { Schema } from "mongoose";
import { ILibrarySection } from "./utils/seat.interface";

const LibrarySectionSchema = new Schema<ILibrarySection>({
  sectionName: {
    type: String,
    required: true,
    description: "Name of the section in the room",
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "LibraryRoom",
    required: true,
    description: "The room to which the section belongs",
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    description: 'The company to which the library belongs'
  },
  seats: [
    {
      type: Schema.Types.ObjectId,
      ref: "LibrarySeat",
      description: "Array of seats in the section",
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive", "under_maintenance"],
    default: "active",
    description: "Status of the section",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    description: "User who created the section record",
  },
  deletedAt: {
    type: Date,
    description: "Date when the section was deleted (soft delete)",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

export default mongoose.model('LiberaryRoomSection',LibrarySectionSchema);
