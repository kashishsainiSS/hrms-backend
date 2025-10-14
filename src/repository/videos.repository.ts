import { generateError } from "../config/Error/functions";
import VideosCategory from "../schemas/Videos/VideosCategory";
import Videos from "../schemas/Videos/Videos";
import { uploadFile } from "./uploadDoc.repository";

export const createVideoCategory = async (data: any) => {
  try {
    let {thumbnail,...rest} = data
    const videoCategory = new VideosCategory(rest);
    const savedVideoCategory = await videoCategory.save();
    if(thumbnail){
      savedVideoCategory.thumbnail = await uploadFile(thumbnail)
      await savedVideoCategory.save()
    }
    if (!savedVideoCategory) {
      throw generateError("Cannot create Cateogry", 400);
    }
    return { status: "success", data: savedVideoCategory };
  } catch (err : any) {
    console.log(err.message)
    return {
      status: "error",
      data: err,
    };
  }
};

export const getAllCategories = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          company: data.company,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "category",
          as: "videos",
        },
      },
      {
        $addFields: {
          totalChildData: { $size: "$videos" },
        },
      },
      {
        $project: {
          videos: 0,
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

    const [totalCountResult] = await VideosCategory.aggregate(countPipeline);
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

    const categories = await VideosCategory.aggregate(pipeline);

    return {
      status: "success",
      data: { categories, totalPages },
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getVideos = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          company: data.company,
          category: data.category,
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

    const [totalCountResult] = await Videos.aggregate(countPipeline);
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

    const videos = await Videos.aggregate(pipeline);

    return {
      data: { videos, totalPages },
      status: "success",
    };
  } catch (err) {
    return {
      data: err,
      status: "error",
    };
  }
};

export const getAllVideoCategoryCount = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: {
          company: data.company,
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "category",
          as: "videos",
        },
      },
      {
        $project: {
          _id: 0,
          title: "$title",
          count: { $size: "$videos" },
        },
      },
    ];

    const result = await VideosCategory.aggregate(pipeline);

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
