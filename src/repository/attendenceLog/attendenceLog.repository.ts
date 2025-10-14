import AttendenceLog from "../../schemas/AttendenceLog/attendenceLog.schema";

export const BulkUpload= async(data:any)=>{
    try {
        const result = await AttendenceLog.insertMany(data,{ ordered: false });
        return{
            status:"success",
            data:result
        }
    } catch (error:any) {
        console.log("error",error.message        )
    }
}


export const getMonthly=async(empId:string, month:number,year:number)=>{
    
    try {
        const pipeline:any[]=[];
        pipeline.push(

  // month and year for further extract field for filter further
  {
    $addFields: {
      year: { $year: "$inTime" },
      month: { $month: "$inTime" },
      workingHours: {
        $divide: [{ $subtract: ["$outTime", "$inTime"] }, 1000 * 60 * 60],
      },
    },
  },

  // Match requested or current month/year
  // {
  //   $match: {
  //     year: 2025,
  //     month: 9,
  //   },
  // },

  // Group all attendance by empId + month + year
  {
    $group: {
      _id: { empId: "$empId", year: "$year", month: "$month" },
      days: {
        $push: {
          date: "$date",
          inTime: "$inTime",
          outTime: "$outTime",
          status: "$status",
          workingHours: { $round: ["$workingHours", 2] },
        },
      },
    },
  },

  //Lookup approved leaves for that employee & month -(Rahul bhai mane ye socha ki leave ka ak collection hoga empId se lookup kr ke status: approved check kr ke add kr de ge Days wale array mai jo date wise append ho rha ha )
  {
    $lookup: {
      from: "leaves",
      let: { empId: "$_id.empId", year: "$_id.year", month: "$_id.month" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$empId", "$$empId"] },
                { $eq: ["$status", "approved"] },
                {
                  $or: [
                    {
                      $and: [
                        { $eq: [{ $year: "$fromDate" }, "$$year"] },
                        { $eq: [{ $month: "$fromDate" }, "$$month"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: [{ $year: "$toDate" }, "$$year"] },
                        { $eq: [{ $month: "$toDate" }, "$$month"] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            empId: 1,
            leaveType: 1,
            fromDate: 1,
            toDate: 1,
          },
        },
      ],
      as: "leaves",
    },
  },

  // Merge attendance + leave data into one unified days array
  {
    $addFields: {
      days: {
        $map: {
          input: "$days",
          as: "d",
          in: {
            $mergeObjects: [
              "$$d",
              {
                // Check if date falls inside any approved leave period
                $let: {
                  vars: {
                    leave: {
                      $first: {
                        $filter: {
                          input: "$leaves",
                          as: "lv",
                          cond: {
                            $and: [
                              { $lte: ["$$lv.fromDate", "$$d.date"] },
                              { $gte: ["$$lv.toDate", "$$d.date"] },
                            ],
                          },
                        },
                      },
                    },
                  },
                  in: {
                    $cond: [
                      { $ifNull: ["$$leave", false] },
                      {
                        status: "L",
                        leaveType: "$$leave.leaveType",
                      },
                      {},
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    },
  },

  // Join employee data if needed to get name shown in Admin and HR sheet Optional 
  {
    $lookup: {
      from: "users",
      localField: "_id.empId",
      foreignField: "empId",
      as: "employee",
    },
  },
  { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

  // Final project
  {
    $project: {
      _id: 0,
      empId: "$_id.empId",
      name: "$employee.name",
      year: "$_id.year",
      month: "$_id.month",
      days: 1,
      totalPresent: {
        $size: {
          $filter: {
            input: "$days",
            as: "d",
            cond: { $eq: ["$$d.status", "P"] },
          },
        },
      },
      totalLeave: {
        $size: {
          $filter: {
            input: "$days",
            as: "d",
            cond: { $eq: ["$$d.status", "L"] },
          },
        },
      },
    },
  },
  { $sort: { empId: 1 } },

        )
        const result = await AttendenceLog.aggregate(pipeline);
        return{
            status:"success",
            data:result
        }

    } catch (error:any) {
         console.log("error",error.message        )
    }
}