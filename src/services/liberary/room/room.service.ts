import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import { PaginationLimit } from "../../../config/helper/constant";
import { convertIdsToObjects } from "../../../config/helper/function";
import {
  createRoom,
  getAllDropdownRooms,
  getAllRoomCounts,
  getAllRooms,
  getAllRoomTitleCounts,
  getSingleRoomById,
  updateRoom,
} from "../../../repository/liberary/room/room.repository";
import { checkReservationConflicts, createLiberaryReservationSeat, createManySeats, getAllRoomSeatCounts, getAllSeatsByRoomAndSection, getRoomAvailableSeatCounts, getUserReservations } from "../../../repository/liberary/room/seat.repository";

export const createRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await createRoom(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, statusCode, data, message } = await updateRoom(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getSingleRoomByIdService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, data, message } = await getSingleRoomById(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllRoomService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRooms(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllDropdownRoomsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllDropdownRooms(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};


export const getRoomCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRoomCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getRoomTitleCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRoomTitleCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};


// Seats

export const createRoomSeatService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.user = req.userId;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);

    const seatData = req.body.seats.map((seat : any) => ({
      seatNumber: seat.seatNumber,
      section: req.body.section || null,
      room: req.body.room,
      company: req.body.company,
      createdBy:req.body.user,
      isAvailable: seat.isAvailable !== undefined ? seat.isAvailable : true,
      createdAt: new Date()
    }));

    const { status, statusCode, data, message } = await createManySeats({...req.body,seats : seatData});
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAllRoomSeatCountsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getAllRoomSeatCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};


export const getRoomAvailableSeatCountsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getRoomAvailableSeatCounts(
      req.body
    );
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};

export const reserveLiberarySeatService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    const hasConflict = await checkReservationConflicts(req.body);

    if (hasConflict) {
      return res.status(300).send({
        status : 'error',
        message: "The seat is already reserved for the requested time period.",
        data: "The seat is already reserved for the requested time period.",
      });
    }

    req.body.createdBy = req.userId
    const {status, statusCode, message, data} = await createLiberaryReservationSeat(req.body)
    return res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    next(err)
  }
}

export const getAllSeatsByRoomAndSectionService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    req.body.company = await convertIdsToObjects(req.body.company);
    req.body.room = new mongoose.Types.ObjectId(req.query.room)
    const {status, statusCode, message, data} = await getAllSeatsByRoomAndSection(req.body)
    return res.status(statusCode).send({
      status,
      message,
      data
    })
  }
  catch(err : any)
  {
    next(err)
  }
}

export const getUserReservationsService = async(req : any, res : Response, next : NextFunction) => {
  try
  {
    req.body.page = req.query.page ? Number(req.query.page) : 1;
    req.body.limit = req.query.limit
      ? Number(req.query.limit)
      : PaginationLimit;
    req.body.userId = new mongoose.Types.ObjectId(req.params.userId)
    req.body.company = await convertIdsToObjects(req.body.company);
    const { status, statusCode, data, message } = await getUserReservations(req.body);
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  }
  catch(err : any)
  {
    next(err)
  }
}
