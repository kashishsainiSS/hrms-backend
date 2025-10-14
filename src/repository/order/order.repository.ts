import Order from "../../schemas/Orders/Orders.schema";
import crypto from "crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import axios from "axios";
import OrderPayment from "../../schemas/Orders/OrderPayment.schema";
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export const findOrderAndUpdate = async (data: any) => {
  try {
    const dts = await Order.findById(data._id);
    if (dts) {
      dts.quantity = data.quantity;
      const saveddts = await dts.save();
      return {
        status: "success",
        data: saveddts,
        statusCode: 200,
        message: "order has been successfully",
      };
    } else {
      return {
        status: "error",
        data: null,
        message: "no such records exists",
        statusCode: 400,
      };
    }
  } catch (err: any) {
    throw new Error(err?.message);
  }
};

export const findOrder = async (data: any) => {
  try {
    const orderdt = await Order.findOne(data);
    if (orderdt) {
      return {
        status: "success",
        data: orderdt,
      };
    } else {
      return {
        status: "error",
        data: null,
        message: "No such record exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: null,
      message: err?.message,
    };
  }
};

export const createOrder = async (data: any) => {
  try {
    const orderData = new Order(data);
    const savedOrder = await orderData.save();
    return {
      status: "success",
      data: savedOrder,
      statusCode: 201,
      message: "Order has been created",
    };
  } catch (err: any) {
    throw new Error(err?.message);
  }
};

export const getAllOrders = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: { ...data.matchConditions },
      },
    ];

    pipeline.push({
      $lookup: {
        from: "users",
        let: { userId: "$user" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
        ],
        as: "user",
      },
    });

    const orderdetails = await Order.aggregate(pipeline);

    return {
      status: "success",
      data: orderdetails,
      statusCode: 200,
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
    };
  }
};

// Function to fetch the payment status from Razorpay
export const fetchPaymentStatus = async (paymentId: string) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_SECRET_KEY;

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching payment status:", error.response.data);
    return {
      status: "error",
      message: error.response.data,
    };
  }
};

export const createOrderPayment = async (data: any) => {
  const uniqueReceipt = `receipt_${"ds".slice(0, 25)}`;

  try {
    const options = {
      amount: data.amount * 100,
      currency: "INR",
      receipt: uniqueReceipt
    };

    const order = await instance.orders.create(options);

    const orderPayment = new OrderPayment({
      refrenceOrderId: data.refrenceOrderId,
      order_id: order.id,
      receipt: order.receipt,
      amount: order.amount,
      amount_due: order.amount_due,
      amount_paid: order.amount_paid,
      currency: order.currency,
      offer_id: order.offer_id,
      status: order.status
    });

    const savedPayment = await orderPayment.save();

    return {
      status: "success",
      statusCode: 201,
      data: { ...savedPayment?.toObject(), ...order },
      message: "Order has been initiated successfully",
    };
  } catch (err: any) {
    return {
      status: "error",
      statusCode: 500,
      data: err?.message,
      message: "Internal server error",
    };
  }
};

export const verifyOrderPayment = async (data: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const secret = process.env.RAZORPAY_SECRET_KEY!;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    const dt = await OrderPayment.findOne({ order_id: razorpay_order_id });
    if (dt) {
      // Fetch the actual payment status from Razorpay
      const paymentStatus = await fetchPaymentStatus(razorpay_payment_id);
      // Update the order status based on the fetched payment status
      if (paymentStatus.data.status === "captured") {
        dt.payment_id = razorpay_payment_id;
        dt.signature = razorpay_signature;
        dt.status = "captured";
        (dt.payment_details.method = paymentStatus.data?.method),
          (dt.payment_details.details = paymentStatus.data);
      } else if (paymentStatus.data.status === "failed") {
        dt.status = "failed";
      } else {
        dt.status = "pending";
      }

      await dt.save();

      return {
        statusCode: 200,
        status: "success",
        message: "Payment verified successfully",
        data: "Payment verified successfully",
      };
    } else {
      return {
        statusCode: 400,
        status: "error",
        message: "Order not found",
        data: "Order not found",
      };
    }
  } else {
    return {
      statusCode: 400,
      status: "error",
      message: "Payment verification failed",
      data: "Payment verification failed",
    };
  }
};

export const verifyOrderPaymentss = async (data: any) => {
  try {
    const orderData = await OrderPayment.findByIdAndUpdate(
      data.id,
      { $set: data },
      { new: true }
    );

    if (orderData) {
      return {
        statusCode: 200,
        data: orderData,
        status: "success",
        message: "Order has been updated successfully",
      };
    } else {
      return {
        statusCode: 404,
        data: "Order does not exist",
        status: "error",
        message: "Order does not exist",
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error",
    };
  }
};
