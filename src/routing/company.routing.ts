import express from "express";
import {
  createCompany,
  createOrganisationCompany,
  filterCompany,
  updateOrganisationCompany,
} from "../modules/organisation/Company";
import { getCompanyCountService, getCompanyDetailsByNameService, getCompanyPoliciesService, getHolidayService, getIndividualPolicyService, getOrganisationsCompanyService, getWorkLocationservice, getWorkTimingService, updateCompanyPolicyService, updateHolidayExcelService, updateHolidayService, updateWorkLocationExcelService, updateWorkLocationService, updateWorkTimingService } from "../services/company/company.service";
import authenticate from "../modules/config/authenticate";
const router = express.Router();

router.post("/create", createCompany);
router.post('/single/create',authenticate,createOrganisationCompany)
router.put('/policy',authenticate,updateCompanyPolicyService)
router.put('/:id',authenticate,updateOrganisationCompany)
router.get('/count',authenticate,getCompanyCountService)
router.get('/policy',authenticate,getIndividualPolicyService)
router.get('/companies',authenticate,getOrganisationsCompanyService)
router.get("/search", filterCompany);
router.get('/details', getCompanyDetailsByNameService)
router.get('/policies',authenticate,getCompanyPoliciesService)
router.get('/policy/holidays',authenticate,getHolidayService)
router.get('/policy/workLocations',authenticate,getWorkLocationservice)
router.get('/policy/workTiming',authenticate,getWorkTimingService)
router.put('/policy/holidays',authenticate,updateHolidayService)
router.put('/policy/holidays/excel',authenticate,updateHolidayExcelService)
router.put('/policy/workTiming',authenticate,updateWorkTimingService)
router.put('/policy/workLocation',authenticate,updateWorkLocationService)
router.put('/policy/workLocations/excel',authenticate,updateWorkLocationExcelService)

export default router;