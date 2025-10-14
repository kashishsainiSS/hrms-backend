import { NextFunction, Response } from "express";
import {
  addTripMembers,
  calculateIndividualTripAmount,
  calculateTotalTripsAmount,
  calculateTripAmountByTitle,
  createTrip,
  findActiveUserInTrip,
  getAllDayTripCount,
  getSingleTrips,
  getTripCounts,
  getTrips,
  totalTripTypeCount,
  updateTrip,
  verifyUserTrip,
} from "../../repository/trip/trip.repository";
import { generateError } from "../../config/Error/functions";
import mongoose from "mongoose";
import {
  convertIdsToObjects,
  createCatchError,
} from "../../config/helper/function";
import { PaginationLimit } from "../../config/helper/constant";
import { findUserById } from "../../repository/auth/auth.repository";
import { getCompanyById } from "../../repository/company/company.respository";
import { baseDashURL } from "../../config/helper/urls";
import { createToken, verifyToken } from "../token/token.service";
import { generateResetPasswordToken } from "../../config/helper/generateToken";
import SendMail from "../../config/sendMail/sendMail";

export const createTripService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, bodyData } = req;
    const { companyOrg } = bodyData;

    req.body.createdBy = userId;
    req.body.companyOrg = companyOrg;
    req.body.company = new mongoose.Types.ObjectId(req.body.company);
    const { status, data, statusCode, extraData }: any = await createTrip(
      req.body
    );

    if (status === "success") {
      const company = await getCompanyById(data.company);
      if (!company) {
        return res.status(404).send({
          status: "error",
          statusCode: 404,
          message: "Company not found",
        });
      }
      const sendEmails = async (users: any[], role: string) => {
        for (let user of users) {
          if (user.isAdd) {
            const userDetails = await findUserById(user.user);
            if (userDetails) {
              let link = `${baseDashURL}/trip/${extraData._id}`;
              let mailSubject, mailTemplate;

              if (!user.isActive) {
                const token = await createToken({
                  metaData: { tripId: extraData._id, type: role },
                  userId: userDetails._id,
                  token: generateResetPasswordToken(userDetails?._id),
                  type: "trip",
                  company: extraData.company,
                });
                link = `${baseDashURL}/trip/verify-invitation/${token?.data?.token}`;
                mailSubject = `Invitation to Join ${extraData.title} Trip`;
                mailTemplate = "trip/add_member_invitation_template.html";
              } else {
                mailSubject = `Welcome to the ${extraData.title} Trip!`;
                mailTemplate = "trip/add_member_welcome_template.html";
              }

              const mailData = {
                tripName: extraData.title,
                role: role.split("_").join(" "),
                companyName: company.company_name,
                logoUrl: company.logo?.url,
                link : link,
                name : userDetails?.name || userDetails?.username
              };

              await SendMail(
                userDetails.username,
                mailSubject,
                mailTemplate,
                mailData
              );
            }
          }
        }
      };

      await Promise.all([sendEmails(req.body.participants, "participants")]);
    }

    res.status(statusCode).send({
      status: status,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

export const getSingleTripService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, data, message } = await getSingleTrips({ _id });
    return res.status(statusCode).send({
      status,
      message,
      data,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getTripsService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      companyOrg: req.bodyData.companyOrg,
      deletedAt: { $exists: false },
    };

    if (req.query.search?.trim()) {
      matchConditions = { ...matchConditions, code: req.query.search?.trim() };
    }

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }


    const { data, status, totalPages } = await getTrips({
      matchConditions,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : PaginationLimit,
    });
    if (status === "success") {
      res.status(200).send({
        status: status,
        data: {
          data,
          totalPages,
        },
      });
    } else {
      next(data);
    }
  } catch (err) {
    next(err);
  }
};

export const updateTripService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body._id = req.params.id;
    const { status, data, statusCode, message , extraData} : any = await updateTrip(req.body);
    if (status === "success") {
      const company = await getCompanyById(data.company);
      if (!company) {
        return res.status(404).send({
          status: "error",
          statusCode: 404,
          message: "Company not found",
        });
      }
      const sendEmails = async (users: any[], role: string) => {
        for (let user of users) {
          if (user.isAdd) {
            const userDetails = await findUserById(user.user);
            if (userDetails) {
              let link = `${baseDashURL}/trip/${extraData._id}`;
              let mailSubject, mailTemplate;

              if (!user.isActive) {
                const token = await createToken({
                  metaData: { tripId: extraData._id, type: role },
                  userId: userDetails._id,
                  token: generateResetPasswordToken(userDetails?._id),
                  type: "trip",
                  company: extraData.company,
                });
                link = `${baseDashURL}/trip/verify-invitation/${token?.data?.token}`;
                mailSubject = `Invitation to Join ${extraData.title} Trip`;
                mailTemplate = "trip/add_member_invitation_template.html";
              } else {
                mailSubject = `Welcome to the ${extraData.title} Trip!`;
                mailTemplate = "trip/add_member_welcome_template.html";
              }

              const mailData = {
                tripName: extraData.title,
                role: role.split("_").join(" "),
                companyName: company.company_name,
                logoUrl: company.logo?.url,
                link : link,
                name : userDetails?.name || userDetails?.username
              };

              await SendMail(
                userDetails.username,
                mailSubject,
                mailTemplate,
                mailData
              );
            }
          }
        }
      };

      await Promise.all([sendEmails(req.body.participants, "participants")]);
    }


    return res.status(statusCode).send({
      status: status,
      data: data,
      message: message,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllDayTripCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 12);

    if (!req.body.startDate && !req.body.endDate) {
      req.body.startDate = startDate;
      req.body.endDate = endDate;
    }

    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
      companyOrg: req.bodyData.companyOrg,
      createdAt: { $gte: req.body.startDate, $lte: req.body.endDate },
    };

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }

    const { status, data } = await getAllDayTripCount({
      matchConditions,
      ...req.body,
    });
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err) {
    next(err);
  }
};

export const getTripCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }

    const { status, data } = await getTripCounts({
      matchConditions,
      ...req.body,
    });
    if (status === "success") {
      res.status(200).send({
        data: data,
        message: "GET Counts SUCCESSFULLY",
        status: "success",
      });
    } else {
      throw generateError(data, 400);
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const totalTripTypeCountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

    req.body.company = await convertIdsToObjects(req.body.company);
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }

    const { status, message, statusCode, data } = await totalTripTypeCount({
      matchConditions,
      ...req.body,
    });
    res.status(statusCode).send({
      data: data,
      message: message,
      status: status,
    });
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const addTripMembersService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = new mongoose.Types.ObjectId(req.params.id);
    const { status, statusCode, message, data, extraData }: any =
      await addTripMembers(req.body);
    if (status === "success") {
      const [company]: any = await Promise.all([
        getCompanyById(extraData.company),
      ]);

      if (!data?.user || !company) {
        return res.status(404).send({
          status: "error",
          statusCode: 404,
          message: "User or Company not found",
        });
      }

      let link = `${baseDashURL}/trip/${extraData._id}`;
      let mailSubject, mailTemplate;

      if (req.body.isActive) {
        const token = await createToken({
          metaData: { tripId: extraData._id, type: req.body.type },
          userId: data.user?._id,
          token: generateResetPasswordToken(data?.user?._id),
          type: "trip",
          company: extraData.company,
        });
        link = `${baseDashURL}/trip/verify-invitation/${token?.data?.token}`;
        mailSubject = `Invitation to Join ${extraData.title} Trip`;
        mailTemplate = "trip/add_member_invitation_template.html";
      } else {
        mailSubject = `Welcome to the ${extraData.title} Trip!`;
        mailTemplate = "trip/add_member_welcome_template.html";
      }

      const mailData = {
        tripName: extraData.title,
        role: req.body.type,
        companyName: company.company_name,
        logoUrl: company.logo?.url,
        link : link,
        name : data?.user?.username
      };

      // Send an email to the user
      SendMail(
        data?.user?.username,
        mailSubject,
        mailTemplate,
        mailData
      );
    }
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyUserTokenTripService = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    const { data, message, statusCode, status }: any = await verifyToken(
      req.body
    );
    if (data) {
      const {
        status,
        statusCode,
        data: datas,
        message,
      } = await verifyUserTrip({
        userId: data.userId,
        tripId: data?.metaData?.tripId,
        arrayName: data?.metaData?.type,
        is_active: true,
      });

      if (status === "success") {
        const userDetails = await findUserById(data.userId);
        const company = await getCompanyById(req.body.company);

        if (userDetails && company) {
          let projectLink: string;
          let mailSubject = `Welcome to the ${datas.title} Trip!`;
          let mailTemplate = "trip/add_member_welcome_template.html";

          projectLink = `${baseDashURL}/trip/${datas._id}`;
          mailTemplate = mailTemplate.replace("invitation", "welcome");
          mailSubject = mailSubject.replace("Invitation", "Welcome");

          const mailData = {
            tripName: datas.title,
            role: data.metaData?.type,
            companyName: company.company_name,
            logoUrl: company.logo?.url,
            link : projectLink,
          };

          await SendMail(
            userDetails.username,
            mailSubject,
            mailTemplate,
            mailData
          );
        }
      }

      res.status(statusCode).send({
        data: datas,
        message,
        status,
      });
    } else {
      res.status(statusCode).send({
        data: "Invalid Token",
        message,
        status,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const calculateTripAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

    req.body.company = await convertIdsToObjects(req.body.company);
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }

    req.body.limit = req.body.limit ? req.body.limit : 8;
    const { status, statusCode, message, data } =
      await calculateTripAmountByTitle({ matchConditions, ...req.body });
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const calculateTotalTripsAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};

    req.body.company = await convertIdsToObjects(req.body.company);
    req.body.companyOrg = req.bodyData.companyOrg;

    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
    };

    if (req.body.userId) {
      matchConditions = {
        ...matchConditions,
        participants: {
          $elemMatch: {
            user: { $in: await convertIdsToObjects(req.body.userId) },
            isActive: true
          },
        },
      };
    }

    const { status, statusCode, message, data } =
      await calculateTotalTripsAmount({ matchConditions, ...req.body });
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const calculateIndividualTripAmountService = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.company = await convertIdsToObjects(req.body.company);
    if (req.body.tripId) {
      req.body.tripId = new mongoose.Types.ObjectId(req.body.tripId);
    }
    const { status, statusCode, message, data } =
      await calculateIndividualTripAmount(req.body);
    res.status(statusCode).send({
      status,
      statusCode,
      message,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const findActiveUserInTripService = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    let matchConditions: any = {};
    matchConditions = {
      company: { $in: await convertIdsToObjects(req.body.company) },
      deletedAt: { $exists: false },
      _id: new mongoose.Types.ObjectId(req.params.tripId),
    };

    let userId = req.body.userId;
    if (userId) {
      userId = new mongoose.Types.ObjectId(userId);
      matchConditions = {
        ...matchConditions,
        $or: [
          { participants: { $elemMatch: { user: userId, isActive: true } } },
        ],
      };
    }

    const { statusCode, status, data, message } = await findActiveUserInTrip({
      matchConditions,
    });
    res.status(statusCode).send({
      message,
      data,
      status,
    });
  } catch (err: any) {
    next(err);
  }
};
