import Task from "../../schemas/task/Task.schema";
import { statusCode } from "../../config/helper/statusCode";
import Project from "../../schemas/project/Project.schema";
import { deleteFile, uploadFile } from "../uploadDoc.repository";
import { createCatchError } from "../../config/helper/function";
import { findUserById } from "../auth/auth.repository";
import SendMail from "../../config/sendMail/sendMail";
import { baseDashURL } from "../../config/helper/urls";
import { getCompanyById } from "../company/company.respository";

const getProjectCounts = async (data: any) => {
  try {
    let pipeline = [
      {
        $match: data.matchConditions,
      },
      {
        $count: "totalProjects",
      },
    ];

    const result = await Project.aggregate(pipeline);
    return {
      data: result[0] ? result[0].totalProjects : 0,
      message: "Retrieved Project Counts",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err) {
    return createCatchError(err);
  }
};

const createProject = async (data: any) => {
  try {
    const projectData = new Project(data);
    const savedProject: any = await projectData.save();

    // upload the file
    if (data.logo && data.logo !== "") {
      let url = await uploadFile(data.logo);
      savedProject.logo = {
        name: data.logo.filename,
        url: url,
        type: data.logo.type,
      };
      await savedProject.save();
    }

    const attach_files: any[] = [];

    for (const file of data.attach_files) {
      try {
        if (file.file) {
          const documentInfo = await uploadFile(file.file);
          attach_files.push({
            ...file,
            file: {
              url: documentInfo,
              name: `${projectData?._id}_atFile_${file.file.filename}`,
              type: file.file.type,
            },
          });
        } else {
          if(file.file){
            attach_files.push({
              ...file
            });
          }
          else {
            attach_files.push({
              ...file,
              file: {
                url: undefined,
                name: undefined,
                type: undefined,
              },
            });
          }
        }
      } catch (err: any) {
        console.error("Error uploading file:", err);
      }
    }

    savedProject.attach_files = attach_files;
    await savedProject.save();

    return {
      statusCode: 201,
      status: "success",
      data: savedProject,
      message: `${savedProject.project_name} project has been created successfully`,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

const updateProject = async (data: any) => {
  try {
    const projectData = await Project.findById(data.id);
    if (projectData) {
      const { logo, ...rest } = data;
      const updatedProject: any = await Project.findByIdAndUpdate(
        data.id,
        { $set: rest },
        { new: true }
      );

      if (data?.logo?.isDeleted === 1 && updatedProject.logo?.name) {
        await deleteFile(updatedProject.logo.name);
        updatedProject.logo = {
          name: undefined,
          url: undefined,
          type: undefined,
        };
        await updatedProject.save();
      }

      if (
        data.logo &&
        data.logo?.isAdd === 1 &&
        data.logo?.filename &&
        data.logo?.buffer
      ) {
        const { filename, type } = data.logo;
        const url = await uploadFile(data.logo);
        updatedProject.logo = {
          name: filename,
          url,
          type,
        };
        await updatedProject.save();
      }

      for (const file of data.deleteAttachments) {
        await deleteFile(file);
      }

      let attach_files: any = [];

      for (const file of data.attach_files) {
        try {
          let filename = `${projectData?._id}_atFile_${file.file.filename}`
          if (file.file && file.isAdd) {
            const documentInfo = await uploadFile({...file.file,filename});
            attach_files.push({
              ...file,
              file: {
                url: documentInfo,
                name: filename,
                type: file.file.type,
              },
            });
          } else {
            if (file.file) {
              attach_files.push({
                ...file,
              });
            } else {
              attach_files.push({
                ...file,
                file: {
                  url: undefined,
                  name: undefined,
                  type: undefined,
                },
              });
            }
          }
        } catch (err: any) {
          console.error("Error uploading file:", err);
        }
      }

      updatedProject.attach_files = attach_files;
      await updatedProject.save();

      return {
        statusCode: 200,
        message: `${updatedProject.project_name} project has been updated successfully`,
        data: updatedProject,
        status: "success",
      };
    } else {
      return {
        status: "error",
        data: `Project does not exists`,
        message: "Something went wrong",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

const getSingleProject = async (data: any) => {
  try {
    const pipeline = [
      {
        $match: {
          _id: data.id,
          // company: mongoose.Types.ObjectId(data.company),
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$createdBy" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1 } },
          ],
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          let: { companyId: "$company" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$companyId"] } } },
            { $project: { companyName: 1, _id: 1 } },
          ],
          as: "company",
        },
      },
      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$project_manager",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { projectManagerId: "$project_manager.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$projectManagerId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1 } },
          ],
          as: "project_manager.user",
        },
      },
      {
        $unwind: {
          path: "$project_manager.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          project_manager: {
            $push: {
              user: "$project_manager.user",
              isActive: "$project_manager.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { project_manager: "$project_manager" }],
          },
        },
      },
      {
        $addFields: {
          project_manager: {
            $cond: {
              if: { $eq: ["$project_manager", [{}]] },
              then: [],
              else: "$project_manager",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$team_members",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { teamMemberId: "$team_members.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$teamMemberId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1 } },
          ],
          as: "team_members.user",
        },
      },
      {
        $unwind: {
          path: "$team_members.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          team_members: {
            $push: {
              user: "$team_members.user",
              isActive: "$team_members.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { team_members: "$team_members" }],
          },
        },
      },
      {
        $addFields: {
          team_members: {
            $cond: {
              if: { $eq: ["$team_members", [{}]] },
              then: [],
              else: "$team_members",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$followers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { followerId: "$followers.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$followerId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1 } },
          ],
          as: "followers.user",
        },
      },
      {
        $unwind: {
          path: "$followers.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          followers: {
            $push: {
              user: "$followers.user",
              isActive: "$followers.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { followers: "$followers" }],
          },
        },
      },
      {
        $addFields: {
          followers: {
            $cond: {
              if: { $eq: ["$followers", [{}]] },
              then: [],
              else: "$followers",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$customers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { customerId: "$customers.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1 } },
          ],
          as: "customers.user",
        },
      },
      {
        $unwind: {
          path: "$customers.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          customers: {
            $push: {
              user: "$customers.user",
              isActive: "$customers.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { customers: "$customers" }],
          },
        },
      },
      {
        $addFields: {
          customers: {
            $cond: {
              if: { $eq: ["$customers", [{}]] },
              then: [],
              else: "$customers",
            },
          },
        },
      },
      {
        $project: {
          project_name: 1,
          subtitle: 1,
          description: 1,
          logo: 1,
          priority: 1,
          is_active: 1,
          createdBy: 1,
          company: 1,
          project_manager: 1,
          status: 1,
          startDate: 1,
          endDate: 1,
          dueDate: 1,
          customers: 1,
          team_members: 1,
          followers: 1,
          approval: 1,
          attach_files: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          tags: 1,
        },
      },
    ];

    const result = await Project.aggregate(pipeline).exec();

    if (result.length > 0) {
      return {
        status: "success",
        message: "Project Retrieved Successfully",
        data: result[0],
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Project does not exist",
        message: "Project does not exist",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

const addProjectMembers = async (data: any): Promise<any> => {
  try {
    let currentUser: any = null;
    let company: any = null;
    const { id, type, user, isActive, tags } = data;

    const projectData = await Project.findById(id);
    if (!projectData) {
      return {
        status: "error",
        data: "Project does not exist",
        message: "Project not found",
        statusCode: statusCode.info,
      };
    }

    const memberTypeMap: Record<string, any> = {
      customers: projectData.customers,
      project_manager: projectData.project_manager,
      followers: projectData.followers,
      team_members: projectData.team_members,
      tags: projectData.tags,
    };

    const memberList = memberTypeMap[type];
    if (!memberList) {
      return {
        status: "error",
        data: "Invalid type provided",
        message: "No such type exists",
        statusCode: statusCode.info,
      };
    }

    if (type === "tags") {
      projectData.tags = tags || [];
    } else {
      const isMemberExists = memberList.some((item: any) =>
        item?.user?.equals(user)
      );
      if (isMemberExists) {
        return {
          status: "error",
          data: `User is already a ${type?.split("_").join(" ")}`,
          message: `${type?.split("_").join(" ")} already exists`,
          statusCode: statusCode.info,
        };
      }
      memberList.push({ user, isActive: !isActive });
    }

    await projectData.save();

    return {
      status: "success",
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } added successfully`,
      data: { user: currentUser, isActive },
      statusCode: statusCode.success,
      extraData: { projectData },
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

const getAllProjects = async (data: any) => {
  try {
    const { page = 1, limit = 10, userId } = data;

    const pipeline: any[] = [];

    pipeline.push({ $match: data.matchConditions });

    pipeline.push({ $sort: { createdAt: -1 } });

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const countPipeline = [
      { $match: data.matchConditions },
      { $count: "total" },
    ];

    const [result, totalProjects] = await Promise.all([
      Project.aggregate(pipeline),
      Project.aggregate(countPipeline),
    ]);

    const total = totalProjects.length > 0 ? totalProjects[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // Return the response
    return {
      status: "success",
      data: { data: result, totalPages },
      page,
      message: "Projects retrieved successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const findActiveUserInProject = async (data: any) => {
  try {
    const projectData = await Project.aggregate([
      { $match: data.matchConditions },
    ]);
    if (projectData.length) {
      return {
        status: "success",
        data: true,
        message: "Fetch Project Data successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: false,
        message: "No Such Project Exists",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: err?.message,
      statusCode: statusCode.serverError,
    };
  }
};

export const verifyUserProject = async (data: any) => {
  try {
    const filterPath = `${data.arrayName}.user`;
    const updatePath = `${data.arrayName}.$.isActive`;

    // Update the isActive state for the user in the array
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: data.projectId,
        deletedAt: { $exists: false },
        [filterPath]: data.userId,
      },
      {
        $set: {
          [updatePath]: data.is_active,
        },
      },
      {
        new: true,
      }
    );

    if (updatedProject) {
      return {
        status: "success",
        statusCode: 200,
        data: updatedProject,
        message: "User has been updated successfully",
      };
    } else {
      return {
        data: null,
        status: "error",
        statusCode: 300,
        message: "Failed to update the user",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      statusCode: 500,
      data: err?.message,
      message: err?.message,
    };
  }
};

// Task Repository

const getAllTask = async (data: any) => {
  try {
    const { page = 1, limit = 10, company } = data;

    const pipeline: any = [];

    const matchConditions = {
      company: { $in: company },
      projectId: data.projectId,
      deletedAt: { $exists: false },
    };

    pipeline.push({
      $match: matchConditions,
    });

    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    const totalProjectsPipeline = [
      { $match: matchConditions },
      { $count: "total" },
    ];

    const [result, totalProjects] = await Promise.all([
      Task.aggregate(pipeline),
      Task.aggregate(totalProjectsPipeline),
    ]);

    const total = totalProjects.length > 0 ? totalProjects[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      data: { data: result, totalPages: totalPages },
      page,
      message: "Task retrieved successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

const getSingleTask = async (datas: any) => {
  try {
    const pipeline: any = [];

    pipeline.push(
      {
        $match: {
          _id: datas._id,
          deletedAt: { $exists: false },
        },
      },
      {
        $unwind: {
          path: "$dependencies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { dependenciesId: "$dependencies.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$dependenciesId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
          ],
          as: "dependencies.user",
        },
      },
      {
        $unwind: {
          path: "$dependencies.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          dependencies: {
            $push: {
              user: "$dependencies.user",
              isActive: "$dependencies.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { dependencies: "$dependencies" }],
          },
        },
      },
      {
        $addFields: {
          dependencies: {
            $cond: {
              if: { $eq: ["$dependencies", [{}]] },
              then: [],
              else: "$dependencies",
            },
          },
        },
      },

      {
        $unwind: {
          path: "$assigner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { assignerId: "$assigner.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$assignerId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
          ],
          as: "assigner.user",
        },
      },
      {
        $unwind: {
          path: "$assigner.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          assigner: {
            $push: {
              user: "$assigner.user",
              isActive: "$assigner.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { assigner: "$assigner" }],
          },
        },
      },
      {
        $addFields: {
          assigner: {
            $cond: {
              if: { $eq: ["$assigner", [{}]] },
              then: [],
              else: "$assigner",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$team_members",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { teamMemberId: "$team_members.user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$teamMemberId"] } } },
            { $project: { username: 1, _id: 1, code: 1, pic: 1, name: 1 } },
          ],
          as: "team_members.user",
        },
      },
      {
        $unwind: {
          path: "$team_members.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          team_members: {
            $push: {
              user: "$team_members.user",
              isActive: "$team_members.isActive",
            },
          },
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { team_members: "$team_members" }],
          },
        },
      },
      {
        $addFields: {
          team_members: {
            $cond: {
              if: { $eq: ["$team_members", [{}]] },
              then: [],
              else: "$team_members",
            },
          },
        },
      },
      {
        $limit: 1,
      }
    );

    const result = await Task.aggregate(pipeline);
    if (result.length === 1) {
      return {
        status: "success",
        data: result[0],
        message: "Retrieved task successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Task does not exist",
        message: "Task does not exist",
        statusCode: statusCode.info,
      };
    }
  } catch (err) {
    return createCatchError(err);
  }
};

// CREATE TASK FUNCTION
const findSingleTask = async (datas: any) => {
  try {
    const taskData = await Task.findOne({
      _id: datas.id,
      deletedAt: { $exists: false },
    });
    if (taskData) {
      return {
        status: "success",
        data: taskData,
        message: "Retrived task successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Task does not exists",
        message: "Task does not exists",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

const createTask = async (datas: any) => {
  try {
    const projects = await Project.findOne({
      _id: datas.projectId,
      company: datas.company,
      deletedAt: { $exists: false },
    });

    if (projects) {
      const newTask = new Task(datas);
      const savedTask = await newTask.save();

      const attach_files: any[] = [];

      for (const file of datas.attach_files) {
        try {
          if (file.file) {
            const documentInfo = await uploadFile(file.file);
            attach_files.push({
              ...file,
              file: {
                url: documentInfo,
                name: `${savedTask?._id}_atFile_${file.file.filename}`,
                type: file.file.type,
              },
            });
          } else {
              attach_files.push({
                ...file,
                file: {
                  url: undefined,
                  name: undefined,
                  type: undefined,
                },
              });
          }
        } catch (err: any) {
          console.error("Error uploading file:", err);
        }
      }

      savedTask.attach_files = attach_files;
      await savedTask.save(); // Save the updated task with attach_files

      return {
        status: "success",
        data: savedTask,
        message: `${savedTask.title} task has been created successfully`,
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        data: "Project does not exist",
        message: `Project does not exist`,
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

const updateTask = async (datas: any) => {
  try {
    const projects = await Project.findOne({
      _id: datas.projectId,
      company: datas.company,
      deletedAt: { $exists: false },
    });
    if (projects) {
      const { status: taskStatus } = await findSingleTask({ id: datas.taskId });
      if (taskStatus === "success") {
        const updatedTask: any = await Task.findByIdAndUpdate(
          datas.taskId,
          { $set: datas },
          { new: true }
        );

        for (const file of datas.deleteAttachments) {
          await deleteFile(file);
        }

        let attach_files: any = [];

        for (const file of datas.attach_files) {
          try {
            let filename = `${updatedTask?._id}_atFile_${file?.file?.filename}`
            if (file?.isAdd && file?.file) {
              const documentInfo = await uploadFile({...file?.file,filename});
              attach_files.push({
                ...file,
                file: {
                  url: documentInfo,
                  name: filename,
                  type: file.file.type,
                },
              });
            } else {
              if(file?.file){
                attach_files.push({
                  ...file
                });
              }
              else {
                attach_files.push({
                  ...file,
                  file: {
                    url: undefined,
                    name: undefined,
                    type: undefined,
                  },
                });
              }
            }
          } catch (err: any) {
          }
        }

        updatedTask.attach_files = attach_files;
        await updatedTask?.save();
        return {
          data: updatedTask,
          status: "success",
          statusCode: statusCode.success,
          message: "Task has been updated successfully",
        };
      } else {
        return {
          status: "error",
          data: "Task does not exists",
          message: `task does not exists`,
          statusCode: statusCode.info,
        };
      }
    } else {
      return {
        status: "error",
        data: "Project does not exists",
        message: `Project does not exists`,
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export {
  getProjectCounts,
  createProject,
  updateProject,
  addProjectMembers,
  getAllProjects,
  getSingleProject,
  getSingleTask,
  getAllTask,
  createTask,
  updateTask,
};
