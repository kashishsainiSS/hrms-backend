import BookUsers from "../../../schemas/Liberary/books/BookUser.schema";
import { createCatchError } from "../../../config/helper/function";
import { statusCode } from "../../../config/helper/statusCode";
import { PipelineStage } from 'mongoose';

export const createBookUser = async (data: any) => {
  try {
    const bookUser = new BookUsers(data);
    const savedBookUser = await bookUser.save()

    return {
      status: "success",
      data: savedBookUser,
      message: "Book has been Added successfully",
      statusCode: statusCode.success,
    };
  } catch (err :any) {
    return createCatchError(err);
  }
};


export const getBookUsersCount = async (data : any) => {
  try {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          company: { $in: data.company },
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          count: 1
        }
      }
    ];

    const [result] = await BookUsers.aggregate(pipeline);

    return {
      data: result?.count || 0,
      message: 'Fetch Users Count',
      statusCode: statusCode.success,
      status: 'success'
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};
