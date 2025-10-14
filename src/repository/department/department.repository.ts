import DepartmentCategory from "../../schemas/Department/DepartmentCategory.schema";
import Department from "../../schemas/Department/Department.schema";
import mongoose from "mongoose";

export const createDepartment = async (data: any) => {
  try {
    const depart = new Department(data);
    const savedDepartment = await depart.save();
    return {
      status: "success",
      data: savedDepartment,
    };
  } catch (err) {
    return {
      status: "error",
      data: err,
    };
  }
};

export const getCategoryDepartmentCount = async (data: any) => {
  try {
    const pipeline: any = [];
    const matchConditions: any = {
      deletedAt : {$exists : false},
      ...data
    };

    pipeline.push(
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "category",
          as: "department",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      }
    );
    const result = await DepartmentCategory.aggregate(pipeline);
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

export const getCategoryDepartment = async (data: any) => {
  try {
    const pipeline: any = [];

    let matchConditions: any = {
      company: data.company,
      deletedAt: { $exists: false },
    };

    if (data.search) {
      matchConditions = { ...matchConditions, code: data.search?.trim() };
    }

    pipeline.push(
      {
        $match: matchConditions,
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "category",
          as: "department",
        },
      },
      {
        $addFields: {
          departmentCount: { $size: "$department" },
        },
      },
      {
        $project: {
          department: 0,
        },
      }
    );
    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      DepartmentCategory.aggregate(documentPipeline),
      DepartmentCategory.aggregate([
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

export const getAllDepartment = async (data: any) => {
  try {
    const pipeline: any = [];

    let matchConditions: any = {
      company: data.company,
      category:data.category,
      deletedAt: { $exists: false },
    };

    if (data.search) {
      matchConditions = { ...matchConditions, code: data.search?.trim() };
    }

    pipeline.push(
      {
        $match: matchConditions,
      },
    );
    let documentPipeline: any = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (data.page - 1) * data.limit },
      { $limit: Number(data.limit) },
    ];

    const [resultData, countDocuments]: any = await Promise.all([
      Department.aggregate(documentPipeline),
      Department.aggregate([
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

export const createDepartmentCategory = async (data: any) => {
  try {
    const departCategory = new DepartmentCategory(data);
    const savedDepartment = await departCategory.save();
    return {
      status: "success",
      data: savedDepartment,
    };
  } catch (err) {
    return {
      status: "error",
      data: err
    };
  }
};

export const updateDepartmentCategory = async (data: any) => {
  try {
    const department : any = await DepartmentCategory.findByIdAndUpdate(data._id)
    if(department && department.company?.toString() === data.company){
      department.title = data.title
      department.code = data.code
      await department.save()
      return {
        status : 'success',
        message : 'Category has been Updated Successfully',
        statusCode : 200,
        data : department
      }
    }
    else {
      return {
        status : 'success',
        message : 'Category does not exists',
        statusCode : 300
      }
    }
  } catch (err : any) {
    return {
      status: "error",
      message : err?.message,
      data: err?.message,
      statusCode : 500
    };
  }
};

export const updateDepartment = async (data: any) => {
  try {
    const department : any = await Department.findByIdAndUpdate(data._id)
    if(department && department.company?.toString() === data.company && department.category?.toString() === data.category){
      department.title = data.title
      department.code = data.code
      await department.save()
      return {
        status : 'success',
        message : 'Department has been Updated Successfully',
        statusCode : 200,
        data : department
      }
    }
    else {
      return {
        status : 'success',
        message : 'Department does not exists',
        statusCode : 300
      }
    }
  } catch (err : any) {
    return {
      status: "error",
      message : err?.message,
      data: err?.message,
      statusCode : 500
    };
  }
};

export const deleteDepartment = async(id : mongoose.Types.ObjectId) => {
  try
  {
    const departs = await Department.findByIdAndUpdate(id,{deletedAt : new Date()})
    if(departs){
      return {
        status : 'success',
        data : departs
      }
    }
    else {
      return {
        status : 'error',
        data : 'Record Does not exists'
      }
    }
  }
  catch(err)
  {
    return {
      status : 'error',
      data : err
    }
  }
}

export const deleteDepartmentCategory = async(id : mongoose.Types.ObjectId) => {
  try
  {
    const departs = await DepartmentCategory.findByIdAndUpdate(id,{deletedAt : new Date()})
    await Department.updateMany({ category: id }, { $set: { deletedAt: new Date() } });
    if(departs){
      return {
        status : 'success',
        data : departs
      }
    }
    else {
      return {
        status : 'error',
        data : 'Record Does not exists'
      }
    }
  }
  catch(err)
  {
    return {
      status : 'error',
      data : err
    }
  }
}