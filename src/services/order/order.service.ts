import { Response } from "express";
import {
  createOrder,
  createOrderPayment,
  findOrder,
  findOrderAndUpdate,
  getAllOrders,
  verifyOrderPayment,
} from "../../repository/order/order.repository";
import mongoose from "mongoose";
import { convertIdsToObjects } from "../../config/helper/function";

export const createOrderService = async (req: any, res: Response) => {
  try {
    const { user, orderId, quantity } = req.body;
    const { status: orderStatus, data: orderData }: any = await findOrder({
      user: user,
      orderReferenceId: orderId,
      is_active: true,
    });
    if (orderStatus === "success" && orderData) {
      const { status, data, statusCode } = await findOrderAndUpdate({
        _id: orderData._id,
        quantity: quantity,
        is_active: true,
      });
      res.status(statusCode).send({
        status,
        data,
      });
    } else {
      const { statusCode, status, data, message } = await createOrder({
        ...req.body,
        orderReferenceId: orderId,
      });
      return res.status(statusCode).send({
        status,
        data,
        message,
      });
    }
  } catch (err: any) {
    return res.status(500).send({
      status: "error",
      message: err?.message,
    });
  }
};

export const getUserOrderService = async (req: any, res: Response) => {
  try {
    let matchConditions : any = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      is_active : true
    };
    if (req.body.type === 'user') {
      matchConditions.user = new mongoose.Types.ObjectId(req.body.user);
    }

    const { status, data, statusCode } = await getAllOrders({
      matchConditions
    });

    res.status(statusCode).send({
      status,
      data,
    });
  } catch (err: any) {
    res.status(500).send({
      status: "error",
      data: err?.message,
    });
  }
};

export const createOrderPaymentService = async (req: any, res: Response) => {
  try
  {
    const {status, statusCode, data, message} = await createOrderPayment(req.body)
    res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    return res.status(500).send({
      message : err?.message,
      status : 'error'
    })
  }
}

export const verifyOrderPaymentService = async (req : any ,res : Response) => {
  try
  {
    const {status, statusCode, message, data} = await verifyOrderPayment(req.body)
    res.status(statusCode).send({
      message,
      data,
      status
    })
  }
  catch(err : any){
    res.status(500).send({
      status : 'error',
      data : err?.message,
      message : err?.message
    })
  }
}