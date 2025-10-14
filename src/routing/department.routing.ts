import express from "express";
import authenticate from "../modules/config/authenticate";
import {
  createDepartmentCategoryService,
  createDepartmentService,
  deleteDepartmentCategoryService,
  deleteDepartmentService,
  getCategoryDepartmentCountService,
  getCategoryDepartmentService,
  getDepartmentService,
  updateDepartmentCategoryService,
  updateDepartmentService,
} from "../services/department/department.service";

const router = express.Router();

router.post("/category", authenticate, createDepartmentCategoryService);
router.post("/", authenticate, createDepartmentService);
router.get("/categories", authenticate, getCategoryDepartmentService);
router.get("/:category", authenticate, getDepartmentService);
router.get(
  "/categories/count",
  authenticate,
  getCategoryDepartmentCountService
);
router.put("/category/:id", authenticate, updateDepartmentCategoryService);
router.put("/:id", authenticate, updateDepartmentService);
router.delete("/:id", authenticate, deleteDepartmentService);
router.delete('/category/:id',authenticate,deleteDepartmentCategoryService)
export default router;