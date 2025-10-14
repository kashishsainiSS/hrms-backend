import { Response } from "express";
import { createEventExpense, getAllEventExpense, getSingleEventExpense, updateEventExpense } from "../../repository/EventExpense.repository";
import { generateError } from "../../config/Error/functions";

export const createEventExpenseService = async (req : any, res : Response) => {
    try
    {
        req.body.createdBy = req.userId
        req.body.company = req.bodyData.company
        if(Array.isArray(req?.body?.approvals)){
            req.body.approvals[0] = {
                ...req.body.approvals[0],
                approvedBy : req.userId
            }
        }

        const {status, data} = await createEventExpense(req.body)
        if(status === "success"){
            res.status(201).send({status : status, data : data})
        }
    }
    catch(err : any)
    {
        res.status(500).send({status : 'error', data : err.message})
    }
}

export const updateDocumentService = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, bodyData } = req;
        const { company } = bodyData;

        req.body.id = id;
        req.body.createdBy = userId;
        req.body.company = company;

        const { status: getSingleStatus, data : datas } : any = await getSingleEventExpense(id);

        if (getSingleStatus === 'success') {
            req.body.approvals = [...datas.approvals, { ...req.body.approvals[0], approvedBy: userId }];

            const { status: updateStatus, data } = await updateEventExpense(req.body);

            const response = {
                status: updateStatus === 'success' ? 'success' : 'error',
                data: data,
            };

            res.status(200).send(response);
        } else {
            throw generateError(datas, 400);
        }
    } catch (err) {
        const errorResponse = {
            status: 'error',
            data: err,
        };

        res.status(500).send(errorResponse);
    }
};

export const getAllExpenseEventService = async (req : any, res : Response) => {
    try
    {
        const {status, data} = await getAllEventExpense(req.body)
        if(status === "success"){
            res.status(200).send({
                status : status,
                data : data
            })
        }
        else {
            res.status(300).send({
                status : status,
                data : data
            })
        }
    }
    catch(err : any)
    {
        res.status(500).send({
            status : 'error',
            data : err?.message
        })
    }
}