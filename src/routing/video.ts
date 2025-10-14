import express from "express";
import {
  createVideo,
} from "../modules/videos/videos";
import authenticate from "../modules/config/authenticate";
import { createVideoCategoryService, getAllCategoriesService, getAllCategoryVideoCountService, getVideosService } from "../services/videos/videos.service";

const router = express.Router();

router.post("/create", authenticate, createVideo);
router.post("/category", authenticate, createVideoCategoryService);
router.get("/", authenticate, getVideosService);
router.get('/categories',authenticate,getAllCategoriesService)
router.get('/categoryVideoscounts',authenticate, getAllCategoryVideoCountService)

export default router;