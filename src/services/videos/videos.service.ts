import { NextFunction, Response } from "express";
import { videoCreateCategoryValidation } from "./utils/videos.validation";
import { generateError, generateValidationError } from "../../config/Error/functions";
import {
  createVideoCategory,
  getAllCategories,
  getAllVideoCategoryCount,
  getVideos,
} from "../../repository/videos.repository";
import { PaginationLimit } from "../../config/helper/constant";
import mongoose from "mongoose";

export const createVideoCategoryService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.createdBy = req.userId;
    req.body.company = req.body.company;
    const result = videoCreateCategoryValidation.validate(req.body);
    if (result.error) {
      throw generateValidationError(result.error.details, 422);
    }

    const { status, data }: any = await createVideoCategory(req.body);
    if (status === "success") {
      res.status(201).send({
        message: "Video CATEGORY CREATE SUCCESSFULLY",
        data: data,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCategoriesService = async (
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
    const { status, data } = await getAllCategories(req.body);
    if (status === "success") {
      res.status(201).send({
        data: data,
        message: "GET CATEGORIES SUCCESSFULLY",
        status: "success",
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getVideosService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.category = new mongoose.Types.ObjectId(req.query.category);
    req.body.company = new mongoose.Types.ObjectId(req.bodyData.company);
    req.body.page = req.query.page ? parseInt(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? parseInt(req.query.limit)
      : PaginationLimit;
    const { data, status } = await getVideos(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET VIDEOS SUCCESSFULLY",
        status: "success",
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCategoryVideoCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = req.bodyData.company;
    const { status, data } = await getAllVideoCategoryCount(req.body);
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data,400);
    }
  } catch (err) {
    next(err);
  }
};
