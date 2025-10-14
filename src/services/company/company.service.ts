import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import {
  getCompanyCount,
  getCompanyDetailsByName,
  getCompanyPolicies,
  getHolidays,
  getIndividualPolicy,
  getOrganisationCompanies,
  getWorkLocations,
  getWorkTiming,
  updateCompanyPolicy,
  updateHolidayByExcel,
  updateHolidays,
  updateWorkLocations,
  updateWorkTiming,
  uploadWorkLocationsByExcel,
} from "../../repository/company/company.respository";
import { generateError } from "../../config/Error/functions";
import ExcelJS from "exceljs";

export const getCompanyPoliciesService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, data, status, statusCode } = await getCompanyPolicies({
      company: new mongoose.Types.ObjectId(req.query.company),
    });
    return res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateCompanyPolicyService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, statusCode, message, data } = await updateCompanyPolicy({
      ...req.body,
      policy: new mongoose.Types.ObjectId(req.body.policy),
      company: new mongoose.Types.ObjectId(req.body.company),
    });
    return res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getIndividualPolicyService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, statusCode, data, message } = await getIndividualPolicy({
      policy: new mongoose.Types.ObjectId(req.query.policy),
      company: new mongoose.Types.ObjectId(req.query.company),
    });
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getCompanyCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, statusCode, data, message } = await getCompanyCount(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getOrganisationsCompanyService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.companyOrg = req.bodyData.companyOrg;
    const { status, statusCode, data, message } =
      await getOrganisationCompanies(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getCompanyDetailsByNameService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode } = await getCompanyDetailsByName({
      company: req.query.company,
    });
    if (status === "success") {
      return res.status(200).send({
        message: "Company details retrieved successfully",
        data: data,
        status: "success",
      });
    } else {
      throw generateError(data, statusCode);
    }
  } catch (err: any) {
    next(err);
  }
};

export const getHolidayService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message } = await getHolidays({
      company: new mongoose.Types.ObjectId(req.query.company),
      policy: new mongoose.Types.ObjectId(req.query.policy),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getWorkLocationservice = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message } = await getWorkLocations({
      company: new mongoose.Types.ObjectId(req.query.company),
      policy: new mongoose.Types.ObjectId(req.query.policy),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getWorkTimingService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message }: any = await getWorkTiming({
      company: new mongoose.Types.ObjectId(req.query.company),
      policy: new mongoose.Types.ObjectId(req.query.policy),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateHolidayService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message } = await updateHolidays({
      ...req.body,
      company: new mongoose.Types.ObjectId(req.body.company),
      policy: new mongoose.Types.ObjectId(req.body.policy),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateHolidayExcelService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const base64String = req.body.file;
    const buffer = Buffer.from(base64String, "base64");

    const workbook: any = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    let datas: any = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        let rowData: any = {};
        row.eachCell((cell: any, colNumber: number) => {
          if (colNumber === 1) rowData.date = cell.value;
          if (colNumber === 2) rowData.title = cell.value;
          if (colNumber === 3) rowData.description = cell.value;
        });
        datas.push(rowData);
      }
    });

    const { status, data, statusCode, message } = await updateHolidayByExcel({
      holidays: datas,
      company: new mongoose.Types.ObjectId(req.body.company),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkTimingService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message } = await updateWorkTiming({
      ...req.body,
      company: new mongoose.Types.ObjectId(req.body.company),
      policy: new mongoose.Types.ObjectId(req.body.policy),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateWorkLocationService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data, statusCode, message } = await updateWorkLocations({
      ...req.body,
      policy: new mongoose.Types.ObjectId(req.body.policy),
      company: new mongoose.Types.ObjectId(req.body.company),
    });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateWorkLocationExcelService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const base64String = req.body.file;
    const buffer = Buffer.from(base64String, "base64");

    const workbook: any = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    let datas: any = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        let rowData: any = {};
        row.eachCell((cell: any, colNumber: number) => {
          if (colNumber === 1) rowData.ipAddress = cell.value;
          if (colNumber === 2) rowData.locationName = cell.value;
        });
        datas.push(rowData);
      }
    });

    const { status, data, statusCode, message } =
      await uploadWorkLocationsByExcel({
        workLocations: datas,
        company: new mongoose.Types.ObjectId(req.body.company),
      });
    return res.status(statusCode).send({
      message: message,
      data: data,
      status: status,
    });
  } catch (err: any) {
    console.log(err?.message);
    next(err);
  }
};
