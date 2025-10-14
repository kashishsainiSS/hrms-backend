import express from "express";
import authenticate from "../modules/config/authenticate";
import { createAttendenceRequestService, getAttendenceRequestsService } from "../services/attendenceRequest/attendenceRequest.service";

const router = express();

router.put("/", authenticate, createAttendenceRequestService);
router.get('/',authenticate,getAttendenceRequestsService)
export default router;