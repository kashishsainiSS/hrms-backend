import express from "express";
import authenticate from "../modules/config/authenticate";
import {
  createEventExpenseService,
  getAllExpenseEventService,
  updateDocumentService,
} from "../services/EventExpense/EventExpense";

const router = express.Router();

router.post("/create", authenticate, createEventExpenseService);
router.put('/:id',authenticate,updateDocumentService)
router.get("/", authenticate, getAllExpenseEventService);
export default router;