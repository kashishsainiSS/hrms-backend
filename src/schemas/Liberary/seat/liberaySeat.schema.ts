import mongoose, { Schema } from "mongoose";
import { ILibrarySeat } from "./utils/seat.interface";

const LibrarySeatSchema = new Schema<ILibrarySeat>({
    seatNumber: {
      type: String,
      required: true,
      description: 'Unique identifier for the seat'
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'LiberaryRoomSection',
      default: null,
      description: 'The section to which the seat belongs'
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      description: 'The company to which the library belongs'
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'LibraryRoom',
      required: true,
      description: 'The room to which the seat belongs'
    },
    isAvailable: {
      type: Boolean,
      default: true,
      description: 'Indicates if the seat is available or not'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'User who created the seat record'
    },
    createdAt : {
        type : Date,
        default : new Date()
    },
    updatedAt:{
        type : Date
    },
    deletedAt: {
      type: Date,
      description: 'Date when the seat was deleted (soft delete)'
    },
  });

export default mongoose.model('LibrarySeat', LibrarySeatSchema);
