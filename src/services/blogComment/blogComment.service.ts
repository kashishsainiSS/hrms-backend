import { NextFunction, Response } from "express";
import {
  createBlogComment,
  getBlogComments,
} from "../../repository/blog/blogComment.repository";

export const createBlogCommentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await createBlogComment({
      user: req.userId,
      company: req.body.company,
      blog: req.params.blogId,
      content: req.body.content,
      parentComment: req.body.parentComment,
    });
    if (status === "success") {
      res.status(201).send({
        message: "COMMENT CREATED SUCCESSFULLY",
        data: data,
        success: true,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const getBlogCommentService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, data } = await getBlogComments({page : req.query.page, blogId :req.params.blogId });
    if (status === "success") {
      res.status(200).send({
        message: "GET COMMENTS SUCCESSFULLY",
        data: data,
        statusCode: 200,
        success: true,
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};
