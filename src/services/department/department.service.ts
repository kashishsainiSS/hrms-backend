import { NextFunction, Response } from "express";
import {
  createDepartmentCategory,
  createDepartment,
  getCategoryDepartmentCount,
  getCategoryDepartment,
  getAllDepartment,
  deleteDepartment,
  deleteDepartmentCategory,
  updateDepartmentCategory,
  updateDepartment
} from "../../repository/department/department.repository";
import mongoose from "mongoose";

export const createDepartmentCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    const { status, data } = await createDepartmentCategory(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const updateDepartmentCategoryService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    const {status, statusCode, data , message} = await updateDepartmentCategory({...req.body,_id : req.params.id})
    return res.status(statusCode).send({
      message,
      status:status,
      data : data
    })
  }
  catch(err)
  {
    next(err)
  }
}

export const updateDepartmentService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    const {status, statusCode, data , message} = await updateDepartment({...req.body,_id : req.params.id})
    return res.status(statusCode).send({
      message,
      status:status,
      data : data
    })
  }
  catch(err)
  {
    next(err)
  }
}

export const createDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    const { status, data } = await createDepartment(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getCategoryDepartmentCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = new mongoose.Types.ObjectId(req.query.company)
    const { status, data } = await getCategoryDepartmentCount(req.body);
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getCategoryDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = 50;
    const search = req.query.search || undefined;
    const { data, status, totalPages } = await getCategoryDepartment({
      search: search,
      company: new mongoose.Types.ObjectId(req.query.company),
      page: Number(page),
      limit: Number(limit),
    });
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: {
          data,
          totalPages,
        },
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || undefined;
    const { data, status, totalPages } = await getAllDepartment({
      category: new mongoose.Types.ObjectId(req.params.category),
      search: search,
      company: new mongoose.Types.ObjectId(req.query.company),
      page: Number(page),
      limit: Number(limit),
    });
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: {
          data,
          totalPages,
        },
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const deleteDepartmentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await deleteDepartment(id);
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteDepartmentCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const { status, data } = await deleteDepartmentCategory(id);
    if (status === "success") {
      res.status(200).send({
        status: "success",
        data: data,
      });
    } else {
      res.status(400).send({
        status: "error",
        data: data,
      });
    }
  } catch (err) {
    next(err);
  }
};