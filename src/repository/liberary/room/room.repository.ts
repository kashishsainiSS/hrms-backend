import liberaryRoom from "../../../schemas/Liberary/seat/liberaryRoom.schema";
import { createCatchError } from "../../../config/helper/function";
import { statusCode } from "../../../config/helper/statusCode";
import { deleteFile, uploadFile } from "../../uploadDoc.repository";

export const createRoom = async (data: any) => {
  try {
    const { coverImage, ...rest } = data;
    const roomData = new liberaryRoom(rest);
    const savedRoomData = await roomData.save();

    if (
      data.coverImage &&
      data.coverImage?.buffer &&
      data.coverImage?.filename &&
      data.coverImage?.isAdd
    ) {
      const uploadedData = await uploadFile({ ...data.coverImage });
      savedRoomData.coverImage = {
        name: data.coverImage.filename,
        url: uploadedData,
        type: data.coverImage.type,
      };
      await savedRoomData.save();
    }

    return {
      status: "success",
      data: savedRoomData,
      message: "Room has been created successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getSingleRoomById = async (data: any) => {
  try {
    const room = await liberaryRoom.findById(data.id);
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
    const room = await liberaryRoom.findOne(data);
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
    const totalRoomsResult = await liberaryRoom.aggregate(totalRoomsPipeline);
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

    const result = await liberaryRoom.aggregate(pipeline);
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

export const getAllDropdownRooms = async (data: any) => {
  try {
    const rooms = await liberaryRoom
      .find({ deletedAt: { $exists: false }, company: { $in: data.company } })
      .select("title _id");
    return {
      status: "success",
      data: rooms,
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
      const liberaaryRoom: any = await liberaryRoom.findByIdAndUpdate(
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
      $count: "totalRoom",
    });

    const result = await liberaryRoom.aggregate(pipeline);
    return {
      data: result[0] ? result[0].totalRoom : 0,
      message: "Retrived Room Counts",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllRoomTitleCounts = async (data: any) => {
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

    const result = await liberaryRoom.aggregate(pipeline);

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
