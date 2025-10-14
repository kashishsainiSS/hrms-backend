import { NextFunction, Response } from "express"
import mongoose from "mongoose"
import { createBookUser, getBookUsersCount } from "../../../repository/liberary/books/BookUser.repository"
import { convertIdsToObjects, createCatchError } from "../../../config/helper/function"

export const createBookUserService = async(req : any , res : Response , next : NextFunction) => {
    try
    {
        req.body.createdBy = req.userId
        req.body.company = new mongoose.Types.ObjectId(req.body.company)
        const {status, statusCode, data , message} = await createBookUser(req.body)
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

export const getBookUsersService = async(req : any , res : Response , next : NextFunction) => {
    try
    {
        req.body.company = await convertIdsToObjects(req.body.company)
        const {status, statusCode, data , message} = await getBookUsersCount(req.body)
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



