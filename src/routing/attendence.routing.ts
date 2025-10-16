import express from "express";
import { bulkAttendanceUpload, getMonthlyService } from "../services/attendenceLog/attendenceLog.service";

const router = express.Router();

// POST /attendance/bulkUpload
router.post("/bulkUpload", bulkAttendanceUpload);
router.get('/',getMonthlyService);

export default router;
