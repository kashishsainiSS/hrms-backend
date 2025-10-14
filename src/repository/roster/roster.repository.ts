import Roster, { IRoster } from "../../schemas/Roster/Roster.schema";


export const bulkUpload = async (data: IRoster[]) => {
  try {
     const result =  await Roster.insertMany(data);
    // const pipeline :any[]= data.map((item) => [
    //   { $replaceRoot: { newRoot: item } },
    //   {
    //     $merge: {
    //       into: "rosters",
    //       on: ["empId", "date"],
    //       whenMatched: "merge",
    //       whenNotMatched: "insert",
    //     },
    //   },
    // ]);

    // const flatPipeline :any[]= pipeline.flat();
    
    // const result = await Roster.aggregate(flatPipeline);

    return {
      status: true,
      message: "Bulk roster upload successful",
      data: result,
    };
  } catch (error) {
    return { status: false, message: "Bulk upload failed", error };
  }
};


export const createRoster = async (data: IRoster) => {
  try {
    const pipeline:any = [
      { $replaceRoot: { newRoot: data } },
      {
        $merge: {
          into: "rosters",
          on: ["empId", "date"],
          whenMatched: "merge",
          whenNotMatched: "insert",
        },
      },
    ];

    const result = await Roster.aggregate(pipeline);
    return { status: true, message: "Roster created successfully", data: result };
  } catch (error) {
    return { status: false, message: "Failed to create roster", error };
  }
};


export const getAllRosters = async (page: number = 1, limit: number = 10, search: string = "") => {
  try {
    const skip = (page - 1) * limit;

    // 🔍 Dynamic match for optional search
    const matchStage: any = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { empId: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
    $addFields: {
      month: { $month: "$date" },
      year: { $year: "$date" }
    }
  },
  {
    $group: {
      _id: {
        empId: "$empId",
        name: "$name",
        year: "$year",
         teamLeader: "$teamLeader",
      },
      days: {
        $push: {
          date: "$date",
          status: "$status",
          shiftTime: "$shiftTime",
          teamLeader: "$teamLeader",
             month: "$month",
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      empId: "$_id.empId",
      name: "$_id.name",
      teamLeader: "$_id.teamLeader",
      year: "$_id.year",
      month: "$_id.month",
      days: 1
    }
  },
  {
    $sort: { empId: 1, month: 1 }
  },
      // { $sort: { date: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await Roster.aggregate(pipeline);
    const totalDocs = await Roster.countDocuments(matchStage);
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      status: "success",
      message: "Rosters fetched successfully",
      data,
      totalPages,
      currentPage: page,
      totalRecords: totalDocs,
    };
  } catch (error) {
    return { status: "error", message: "Failed to fetch rosters", error };
  }
};

export const getRosterByEmployee = async (empId: string) => {
  try {
    const pipeline:any[] = [
      { $match: { empId } },
      { $sort: { date: 1 } },
      { $project: { _id: 0, empId: 1, date: 1, shift: 1 } },
    ];
    const result = await Roster.aggregate(pipeline);
    return { status: true, message: "Roster fetched successfully", data: result };
  } catch (error) {
    return { status: false, message: "Failed to fetch roster", error };
  }
};


export const updateRoster = async (empId: string, date: Date, shift: string) => {
  try {
    const updatedData = { empId, date, shift };
    const pipeline :any[]= [
      { $replaceRoot: { newRoot: updatedData } },
      {
        $merge: {
          into: "rosters",
          on: ["empId", "date"],
          whenMatched: "merge",
          whenNotMatched: "insert",
        },
      },
      { $project: { _id: 0, empId: 1, date: 1, shift: 1 } },
    ];

    const result = await Roster.aggregate(pipeline);
    return { status: true, message: "Roster updated successfully", data: result };
  } catch (error) {
    return { status: false, message: "Failed to update roster", error };
  }
};
