import mongoose, { Schema } from "mongoose";

const ReservationSchema = new Schema({
  seat: {
    type: Schema.Types.ObjectId,
    ref: "LibrarySeat",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    description: 'The company to which the library belongs'
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: false,
  },
  endTime: {
    type: Date,
    required: false,
  },
  fullDay: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

export default mongoose.model("LibrarySeatReservation", ReservationSchema);
