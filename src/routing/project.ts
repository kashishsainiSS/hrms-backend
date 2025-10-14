import express from "express";
import authenticate from "../modules/config/authenticate";
import { updateProjectService , createProjectService, getAllProjectsService, getSingleProjectService, createTaskService, updateTaskService, getProjectCountsService, getAllTaskService, getSingleTaskService, addProjectMembersService, findActiveUserInProjectService, verifyUserTokenProjectService } from "../services/project/project.service";
const router = express.Router();

router.post("/", authenticate, createProjectService);
router.post('/token/verify',authenticate,verifyUserTokenProjectService)
router.post('/total/count',authenticate,getProjectCountsService)
router.put('/:id',authenticate,updateProjectService);
router.put('/add/member/:id',authenticate,addProjectMembersService)
router.post('/get',authenticate,getAllProjectsService)
router.post('/individual/:projectId',authenticate,findActiveUserInProjectService)
router.get('/single/:id',authenticate,getSingleProjectService)
router.get('/task/single/:id',authenticate,getSingleTaskService)
router.post('/task/:projectId/get',authenticate,getAllTaskService)
router.post('/task/:projectId/create',authenticate,createTaskService)
router.put('/task/:taskId',authenticate,updateTaskService)

export default router;