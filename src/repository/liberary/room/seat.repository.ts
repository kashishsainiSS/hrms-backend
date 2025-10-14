import { createCatchError } from "../../../config/helper/function";
import { statusCode } from "../../../config/helper/statusCode";
import { deleteFile, uploadFile } from "../../uploadDoc.repository";
import liberaryRoom from "../../../schemas/Liberary/seat/liberaryRoom.schema";
import liberaySeat from "../../../schemas/Liberary/seat/liberaySeat.schema";
import LiberarySeatReservation from "../../../schemas/Liberary/seat/LiberarySeatReservation.schema";

export const createManySeats = async (data: {
  room: string;
  section: string;
  seats: any[];
}) => {
  try {
    const { room, seats } = data;

    const foundRoom = await liberaryRoom.findById(room);

    if (!foundRoom) {
      return {
        status: "error",
        data: `Room ${room} does not exist.`,
        message: `Room ${room} does not exist.`,
        statusCode: statusCode.info,
      };
    }

    const result = await liberaySeat.insertMany(seats);

    return {
      status: "success",
      data: result,
      message: "Seats have been created successfully",
      statusCode: statusCode.create,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getSingleRoomById = async (data: any) => {
  try {
    const room = await liberaySeat.findById(data.id);
    if (room) {
      return {
        statusCode: statusCode.success,
        status: "success",
        data: room,
        message: "Retrived room Successfully",
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Room does not exists",
        message: "Room does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const findOneRoom = async (data: any) => {
  try {
    const room = await liberaySeat.findOne(data);
    if (room) {
      return {
        statusCode: statusCode.success,
        status: "success",
        data: room,
        message: "Retrived room Successfully",
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Room does not exists",
        message: "Room does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllRooms = async (data: any) => {
  try {
    const { company, page = 1, limit = 10 } = data;

    const skip = (page - 1) * limit;

    let pipeline: any[] = [];

    pipeline.push({
      $match: {
        company: { $in: company },
        deletedAt: { $exists: false },
      },
    });

    const totalRoomsPipeline = [...pipeline, { $count: "total" }];
    const totalRoomsResult = await liberaySeat.aggregate(totalRoomsPipeline);
    const totalRooms =
      totalRoomsResult.length > 0 ? totalRoomsResult[0].total : 0;

    const totalPages = Math.ceil(totalRooms / limit);

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    pipeline.push({
      $skip: skip,
    });

    pipeline.push({
      $limit: limit,
    });

    const result = await liberaySeat.aggregate(pipeline);
    return {
      status: "success",
      data: { data: result, totalPages: totalPages },
      message: "Rooms retrieved successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const updateRoom = async (data: any) => {
  try {
    const { status } = await findOneRoom({
      _id: data.id,
      company: data.company,
      deletedAt: { $exists: false },
    });
    if (status === "success") {
      const { coverImage, ...rest } = data;
      const liberaaryRoom: any = await liberaySeat.findByIdAndUpdate(
        data.id,
        { $set: rest },
        { new: true, upsert: false }
      );

      if (liberaaryRoom?.coverImage?.name && data?.coverImage?.isDeleted) {
        await deleteFile(liberaaryRoom?.coverImage.name);
        await liberaaryRoom.save();
      }

      if (
        coverImage &&
        coverImage?.buffer &&
        coverImage?.filename &&
        coverImage?.isAdd
      ) {
        const uploadedData = await uploadFile({ ...coverImage });
        liberaaryRoom.coverImage = {
          name: coverImage.filename,
          url: uploadedData,
          type: coverImage.type,
        };
        await liberaaryRoom.save();
      }

      return {
        status: "success",
        data: liberaaryRoom,
        message: "Room has been updated successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Room does not exists",
        message: "Room does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllRoomSeatCounts = async (data: any) => {
  try {
    const pipeline: any = [];
    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false },
      },
    });

    pipeline.push({
      $count: "totalSeat",
    });

    const result = await liberaySeat.aggregate(pipeline);
    return {
      data: result[0] ? result[0].totalSeat : 0,
      message: "Retrived Seat Room Counts",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getRoomAvailableSeatCounts = async (data: any) => {
  try {
    const pipeline: any = [];
    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false },
        isAvailable: true,
      },
    });

    pipeline.push({
      $count: "totalSeat",
    });

    const result = await liberaySeat.aggregate(pipeline);
    return {
      data: result[0] ? result[0].totalSeat : 0,
      message: "Retrived Seat Available Room Counts",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllRoomCounts = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false },
      },
    });

    pipeline.push({
      $group: {
        _id: "$title",
        count: { $sum: 1 },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        title: "$_id",
        count: 1,
      },
    });

    const result = await liberaySeat.aggregate(pipeline);

    return {
      data: result,
      message: "Retrieved Room Counts by Title",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllSeatsByRoomAndSection = async (data: any) => {
  try {
    const pipeline: any = [];
    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false },
        isAvailable: true,
        room: data.room,
      },
    });

    const result = await liberaySeat.aggregate(pipeline);
    return {
      data: result,
      message: "Retrived Seats",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const checkReservationConflicts = async (data: any) => {
  // Create date objects for the start and end of the reservation period
  const startOfDay = new Date(data.startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(data.endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    seat: data.seat,
    status: "active",
    $or: [
      {
        // Check for overlapping full-day reservations
        fullDay: true,
        $or: [{ startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } }],
      },
      {
        // Check for overlapping time-based reservations
        fullDay: false,
        startDate: { $lte: data.endDate },
        endDate: { $gte: data.startDate },
        $or: [
          {
            // If the new reservation is time-based, check for overlaps
            $and: [
              {
                $or: [
                  // Check if new reservation overlaps with existing reservation
                  {
                    $and: [
                      { startTime: { $lt: data.endTime } },
                      { endTime: { $gt: data.startTime } },
                      { startDate: { $eq: data.startDate } },
                      { endDate: { $eq: data.endDate } },
                    ],
                  },
                  // Check if new reservation is within the bounds of an existing reservation
                  {
                    $and: [
                      { startTime: { $lte: data.startTime } },
                      { endTime: { $gte: data.endTime } },
                      { startDate: { $eq: data.startDate } },
                      { endDate: { $eq: data.endDate } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  // Find reservations that match the criteria
  const existingReservations = await LiberarySeatReservation.find(query);

  // If there are any existing reservations, return true (indicating a conflict)
  return existingReservations.length > 0;
};

export const createLiberaryReservationSeat = async (data: any) => {
  try {
    const reserveSeat = new LiberarySeatReservation(data);
    const savedReserveSeat = await reserveSeat.save();
    return {
      status: "success",
      statusCode: statusCode.create,
      data: savedReserveSeat,
      message: "Seat has been reserved successfully",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getUserReservations = async (data: any) => {
  try {
    const matchConditions: any = {
      user: data.userId,
    };

    if (data.startDate) {
      matchConditions.startDate = { $gte: data.startDate };
    }

    if (data.endDate) {
      matchConditions.endDate = { $lte: data.endDate };
    }

    const pipeline: any = [
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "libraryseats",
          localField: "seat",
          foreignField: "_id",
          as: "seatDetails",
        },
      },
      {
        $unwind: "$seatDetails",
      },
      {
        $lookup: {
          from: "liberaryroomsections",
          localField: "seatDetails.section",
          foreignField: "_id",
          as: "sectionDetails",
        },
      },
      {
        $unwind: {
          path: "$sectionDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "liberaryrooms",
          localField: "seatDetails.room",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      {
        $unwind: "$roomDetails",
      },
      // {
      //   $project: {
      //     _id: 1,
      //     seatNumber: "$seatDetails.seatNumber",
      //     sectionName: "$sectionDetails.sectionName", // This will be null if no section
      //     roomName: "$roomDetails.roomName",
      //     startDate: 1,
      //     endDate: 1,
      //     startTime: 1,
      //     endTime: 1,
      //     status: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //   },
      // },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (data.page - 1) * data.limit,
      },
      {
        $limit: data.limit,
      },
    ];

    const userReservations = await LiberarySeatReservation.aggregate(pipeline);
    const totalReservations = await LiberarySeatReservation.countDocuments(matchConditions);

    return {
      data: {
        data: userReservations,
        totalPages: Math.ceil(totalReservations / data.limit),
        currentPage: data.page,
        totalReservations,
      },
      status: "success",
      message: "Retrieved user reservation data",
      statusCode: statusCode.success,
    };
  } catch (err) {
    return createCatchError(err);
  }
};

