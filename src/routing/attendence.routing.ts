import express from "express";
import { bulkAttendanceUpload, getMonthlyService, updateAttendanceByHR } from "../services/attendenceLog/attendenceLog.service";

const router = express.Router();

// POST /attendance/bulkUpload
router.post("/bulkUpload", bulkAttendanceUpload);

router.get('/',getMonthlyService);    // eg. GET /attendance?empId=KA-1332&month=9&year=2025&page=1&limit=5
router.patch("/:empId/:date", updateAttendanceByHR);
  
export default router;
