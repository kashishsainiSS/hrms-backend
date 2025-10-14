import { NextFunction, Response } from "express"
import mongoose from "mongoose"
import { PaginationLimit } from "../../../config/helper/constant"
import { createBook, getAllBookCounts, getAllBooks, getAllBookTitleCounts, getSingleBookById, updateBook } from "../../../repository/liberary/books/LiberaryBook.repository"
import { convertIdsToObjects } from "../../../config/helper/function"

export const createBookService = async(req : any , res : Response , next : NextFunction) => {
    try
    {
        req.body.user = req.userId
        req.body.company = new mongoose.Types.ObjectId(req.body.company)
        const {status, statusCode, data , message} = await createBook(req.body)
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

export const updateBookService = async(req : any , res : Response , next : NextFunction) => {
    try
    {
        req.body.id = new mongoose.Types.ObjectId(req.params.id)
        req.body.company = new mongoose.Types.ObjectId(req.body.company)
        const {status, statusCode, data , message} = await updateBook(req.body)
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

export const getSingleBookByIdService = async(req : any , res : Response , next : NextFunction) => {
    try
    {
        req.body.id = new mongoose.Types.ObjectId(req.params.id)
        const {status, statusCode, data , message} = await getSingleBookById(req.body)
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

export const getAllBookService = async(req : any , res : Response, next : NextFunction) => {
    try
    {
        req.body.page = req.query.page ? Number(req.query.page) : 1
        req.body.limit = req.query.limit ? Number(req.query.limit) : PaginationLimit
        req.body.company = await convertIdsToObjects(req.body.company)
        const {status, statusCode, data, message} = await getAllBooks(req.body)
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

export const getBookCountService = async(req : any , res : Response, next : NextFunction) => {
    try
    {
        req.body.company = await convertIdsToObjects(req.body.company)
        const {status, statusCode, data, message} = await getAllBookCounts(req.body)
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

export const getBookTitleCountService = async(req : any , res : Response, next : NextFunction) => {
    try
    {
        req.body.company = await convertIdsToObjects(req.body.company)
        const {status, statusCode, data, message} = await getAllBookTitleCounts(req.body)
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
