import mongoose from "mongoose";
import Request from "../../schemas/Request/Request.schema";

// CREATE THE NEW REQUEST
export const createRequest = async (data: any) => {
  try {
    const request = new Request(data);
    const savedRequest = await request.save();
    return {
      status: "success",
      data: savedRequest,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

// UPDATE THE REQUEST
export const updateRequest = async (data: any) => {
  try {
    const requestData = await Request.findByIdAndUpdate(
      data._id,
      { $set: { ...data } },
      { new: true }
    );
    if (requestData) {
      return {
        data: requestData,
        status: "success",
        statusCode: 200,
      };
    } else {
      return {
        data: "Request does not exists",
        status: "error",
        statusCode: 300,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err,
      statusCode: 500,
    };
  }
};

// DELETE THE REQUEST
export const deleteRequest = async (data : any) => {
  try
  {
    const record = await Request.findById(data._id)
    if(record){
      await record.deleteOne()
      return {
        message : 'Record has been deleted successfully',
        statusCode : 200,
        data : 'Record has been deleted successfully',
        status : 'success'
      }
    }
    else {
      return {
        message : 'Record does not exists',
        statusCode : 300,
        data : 'Record does not exists',
        status : 'error'
      }
    }
  }
  catch(err : any){
    return {
      message : err?.message,
      statusCode : 300,
      data : 'Record does not exists',
      status : 'error'
    }
  }
}

// CHECK THE REQUEST BY THE PAYLOAD
export const checkRequests = async (data: any) => {
  try {
    const record = await Request.findOne(data);
    if (record) {
      return true
    } else {
      return false
    }
  } catch (err: any) {
    return false
  }
};

// FIND SINGLE REQUEST BY THE REQUEST ID
export const findSingleRequestById = async (data: any) => {
  try {
    const record = await Request.findById(data._id);
    if (record) {
      return {
        statusCode: 200,
        data: record,
        status: "success",
      };
    } else {
      return {
        statusCode: 300,
        data: "Record does not exists",
        status: "error",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
    };
  }
};

// FIND SINGLE REQUEST BY THE REQUEST ID WITH DESCRIPTION
export const getRequestById = async (data: any) => {
  try {
    const pipeline: any = [];
    let matchConditions: any = {
      deletedAt: { $exists: false },
      _id: data._id,
    };

    pipeline.push(
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "users",
          localField: "sendTo",
          foreignField: "_id",
          as: "sendTo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
              },
            },
          ],
        },
      },
      {
        $limit: 1,
      }
    );
    let documentPipeline: any = [...pipeline];

    const [resultData]: any = await Promise.all([
      Request.aggregate(documentPipeline),
    ]);

    if (resultData.length === 0) {
      return {
        status: "error",
        statusCode: 300,
        data: resultData,
        message: "Request Does not Exists",
      };
    }
    return {
      status: "success",
      statusCode: 200,
      data: resultData,
      message: "Get Request Successfully",
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
      statusCode: 500,
    };
  }
};

// GET THE ALL THE REQUEST FOR THE MANAGER AND USERS BOTH
export const getRequests = async (data: any) => {
  try {
    const pipeline: any = [];
    let matchConditions: any = {
      deletedAt: { $exists: false }
    };

    if (data.managerId) {
      matchConditions.status = { $ne: "pending" };
    }

    pipeline.push(
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "users",
          localField: "sendTo",
          foreignField: "_id",
          as: "sendTo",
        },
      },
      {
        $addFields: {
          lastApproval: { $arrayElemAt: ["$approvals", -1] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastApproval.createdBy",
          foreignField: "_id",
          as: "lastApproval.createdBy",
        },
      },
      {
        $addFields: {
          "lastApproval.createdBy": { $arrayElemAt: ["$lastApproval.createdBy", 0] },
        },
      },
      {
        $addFields: {
          userCheck: { $eq: ["$lastApproval.user", data.user] },
          statusCheck: {
            $cond: {
              if: { $eq: [data.status, "all"] },
              then: true,
              else: { $eq: ["$lastApproval.status", data.status] },
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { userCheck: true },
            { statusCheck: true },
          ],
        },
      }
    );

    if (data.managerId) {
      pipeline.push({
        $match: {
          sendTo: {
            $elemMatch: {
              _id: new mongoose.Types.ObjectId(data.managerId),
            },
          },
        },
      });
    }

    const page = data.page || 1;
    const limit = data.limit || 10;

    const documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      Request.aggregate(documentPipeline),
      Request.aggregate([
        ...pipeline,
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalCounts = countDocuments.length > 0 ? countDocuments[0].count : 0;

    return {
      status: "success",
      data: resultData,
      totalPages: Math.ceil(totalCounts / limit),
      currentPage: page,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};
