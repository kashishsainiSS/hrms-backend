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



export const getMonthly = async (empId: any, month: any, year: any, page: number, limit: number) => {
  try {
    const pipeline:any[] = [];

    // Step 1: Add derived fields
    pipeline.push({
      $addFields: {
        year: { $year: "$inTime" },
        month: { $month: "$inTime" },
        workingHours: {
          $divide: [{ $subtract: ["$outTime", "$inTime"] }, 1000 * 60 * 60],
        },
      },
    });

    // Step 2: Match filter
    const matchStage:any = {};

    if (empId) matchStage.empId = empId;
    if (month) matchStage.month = parseInt(month);
    if (year) matchStage.year = parseInt(year);

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Step 3: Group by empId, month, year
    pipeline.push({
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
    });

    // Step 4: Lookup approved leaves
    pipeline.push({
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
    });

    // Step 5: Merge leave info
    pipeline.push({
      $addFields: {
        days: {
          $map: {
            input: "$days",
            as: "d",
            in: {
              $mergeObjects: [
                "$$d",
                {
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
                        { status: "L", leaveType: "$$leave.leaveType" },
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
    });

    // Step 6: Lookup employee info
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "_id.empId",
          foreignField: "empId",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } }
    );

    // Step 7: Project summary
    pipeline.push({
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
    });

    pipeline.push({ $sort: { empId: 1 } });

    // Step 8: Pagination (works for all roles)
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Step 9: Execute
    const result = await AttendenceLog.aggregate(pipeline);

    // total count = all unique empIds (for pagination)
    const totalCount = await AttendenceLog.distinct("empId").then(r => r.length);

    return {
      status: "success",
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: result,
    };
  } catch (error:any) {
    console.error("Error in getMonthly:", error);
    return { status: "error", message: error.message };
  }
};



export const updateAttendanceRecord = async (empId: any, date: string | number | Date, updates: { status: string; inTime: string | number | Date; outTime: string | number | Date; editedBy: string | undefined; }) => {
  try {
    // Normalize date (important: ensure matching format)
    const targetDate = new Date(date);
    const isoDate = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Find the record for that empId + date
    const existing:any = await AttendenceLog.findOne({ empId, date: isoDate });

    if (!existing) {
      return { status: "error", message: "Attendance record not found" };
    }

    // Apply updates
    if (updates.status) existing.status = updates.status;
    if (updates.inTime) existing.inTime = new Date(updates.inTime);
    if (updates.outTime) existing.outTime = new Date(updates.outTime);

    // Recalculate worked hours if both times exist
    if (existing.inTime && existing.outTime) {
      const diffMs = existing.outTime - existing.inTime;
      existing.workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    // Set who edited
    if (updates.editedBy) existing.editedBy = updates.editedBy;

    await existing.save();

    return { status: "success", data: existing };
  } catch (error:any) {
    console.error("Error in updateAttendanceRecord:", error);
    return { status: "error", message: error.message };
  }
};
