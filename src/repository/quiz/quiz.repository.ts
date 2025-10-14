import Quiz from "../../schemas/Quiz/Quiz";
import Question from "../../schemas/Quiz/Question";
import QuizCategory from "../../schemas/Quiz/QuizCategory";

// Quiz Category
export const createCategory = async (data: any) => {
  try {
    const quizCate = new QuizCategory(data);
    const saveQuizCategory = await quizCate.save();
    return {
      data: saveQuizCategory,
      status: "success",
      statusCode: 201,
      message: `${data.title} category has been created Successfully`,
    };
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
      message: err?.message,
    };
  }
};

export const updateCategory = async (data: any) => {
  try {
    const quizCate = await QuizCategory.findById(data.id);
    if (quizCate) {
      const updateQuizCate: any = await QuizCategory.findByIdAndUpdate(
        data.id,
        { $set: data },
        { new: true }
      );
      return {
        status: "success",
        data: updateQuizCate,
        statusCode: 200,
        message: `${updateQuizCate.title} category has been updated Successfully`,
      };
    } else {
      return {
        status: "error",
        data: "Category does not exists",
        statusCode: 300,
        message: "Category does not exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
      message: "Internal Service Error",
    };
  }
};

export const getAllCategory = async (data: any) => {
  try {
    const { company, page, limit } = data;
    const pipeline: any = [];

    const matchConditions = {
      company: company,
    };

    pipeline.push({
      $match: {
        ...matchConditions,
      },
    });

    const skip = (page - 1) * limit;

    pipeline.push(
      {
        $skip: skip,
      },
      {
        $limit: limit,
      }
    );

    const result = await QuizCategory.aggregate(pipeline).exec();

    const totalCountPipeline = [
      {
        $match: {
          ...matchConditions,
        },
      },
      {
        $count: "total",
      },
    ];

    const totalCountResult = await QuizCategory.aggregate(
      totalCountPipeline
    ).exec();
    const total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    return {
      data: result,
      total: total,
      page: page,
      limit: limit,
      status: "success",
      statusCode: 200,
      message: "Get Category Successfully",
    };
  } catch (err: any) {
    return {
      data: err?.message,
      status: "error",
      statusCode: 500,
      message: "Failed to get categories",
    };
  }
};

export const createQuiz = async(data : any) => {
  try
  {
     if(data.category){
        const category = await QuizCategory.findById(data.category)
        if(!category){
          return {
            statusCode : 300,
            data : 'Category does not exists',
            message : 'Category does not exists',
            status : 'error'
          }
        }
     }

     Quiz
  }
  catch(err)
  {

  }
};
