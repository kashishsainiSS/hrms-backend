import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import { generateError } from "../../config/Error/functions";
import {
  getAllQuiz,
  getAllQuizCategoryCount,
} from "../../repository/quiz.repository";
import { PaginationLimit } from "../../config/helper/constant";
import {
  createCategory,
  getAllCategory,
  updateCategory,
} from "../../repository/quiz/quiz.repository";

export const createQuizCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.createdBy = req.userId;
    const { status, statusCode, data, message } = await createCategory(
      req.body
    );
    return res.status(statusCode).send({
      status,
      statusCode,
      data,
      message,
    });
  } catch (err: any) {
    return res.status(500).send({
      message: "Server Internal Error",
      data: err?.message,
    });
  }
};

export const updateCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    req.body["updatedAt"] = new Date();
    const { status, statusCode, data, message } = await updateCategory(
      req.body
    );
    res.status(statusCode).send({
      data,
      message,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllCategoryService = async (req: any, res: Response) => {
  try {
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit ? Number(req.query.limit) : 10;
    const { status, statusCode, data, message } = await getAllCategory(
      req.body
    );
    return res.status(statusCode).send({
      status,
      data,
      message,
    });
  } catch (err: any) {
    return res.status(500).send({
      status: "erorr",
      data: err?.message,
      message: "Server Interval error",
    });
  }
};

export const getAllQuizService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = req.bodyData.company;
    req.body.page = req.query.page ? parseInt(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? parseInt(req.query.limit)
      : PaginationLimit;
    const { status, data } = await getAllQuiz(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Quiz SUCCESSFULLY",
        status: "success",
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCategoryQuizCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = req.bodyData.company;
    const { status, data } = await getAllQuizCategoryCount(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err) {
    next(err);
  }
};
