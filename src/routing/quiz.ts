import express from "express";
import authenticate from "../modules/config/authenticate";
import { createQuizCategoryService, getAllCategoryService, updateCategoryService } from "../services/quiz/quiz.service";

const router = express();

router.post("/category", authenticate, createQuizCategoryService);
router.post('/category/get',authenticate,getAllCategoryService)
router.put('/category/:id',authenticate,updateCategoryService)
// router.post("/category/create", authenticate, createQuizCategory);
// router.post('/question/create',authenticate,createQuestion)
// router.get("/questions/:category", getQuestionsByCategory);
// router.get('/categoryQuizcounts',authenticate, getAllCategoryQuizCountService)

export default router;