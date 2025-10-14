import { createCatchError, generateFileName } from "../../config/helper/function";
import { statusCode } from "../../config/helper/statusCode";
import { TripModel as Trip } from "../../schemas/trip/trip.schema";
import { findUserById } from "../auth/auth.repository";
import { deleteFile, uploadFile } from "../uploadDoc.repository";

export const createTrip = async (data: any) => {
  try {
    const {thumbnail, attach_files, ...rest}  = data
    const trip = new Trip(rest);
    const savedTrip = await trip.save();

    if (
      data.thumbnail &&
      data?.thumbnail?.buffer &&
      data.thumbnail?.trim !== ""
    ) {
      data.thumbnail.filename = generateFileName(data.thumbnail.filename)
      let url = await uploadFile(data.thumbnail);
      data.thumbnail = {
        name: data.thumbnail.filename,
        url: url,
        type: data.thumbnail.type,
      };
      savedTrip.thumbnail = data.thumbnail;
      await savedTrip.save();
    }

    let attach_filess : any = []
    for (const file of data.attach_files) {
      try {
        if (file.file) {
          const documentInfo = await uploadFile(file.file);
          attach_filess.push({
            ...file,
            file: {
              url: documentInfo,
              name: `${savedTrip?._id}_atFile_${file.file.filename}`,
              type: file.file.type,
            },
          });
        } else {
          if(file.file){
            attach_filess.push({
              ...file
            });
          }
          else {
            attach_filess.push({
              ...file,
              file: {
                url: undefined,
                name: undefined,
                type: undefined,
              },
            });
          }
        }
      } catch (err: any) {
        console.error("Error uploading file:", err);
      }
    }

    savedTrip.attach_files = attach_filess;
    await savedTrip.save()

    return {
      status: "success",
      data: savedTrip,
      extraData : savedTrip,
      statusCode: statusCode.success,
      message: `${data.title} trip has been created successfully`,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const updateTrip = async (data: any) => {
  try {
    const trip = await Trip.findById(data._id);
    if (trip) {
      const updatedData: any = await Trip.findByIdAndUpdate(data._id, data, {
        new: true,
      });

      if (
        data.isFileDeleted === 1 &&
        updatedData.thumbnail?.url &&
        updatedData.thumbnail?.name
      ) {
        await deleteFile(updatedData.thumbnail.name);
        updatedData.thumbnail = {
          name: undefined,
          url: undefined,
          type: undefined,
        };
        await updatedData.save();
      }

      if (
        data.thumbnail?.filename &&
        data.thumbnail?.buffer &&
        data.thumbnail
      ) {
        data.thumbnail.filename = generateFileName(data.thumbnail.filename)
        const url = await uploadFile(data.thumbnail);
        updatedData.thumbnail = {
          name: data.thumbnail.filename,
          url,
          type : data.thumbnail.type,
        };
        await updatedData.save();
      }


      for (const file of data.deleteAttachments) {
        await deleteFile(file);
      }

      let attach_filess: any = [];

      for (const file of data.attach_files) {
        try {
          let filename = `${updatedData?._id}_atFile_${file?.file?.filename}`
          if (file?.file && file?.isAdd) {
            const documentInfo = await uploadFile({...file.file,filename});
            attach_filess.push({
              ...file,
              file: {
                url: documentInfo,
                name: filename,
                type: file.file.type,
              },
            });
          } else {
            if (file?.file) {
              attach_filess.push({
                ...file,
              });
            } else {
              attach_filess.push({
                ...file,
                file: {
                  url: undefined,
                  name: undefined,
                  type: undefined,
                },
              });
            }
          }
        } catch (err: any) {
          console.error("Error uploading file:", err);
        }
      }

      updatedData.attach_files = attach_filess;
      await updatedData.save();

      return {
        status: "success",
        data: updatedData,
        extraData:updatedData,
        statusCode: statusCode.success,
        message: "Trip Update Successfully",
      };
    } else {
      return {
        status: "error",
        data: "Trip does not exists",
        statusCode: statusCode.info,
        message: "Trip does not exists",
      };
    }
  } catch (err) {
    return createCatchError(err);
  }
};

export const getSingleTrips = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push(
      {
        $match: {
          _id: data._id,
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { username: 1, _id: 1, code: 1 } },
          ],
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$participants",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { teamMemberId: "$participants.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$teamMemberId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
          ],
          as: "participants.user",
        },
      },
      {
        $unwind: {
          path: "$participants.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          participants: {
            $push: {
              user: "$participants.user",
              isActive: "$participants.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { participants: "$participants" }],
          },
        },
      },
      {
        $addFields: {
          participants: {
            $cond: {
              if: { $eq: ["$participants", [{}]] },
              then: [],
              else: "$participants",
            },
          },
        },
      },
      {
        $limit: 1,
      }
    );
    const trip = await Trip.aggregate(pipeline);
    if (trip.length) {
      return {
        data: trip[0],
        message: "Retrieved Trip Data",
        statusCode: statusCode.success,
        status: "success",
      };
    } else {
      return {
        data: "Trip does not exists",
        message: "Failed to Retrieved Trip Data",
        statusCode: statusCode.info,
        status: "error",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getTrips = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: data.matchConditions,
    });

    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: data.limit },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      Trip.aggregate(documentPipeline),
      Trip.aggregate([
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
      totalPages: Math.ceil(totalCounts / data.limit),
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getAllDayTripCount = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: data.matchConditions,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          count: 1,
        },
      },
    ];

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getTripCounts = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: data.matchConditions
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ];

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result.length > 0 ? result[0].count : 0,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const verifyUserTrip = async (data: any) => {
  try {
    const filterPath = `${data.arrayName}.user`;
    const updatePath = `${data.arrayName}.$.isActive`;

    // Update the isActive state for the user in the array
    const updatedTrips = await Trip.findOneAndUpdate(
      {
        _id: data.tripId,
        deletedAt: { $exists: false },
        [filterPath]: data.userId,
      },
      {
        $set: {
          [updatePath]: data.is_active,
        },
      },
      {
        new: true
      }
    );

    if (updatedTrips) {
      return {
        status: "success",
        statusCode: 200,
        data: updatedTrips,
        message: "User has been updated successfully",
      };
    } else {
      return {
        data: null,
        status: "error",
        statusCode: 300,
        message: "Failed to update the user",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      statusCode: 500,
      data: err?.message,
      message: err?.message,
    };
  }
};


export const totalTripTypeCount = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: data.matchConditions
    });

    pipeline.push({
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        count: 1,
        title: "$_id",
      },
    });

    const result = await Trip.aggregate(pipeline);

    return {
      status: "success",
      data: result,
      statusCode: statusCode.success,
      message: "Get Trip type counts",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};


export const addTripMembers = async (data: any) => {
  try {
    const { id, type, user, isActive } = data;

    const tripData = await Trip.findById(id);
    if (!tripData) {
      return {
        status: "error",
        data: "Trip does not exist",
        message: "Trip not found",
        statusCode: statusCode.info,
      };
    }

    const memberTypeMap: Record<string, any> = {
      participants: tripData.participants,
    };

    const memberList = memberTypeMap[type];
    if (!memberList) {
      return {
        status: "error",
        data: "Invalid type provided",
        message: "No such type exists",
        statusCode: statusCode.info,
      };
    }

    const isMemberExists = memberList.some((item: any) =>
      item.user.equals(user)
    );
    if (isMemberExists) {
      return {
        status: "error",
        data: `User is already a ${type}`,
        message: `${type} already exists`,
        statusCode: statusCode.info,
      };
    }

    memberList.push({ user, isActive  : !isActive});

    await tripData.save();

    const userData = await findUserById(user);

    return {
      status: "success",
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } added successfully`,
      data: { user: userData, isActive },
       extraData: tripData,
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const calculateTripAmountByTitle = async (data: any) => {
  try {
    const result = await Trip.aggregate([
      {
        $match: data.matchConditions,
      },
      {
        $addFields: {
          totalTravelCost: {
            $sum: {
              $map: {
                input: "$travelDetails",
                as: "detail",
                in: {
                  $add: [
                    { $toDouble: "$$detail.travelCost" },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isCab", false] },
                        { $toDouble: "$$detail.cabCost" },
                        0,
                      ],
                    },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isAccommodation", false] },
                        { $toDouble: "$$detail.accommodationCost" },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalAdditionalExpenses: {
            $sum: {
              $map: {
                input: "$additionalExpenses",
                as: "expense",
                in: { $toDouble: "$$expense.amount" },
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalAmount: {
            $add: ["$totalTravelCost", "$totalAdditionalExpenses"],
          },
        },
      },
      {
        $group: {
          _id: "$title",
          amount: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: data.limit,
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          amount: 1,
        },
      },
    ]);

    return {
      status: "success",
      message: `GET Trip Amounts By Title Successfully`,
      data: result,
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const calculateTotalTripsAmount = async (data: any) => {
  try {
    const result = await Trip.aggregate([
      {
        $match: data.matchConditions,
      },
      {
        $addFields: {
          totalTravelCost: {
            $sum: {
              $map: {
                input: "$travelDetails",
                as: "detail",
                in: {
                  $add: [
                    { $toDouble: { $ifNull: ["$$detail.travelCost", "0"] } },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isCab", false] },
                        { $toDouble: { $ifNull: ["$$detail.cabCost", "0"] } },
                        0,
                      ],
                    },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isAccommodation", false] },
                        {
                          $toDouble: {
                            $ifNull: ["$$detail.accommodationCost", "0"],
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalAdditionalExpenses: {
            $sum: {
              $map: {
                input: "$additionalExpenses",
                as: "expense",
                in: { $toDouble: { $ifNull: ["$$expense.amount", "0"] } },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $add: ["$totalTravelCost", "$totalAdditionalExpenses"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    return {
      status: "success",
      message: `GET Trip Amounts Successfully`,
      data: result.length > 0 ? result[0].totalAmount : 0,
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const calculateIndividualTripAmount = async (data: any) => {
  try {
    const matchCondition: any = {
      company: { $in: data.company },
      deletedAt: { $exists: false },
    };

    if (data.tripId) {
      matchCondition._id = data.tripId;
    } else if (data.tripTitle) {
      matchCondition.title = { $regex: data.tripTitle, $options: "i" };
    }

    const result = await Trip.aggregate([
      {
        $match: matchCondition,
      },
      {
        $addFields: {
          totalTravelCost: {
            $sum: {
              $map: {
                input: "$travelDetails",
                as: "detail",
                in: {
                  $add: [
                    { $toDouble: "$$detail.travelCost" },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isCab", false] },
                        { $toDouble: "$$detail.cabCost" },
                        0,
                      ],
                    },
                    {
                      $cond: [
                        { $ifNull: ["$$detail.isAccommodation", false] },
                        { $toDouble: "$$detail.accommodationCost" },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          },
          totalAdditionalExpenses: {
            $sum: {
              $map: {
                input: "$additionalExpenses",
                as: "expense",
                in: { $toDouble: "$$expense.amount" },
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalAmount: {
            $add: ["$totalTravelCost", "$totalAdditionalExpenses"],
          },
        },
      },
      {
        $group: {
          _id: "$title",
          amount: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          amount: 1,
        },
      },
    ]);

    return {
      status: "success",
      message: `GET Trip Amount SuccesSsfully`,
      data: result,
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const findActiveUserInTrip = async (data: any) => {
  try {
    const tripData = await Trip.aggregate([
      { $match: data.matchConditions },
    ]);
    if (tripData.length) {
      return {
        status: "success",
        data: true,
        message: "Fetch Trip Data successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: false,
        message: "No Such Trip Exists",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: err?.message,
      statusCode: statusCode.serverError,
    };
  }
};