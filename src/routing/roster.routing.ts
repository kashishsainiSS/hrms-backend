import express from "express";
import multer from "multer";
import {BulkRosterUpload,CreateRosterService,getAllRoster } from "../services/roster/roster.service";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/bulkUpload", BulkRosterUpload);
router.post("/create",CreateRosterService);
router.get("/", getAllRoster);
// router.patch("/editStatus", editRosterStatus);

export default router;
