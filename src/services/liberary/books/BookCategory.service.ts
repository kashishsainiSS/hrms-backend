import { NextFunction, Response } from "express";
import {
  createBookCategory,
  findCategoryById,
  getAllBookCategory,
  getAllBookCategoryCounts,
  getAllBookCategoryTitleCounts,
  updateBookCategory,
} from "../../../repository/liberary/books/BookCategory.repository";
import mongoose from "mongoose";
import { PaginationLimit } from "../../../config/helper/constant";
import { convertIdsToObjects } from "../../../config/helper/function";

export const createBookCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await createBookCategory(
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

export const updateBookCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await updateBookCategory(
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

export const findBookCategoryByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, data, message } = await findCategoryById(
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



export const getAllBookCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllBookCategory(
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

export const getBookCategoryCountService = async(req : any , res : Response, next : NextFunction) => {
  try
  {
      req.body.company = await convertIdsToObjects(req.body.company)
      const {status, statusCode, data, message} = await getAllBookCategoryCounts(req.body)
      res.status(statusCode).send({
          message,
          data,
          status
      })
  }
  catch(err : any)
  {
      next(err)
  }
}

export const getBookCategoryTitleCountService = async(req : any , res : Response, next : NextFunction) => {
  try
  {
      req.body.company = await convertIdsToObjects(req.body.company)
      const {status, statusCode, data, message} = await getAllBookCategoryTitleCounts(req.body)
      res.status(statusCode).send({
          message,
          data,
          status
      })
  }
  catch(err : any)
  {
      next(err)
  }
}