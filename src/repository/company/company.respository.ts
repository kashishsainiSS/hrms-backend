import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import Company from "../../schemas/company/Company";
import { statusCode } from "../../config/helper/statusCode";
import mongoose from "mongoose";
import { createCatchError } from "../../config/helper/function";

export const getCompanyPolicies = async (data : any) => {
  try
  {
    const pipeline : any = []
    pipeline.push({
      $match : {
        company : data.company,
        deletedAt : {$exists: false}
      }
    })
    const result = await CompanyPolicy.aggregate(pipeline)
    return {
      status : 'success',
      data : result,
      statusCode : statusCode.success,
      message : 'Retrived Policies Successfully'
    }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}

export const getIndividualPolicy = async (data : any) => {
  try
  {
    const result = await CompanyPolicy.findOne({_id : data.policy, company : data.company})
    if(result){
      return {
        status : 'success',
        data : result,
        statusCode : statusCode.success,
        message : 'Retrived Policies Successfully'
      }
    }
    else
    {
      return {
        status : 'error',
        data : 'No Such Policy Exists',
        statusCode : statusCode.info,
        message : 'No Such Policy Exists'
      }
    }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}

export const updateCompanyPolicy = async (data : any) => {
  try
  {
    const companyPolicy : any = await CompanyPolicy.findOneAndUpdate({_id : data.policy, company : data.company},{$set : {...data},new : true})
    if(companyPolicy){
      return {
        data : companyPolicy,
        message : 'Policy has been updated successfully',
        status : 'success',
        statusCode:statusCode.success
      }
    }
    else
    {
      return {
        status : 'error',
        data : 'Policy does not exists',
        statusCode : statusCode.info,
        message : 'Policy does not exists'
      }
    }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}


export const getCompanyCount = async (data: any) => {
  try {
    const pipeline: any = [
      {
        $match: {
          companyOrg: data.companyOrg,
          deletedAt: { $exists: false }
        }
      },
      {
        $count: "companyCount"
      }
    ];

    const result = await Company.aggregate(pipeline);

    return {
      status: 'success',
      data: result.length > 0 ? result[0].companyCount : 0,
      statusCode: statusCode.success,
      message: 'Retrieved Company Count Successfully'
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};




export const getOrganisationCompanies = async (data: any) => {
  try {
    const pipeline: any = [];
    pipeline.push(
      {
        $match: {
          companyOrg: data.companyOrg,
          deletedAt: { $exists: false },
          is_active: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [
            {
              $project: {
                username: 1,
                code: 1,
                role: 1,
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "activeUser",
          foreignField: "_id",
          as: "activeUser",
          pipeline: [
            {
              $project: {
                username: 1,
                code: 1,
                role: 1,
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      }
    );

    const companies = await Company.aggregate(pipeline);
    return {
      data: companies,
      message: "Retrieved Company successfully",
      statusCode: statusCode.success,
      status: "success",
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getCompanyDetailsByName = async (data: any) => {
  try {
    const company = await Company.findOne({
      company_name: new RegExp(data.company, "i"),
      is_active: true,
    });
    if (company) {
      return {
        status: "success",
        data: company,
        statusCode: 200,
      };
    } else {
      return {
        status: "error",
        data: `${data.company} No Such Are Found`,
        statusCode: 400,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err,
      statusCode: err.statusCode,
    };
  }
};

export const getCompanyById = async (id: any): Promise<any | null> => {
  try {
    const company = await Company.findOne({ _id: id, is_active: true });
    if (company) {
      return company;
    } else {
      return null;
    }
  } catch (err: any) {
    return null;
  }
};

export const getHolidays = async (data: any) => {
  try {
   const policy =  await CompanyPolicy.findOne({_id : data.policy, company : data.company})
    if (policy) {
      return {
        status: "success",
        data: policy.holidays || [],
        message: "Successfully retrieved holidays",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getWorkLocations = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({_id : data.policy, company : data.company});
    if (policy) {
      return {
        status: "success",
        data: policy.workLocations || [],
        message: "Successfully retrieved Locations",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateWorkTiming = async (data: any) => {
  try {

    const policy: any = await CompanyPolicy.findOne({
      _id: data.policy,
      is_active: true,
    });

    // If the policy is not found, return a "policy not found" message
    if (!policy) {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }

    if (data?.isAdd) {
      policy.workTiming.push({
        startTime: data.startTime,
        endTime: data.endTime,
        daysOfWeek: data.daysOfWeek
      });
      policy.markModified('workTiming')
      const savedPolicy = await policy.save();
      return {
        status: "success",
        data: savedPolicy.workTiming,
        message: "workTiming has been added successfully",
        statusCode: statusCode.success,
      };
    }

    if (data?.isEdit) {
      let filterIndex = policy.workTiming.findIndex(
        (item: any, index : number) => data.index === index
      );

      if (filterIndex !== -1) {
        // Only update the specific holiday found, keeping other fields intact
        policy.workTiming[filterIndex] = {
          ...policy.workTiming[filterIndex],
          startTime: data.startTime,
          endTime: data.endTime,
          daysOfWeek: data.daysOfWeek
        };

        policy.markModified('workTiming');

        const savedPolicy = await policy.save();
        return {
          status: "success",
          data: savedPolicy.workTiming,
          message: "WorkTiming has been updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such WorkTiming exists",
          message: "No such WorkTiming exists",
          statusCode: statusCode.info,
        };
      }
    }
    if (data?.isDelete) {
      let filterIndex = policy.workTiming.findIndex(
        (_: any, index : number) => data.index === index
      );

      if (filterIndex !== -1) {
        // Remove the holiday at the found index
        policy.workTiming.splice(filterIndex, 1);
        policy.markModified('workTiming');
        const savedPolicy = await policy.save();

        return {
          status: "success",
          data: savedPolicy.workTiming,
          message: "workTiming has been deleted successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such workTiming exists",
          message: "No such workTiming exists",
          statusCode: statusCode.info,
        };
      }
    }

    else {
      return {
        status: "error",
        data: "No such action exists",
        message: "No such action exists",
        statusCode: statusCode.success,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateHolidayByExcel = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({
      company: new mongoose.Types.ObjectId(data.company),
    });
    if (policy) {
      const updatedHolidays: any = await CompanyPolicy.findByIdAndUpdate(
        policy._id,
        { holidays: data.holidays }
      );
      return {
        status: "success",
        data: updatedHolidays.holidays || [],
        message: "Successfully retrieved Timings",
        statusCode: statusCode.success,
      };
    } else {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

export const updateHolidays = async (data: any) => {
  try {
    // Find the active policy by its _id
    const policy: any = await CompanyPolicy.findOne({
      _id: data.policy,
      is_active: true,
    });

    // If the policy is not found, return a "policy not found" message
    if (!policy) {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }

    // Add a new holiday to the policy's holidays array
    if (data?.isAdd) {
      policy.holidays.push({
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        policy: policy._id,
        company: policy.company,
      });
      policy.markModified('holidays')
      const savedPolicy = await policy.save();
      return {
        status: "success",
        data: savedPolicy.holidays,
        message: "Holiday has been added successfully",
        statusCode: statusCode.success,
      };
    }

    // Edit an existing holiday based on the title
    if (data?.isEdit) {
      let filterIndex = policy.holidays.findIndex(
        (item: any) => data.oldTitle === item.title
      );

      if (filterIndex !== -1) {
        // Only update the specific holiday found, keeping other fields intact
        policy.holidays[filterIndex] = {
          ...policy.holidays[filterIndex],
          title: data.title,
          description: data.description,
          date: new Date(data.date)
        };

        policy.markModified('holidays');

        const savedPolicy = await policy.save();
        return {
          status: "success",
          data: savedPolicy.holidays,
          message: "Holiday has been updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such holiday exists",
          message: "No such holiday exists",
          statusCode: statusCode.info,
        };
      }
    }

    // Delete an existing holiday based on the title
    if (data?.isDelete) {
      let filterIndex = policy.holidays.findIndex(
        (item: any) => data.title === item.title
      );

      if (filterIndex !== -1) {
        // Remove the holiday at the found index
        policy.holidays.splice(filterIndex, 1);
        policy.markModified('holidays');
        const savedPolicy = await policy.save();

        return {
          status: "success",
          data: savedPolicy.holidays,
          message: "Holiday has been deleted successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such holiday exists",
          message: "No such holiday exists",
          statusCode: statusCode.info,
        };
      }
    }

    // If no valid action is provided, return an error
    return {
      status: "error",
      data: "No valid action provided",
      message: "No valid action provided",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getWorkTiming = async (data: any) => {
  try {
      const policy =  await CompanyPolicy.findOne({_id : data.policy, company : data.company})
       if (policy) {
         return {
           status: "success",
           data: policy.workTiming || [],
           message: "Successfully retrieved workTiming",
           statusCode: statusCode.success,
         };
       } else {
         return {
           status: "error",
           message: "Policy not found",
           data: "Policy not found",
           statusCode: statusCode.info,
         };
       }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const updateWorkLocations = async (data: any) => {
  try {
    // Find the active policy by its _id
    const policy: any = await CompanyPolicy.findOne({
      _id: data.policy,
      is_active: true,
    });

    // If the policy is not found, return a "policy not found" message
    if (!policy) {
      return {
        status: "error",
        message: "Policy not found",
        data: "Policy not found",
        statusCode: statusCode.info,
      };
    }

    // Add a new holiday to the policy's holidays array
    if (data?.isAdd) {
      policy.workLocations.push({
        ipAddress: data.ipAddress,
        locationName: data.locationName
      });
      policy.markModified('workLocations')
      const savedPolicy = await policy.save();
      return {
        status: "success",
        data: savedPolicy.workLocations,
        message: "locations has been added successfully",
        statusCode: statusCode.success,
      };
    }

    if (data?.isEdit) {
      let filterIndex = policy.workLocations.findIndex(
        (item: any) => data.oldLocation === item.locationName
      );

      if (filterIndex !== -1) {
        // Only update the specific holiday found, keeping other fields intact
        policy.workLocations[filterIndex] = {
          ...policy.workLocations[filterIndex],
          ipAddress: data.ipAddress,
          locationName: data.locationName
        };

        policy.markModified('workLocations');

        const savedPolicy = await policy.save();
        return {
          status: "success",
          data: savedPolicy.workLocations,
          message: "locations has been updated successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such workLocations exists",
          message: "No such workLocations exists",
          statusCode: statusCode.info,
        };
      }
    }

    // Delete an existing holiday based on the title
    if (data?.isDelete) {
      let filterIndex = policy.workLocations.findIndex(
        (item: any) => data.locationName === item.locationName
      );

      if (filterIndex !== -1) {
        // Remove the holiday at the found index
        policy.workLocations.splice(filterIndex, 1);
        policy.markModified('workLocations');
        const savedPolicy = await policy.save();

        return {
          status: "success",
          data: savedPolicy.workLocations,
          message: "location has been deleted successfully",
          statusCode: statusCode.success,
        };
      } else {
        return {
          status: "error",
          data: "No such location exists",
          message: "No such location exists",
          statusCode: statusCode.info,
        };
      }
    }

    // If no valid action is provided, return an error
    return {
      status: "error",
      data: "No valid action provided",
      message: "No valid action provided",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};

export const uploadWorkLocationsByExcel = async (data: any) => {
  try {
    const policy: any = await CompanyPolicy.findOne({ company: data.company });

    if (!policy) {
      return {
        status: "success",
        message: "Policy not found",
        data: null,
        statusCode: statusCode.info,
      };
    }

    policy.workLocations = data?.workLocations;

    const savedPolicy = await policy.save();
    return {
      status: "success",
      data: savedPolicy.workLocations,
      message: "Locations updated successfully",
      statusCode: statusCode.success,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};
