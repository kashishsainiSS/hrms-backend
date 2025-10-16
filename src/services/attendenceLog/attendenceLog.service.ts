import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { BulkUpload, getMonthly, updateAttendanceRecord } from "../../repository/attendenceLog/attendenceLog.repository";
import { AnyARecord } from "dns";

export const bulkAttendanceUpload = async (req: Request, res: Response) => {
  try {
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "Base64 file is missing" });
    }

    // Decode Base64 and save temporarily
    const buffer = Buffer.from(file, "base64");
    const tempFile = path.join("uploads", `attendance_${Date.now()}.dat`);
    fs.writeFileSync(tempFile, buffer);

    // Read and parse .dat file
    const raw = fs.readFileSync(tempFile, "utf8");
    const lines = raw.split("\n").filter(Boolean);

    const grouped: Record<string, Record<string, Date[]>> = {};

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 3) continue;

      const empId = parts[0];
      const date = parts[1];
      const time = parts[2];
      const datetime = new Date(`${date} ${time}`);

      if (!grouped[empId]) grouped[empId] = {};
      if (!grouped[empId][date]) grouped[empId][date] = [];
      grouped[empId][date].push(datetime);
    }

    // Generate attendance entries
    const attendanceDocs: any[] = [];

    for (const empId in grouped) {
      for (const date in grouped[empId]) {
        const punches = grouped[empId][date].sort((a, b) => a.getTime() - b.getTime());
        const inTime = punches[0];
        const outTime = punches[punches.length - 1];
        const workedHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);

        const status = workedHours >= 9 ? "P" : workedHours >= 4.5 ? "H" : "A";

        attendanceDocs.push({
          empId,
          date: new Date(date),
          inTime,
          outTime,
          totalHours: Math.round(workedHours * 100) / 100,
          status,
          punches,
        });
      }
    }

    
   const result =  await BulkUpload(attendanceDocs);

    fs.unlinkSync(tempFile); // clean temp file

    return res.status(200).json({
      success: true,
      message: "Attendance uploaded successfully",
      total: attendanceDocs.length,
      data:result,
    });
  } catch (error: any) {
    console.error("bulkAttendanceUpload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



export const getMonthlyService = async (req:any, res:any) => {
  try {
    const { empId, month, year, page = 1, limit = 10 } = req.query;

    const result = await getMonthly(
      empId || null,
      parseInt(month) || null,
      parseInt(year) || null,
      parseInt(page),
      parseInt(limit)
    );

    if (result.status === "success") {
      return res.status(200).json({
        success: true,
        ...result,
      });
    }

    return res.status(404).json({
      success: false,
      message: result.message || "No data found",
    });
  } catch (error:any) {
    console.error("Error in getMonthlyService:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};



export const updateAttendanceByHR = async (req:any, res:any) => {
  try {
    const { empId, date } = req.params;
    const { status, inTime, outTime, editedBy } = req.body;

    if (!empId || !date) {
      return res.status(400).json({
        success: false,
        message: "empId and date are required",
      });
    }

    const result = await updateAttendanceRecord(empId, date, {
      status,
      inTime,
      outTime,
      editedBy,
    });

    if (result.status === "success") {
      return res.status(200).json({
        success: true,
        message: "Attendance updated successfully",
        data: result.data,
      });
    }

    return res.status(404).json({
      success: false,
      message: result.message || "Record not found",
    });
  } catch (error:any) {
    console.error("Error in updateAttendanceByHR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
