import mongoose from "mongoose";
import Quiz from "../schemas/Quiz/Quiz";
import QuizCategory from "../schemas/Quiz/QuizCategory";

export const getAllQuizCategoryCount = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(data.company),
        },
      },
      {
        $lookup: {
          from: "quizcategories",
          localField: "_id",
          foreignField: "quiz",
          as: "categories",
        },
      },
      {
        $project: {
          _id: 0,
          title: "$title",
          "total category": { $size: "$categories" },
        },
      },
    ];

    const result = await Quiz.aggregate(pipeline);

    return {
      status: "success",
      data: result,
    };
  } catch (err) {
    console.error("Error:", err);

    return {
      status: "error",
      data: err,
    };
  }
};

export const getAllQuiz = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          company: data.company,
        },
      },
      {
        $lookup: {
          from: "quizcategories",
          localField: "_id",
          foreignField: "quiz",
          as: "categories",
        },
      },
      {
        $addFields: {
          totalChildData: { $size: "$categories" },
        },
      },
      {
        $project: {
          categories: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const countPipeline = [...pipeline];

    countPipeline.push({
      $count: "totalDocuments",
    });

    const [totalCountResult] = await Quiz.aggregate(countPipeline);
    const totalDocuments = totalCountResult
      ? totalCountResult.totalDocuments
      : 0;

    const totalPages = Math.ceil(totalDocuments / data.limit);

    pipeline.push({
      $skip: (data.page - 1) * data.limit,
    });

    pipeline.push({
      $limit: data.limit,
    });

    const quiz = await Quiz.aggregate(pipeline);

    return {
      status: "success",
      data: { quiz, totalPages },
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};
