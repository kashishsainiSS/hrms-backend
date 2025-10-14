import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createWebTemplateService, getWebTemplateService, updateWebTemplateService } from "../../services/webTemplateService/webTemplateService";

const router = express.Router();

router.post("/create", authenticate, createWebTemplateService);
router.get('/:slug',getWebTemplateService)
router.put('/',authenticate,updateWebTemplateService)
export default router;