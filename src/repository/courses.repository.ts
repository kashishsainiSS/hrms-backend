import Notes from "../schemas/Notes/Notes";
import CourseCategory from "../schemas/Notes/NotesCategory";


export const createCourse = async (data : any) => {

}
export const getAllCategories = async (data: any) => {
    try {
      const pipeline: any = [
        {
          $match: {
            company: data.company,
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

      const [totalCountResult] = await CourseCategory.aggregate(countPipeline);
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

      const categories = await CourseCategory.aggregate(pipeline);

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

export const getAllCourseCategoryCount = async (data: any) => {
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
            from: "Notes",
            localField: "_id",
            foreignField: "category",
            as: "notes",
          },
        },
        {
          $project: {
            _id: 0,
            title: "$title",
            count: { $size: "$notes" },
          },
        },
      ];

      const result = await CourseCategory.aggregate(pipeline);

      return {
        status: "success",
        data: result
      };
    } catch (err) {
      return {
        status: "error",
        data: err,
      };
    }
};

export const getCourseByCategory = async (data: any) => {
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

    const [totalCountResult] = await Notes.aggregate(countPipeline);
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

    const courses = await Notes.aggregate(pipeline);

    return {
      data: { courses, totalPages },
      status: "success",
    };
  } catch (err) {
    return {
      data: err,
      status: "error",
    };
  }
};