import { NextFunction, Response } from "express"
import { getAllCourseCategoryCount, getCourseByCategory } from "../../repository/courses.repository"
import { generateError } from "../../config/Error/functions";
import mongoose from "mongoose";
import { PaginationLimit } from "../../config/helper/constant";
import { processCategories } from "../../config/helper/logics";
import ParentNotes from '../../schemas/Notes/ParentNotes'
import { uploadFile } from "../../repository/uploadDoc.repository";
import NotesCategory from "../../schemas/Notes/NotesCategory";
import { MainNotesCreateValidation } from "./utils/validation";

export const createMainNotes = async (req : any, res : Response, next : NextFunction) => {
    try {
      const result = MainNotesCreateValidation.validate(req.body);
      if (result.error) {
        throw generateError(result.error.details[0], 422);
      }

      req.body.company = req.bodyData.company;
      req.body.createdBy = req.userId;

      let insertedCategories: any = [];
      let { thumbnail, categories, ...rest } = req.body;
      const mainNotes = new ParentNotes({ ...rest });

      const savedmainNotes: any = await mainNotes.save();
      if (thumbnail) {
        let url = await uploadFile(thumbnail);
        savedmainNotes.thumbnail = {
          name: thumbnail.filename,
          url: url,
          type: thumbnail.type,
        };
        await savedmainNotes.save();
      }

      const processedCategories = await processCategories(
        req,
        categories,
        savedmainNotes
      );
      insertedCategories = await NotesCategory.insertMany(processedCategories);
      savedmainNotes.categories = insertedCategories;

      res.status(201).send({
        message: "CREATE Notes Category SUCCESSFULLY",
        data: { ...savedmainNotes.toObject(), category: insertedCategories },
        statusCode: 201,
        success: true,
      });
    } catch (err) {
      next(err);
    }
}

export const getCategoryCoursesCountService = async (req : any, res : Response, next : NextFunction) => {
    try
    {
        req.body.company = req.bodyData.company;
        const {status , data} = await getAllCourseCategoryCount(req.body)
        if(status === "success"){
            res.status(200).send({
                message : 'Get Courses Counts',
                data : data,
                status : 'success'
            })
        }
        else{
            throw generateError(data,400)
        }
    }
    catch(err)
    {
        next(err)
    }
}

export const getCourseByCategoryService = async (
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
      const { data, status } = await getCourseByCategory(req.body);
      if (status === "success") {
        res.status(200).send({
          data: data,
          message: "GET Courses SUCCESSFULLY",
          status: "success",
        });
      } else {
        next(data);
      }
    } catch (err) {
      next(err);
    }
}