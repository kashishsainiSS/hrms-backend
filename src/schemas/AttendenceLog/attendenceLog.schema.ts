import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    empId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    inTime: Date,
    outTime: Date,
    workedHours: Number,
    status: { type: String, enum: ["P", "A", "H", "WO", "L", "WFH", "CL"], default: "A" },
    rawPunches: [Date],
    editedBy: String,
  },
  { timestamps: true }
);

export default mongoose.model("attendance_logs", attendanceSchema);
