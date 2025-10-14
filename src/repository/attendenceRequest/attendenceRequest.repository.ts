import AttendanceRequest from "../../schemas/AttendenceRequest/attendenceRequest.schema";
import mongoose from "mongoose";
// Find one request by the query
export async function findOneAttendenceRequest(query: any) {
  try {
    const attendance = await AttendanceRequest.findOne(query);
    return attendance;
  } catch (err: any) {
    throw new Error(`Failed to find attendance request: ${err.message}`);
  }
}

// create and update existing request
export async function createAttendenceRequest(data: any): Promise<any> {
  try {
    const attendanceData = new AttendanceRequest(data);
    const savedAttendance = await attendanceData.save();

    return {
      statusCode: 200,
      status: "success",
      data: savedAttendance,
      message: "Attendance request created successfully",
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      status: "error",
      data: err.message,
      message: "Failed to create attendance request",
    };
  }
}

export async function findAttendanceRequests(data: any) {
  try {
    const { startDate, endDate, user } = data;

    const pipeline = [
      // Match the attendance requests within the specified date range for the given user
      {
        $match: {
          user: new mongoose.Types.ObjectId(user),
          date: {
            $gte: startDate,
            $lte: endDate
          },
        },
      },
      // Lookup to fetch approved leave requests
      {
        $lookup: {
          from: 'requests',
          let: {
            startDate,
            endDate,
            user: new mongoose.Types.ObjectId(user),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', '$$user'] },
                    { $lte: ['$startDate', '$$endDate'] },
                    { $gte: ['$endDate', '$$startDate'] },
                    { $eq: ['$status', 'approved'] },
                  ],
                },
              },
            },
          ],
          as: 'leaveRequests',
        },
      },
      // Lookup to fetch holiday information from company policies
      {
        $lookup: {
          from: 'companypolicies',
          let: {
            policyId: '$policy',
            date: '$date',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$policyId'],
                },
              },
            },
            {
              $unwind: '$holidays',
            },
            {
              $addFields: {
                holidaysDateConverted: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$holidays.date',
                  },
                },
                lookupDate: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$$date',
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ['$holidaysDateConverted', '$lookupDate'],
                },
              },
            },
            {
              $project: {
                holiday: '$holidays',
              },
            },
          ],
          as: 'holidayInfo',
        },
      },
      // Lookup to fetch general policy information
      {
        $lookup: {
          from: 'companypolicies',
          localField: 'policy',
          foreignField: '_id',
          as: 'policyInfo',
        },
      },
      // Add additional fields for further processing
      {
        $addFields: {
          isHoliday: { $gt: [{ $size: '$holidayInfo' }, 0] },
          officeStartTimeUTC: {
            $dateAdd: {
              startDate: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                      'T',
                      '$officeStartTime',
                      ':00',
                    ],
                  },
                },
              },
              unit: 'minute',
              amount: 0, // No change
            },
          },
          officeEndTimeUTC: {
            $dateAdd: {
              startDate: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                      'T',
                      '$officeEndTime',
                      ':00',
                    ],
                  },
                },
              },
              unit: 'minute',
              amount: 0, // No change
            },
          },
          activePunches: {
            $filter: {
              input: '$punchRecords',
              as: 'punch',
              cond: { $eq: ['$$punch.isActive', true] },
            },
          },
          // Additional fields for grace periods
          gracePeriodMinutesLate: {
            $arrayElemAt: ['$policyInfo.gracePeriodMinutesLate', 0],
          },
          gracePeriodMinutesEarly: {
            $arrayElemAt: ['$policyInfo.gracePeriodMinutesEarly', 0],
          },
          isSaturday: { $eq: [{ $dayOfWeek: '$date' }, 7] },
          isSunday: { $eq: [{ $dayOfWeek: '$date' }, 1] },
          sundayPolicy: { $arrayElemAt: [[true], 0] },
          saturdayIndex: {
            $cond: [
              { $eq: [{ $dayOfWeek: '$date' }, 7] },
              {
                $subtract: [
                  {
                    $ceil: { $divide: [{ $dayOfMonth: '$date' }, 7] },
                  },
                  1,
                ],
              },
              null,
            ],
          },
          saturdaysSchedule: [1, 1, 1, 1, 1], // Example schedule for Saturdays
        },
      },
      // Project fields for final output
      {
        $project: {
          punchInTime: { $arrayElemAt: ['$activePunches.time', 0] },
          punchOutTime: { $arrayElemAt: ['$activePunches.time', -1] },
          officeStartTimeUTC: 1,
          officeEndTimeUTC: 1,
          punchRecords: 1,
          date: 1,
          gracePeriodMinutesLate: 1,
          gracePeriodMinutesEarly: 1,
          isHoliday: 1,
          holidayInfo: 1,
          leaveRequests: 1,
          isSaturday: 1,
          isSunday: 1,
          sundayPolicy: 1,
          isSaturdayWorkingDay: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isSaturday', true] },
                  { $gte: ['$saturdayIndex', 0] },
                  { $lt: ['$saturdayIndex', 5] },
                ],
              },
              {
                $eq: [
                  { $arrayElemAt: ['$saturdaysSchedule', '$saturdayIndex'] },
                  1,
                ],
              },
              false,
            ],
          },
        },
      },
      // Add fields to calculate late and early leave
      {
        $addFields: {
          lateComingMinutes: {
            $cond: {
              if: {
                $gt: [
                  { $subtract: ['$punchInTime', '$officeStartTimeUTC'] },
                  { $multiply: ['$gracePeriodMinutesLate', 60000] },
                ],
              },
              then: {
                $divide: [
                  {
                    $subtract: [
                      '$punchInTime',
                      {
                        $add: [
                          '$officeStartTimeUTC',
                          { $multiply: ['$gracePeriodMinutesLate', 60000] },
                        ],
                      },
                    ],
                  },
                  60000,
                ],
              },
              else: 0,
            },
          },
          earlyGoingMinutes: {
            $cond: {
              if: {
                $gt: [
                  {
                    $subtract: [
                      '$officeEndTimeUTC',
                      { $multiply: ['$gracePeriodMinutesEarly', 60000] },
                    ],
                  },
                  '$punchOutTime',
                ],
              },
              then: {
                $divide: [
                  {
                    $subtract: [
                      {
                        $subtract: [
                          '$officeEndTimeUTC',
                          { $multiply: ['$gracePeriodMinutesEarly', 60000] },
                        ],
                      },
                      '$punchOutTime',
                    ],
                  },
                  60000,
                ],
              },
              else: 0,
            },
          },
          // Determine attendance status
          status: {
            $cond: {
              if: '$isHoliday',
              then: 'Holiday',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$leaveRequests' }, 0] },
                  then: { $arrayElemAt: ['$leaveRequests.leaveType', 0] },
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ['$punchInTime', null] },
                          { $eq: ['$punchOutTime', null] },
                        ],
                      },
                      then: 'Absent',
                      else: {
                        $cond: {
                          if: '$isSunday',
                          then: {
                            $cond: {
                              if: { $eq: ['$sundayPolicy', true] },
                              then: 'Weekend Leave (Sunday)',
                              else: {
                                $cond: {
                                  if: '$isSaturday',
                                  then: {
                                    $cond: {
                                      if: { $eq: ['$isSaturdayWorkingDay', true] },
                                      then: 'Working on Saturday',
                                      else: 'Off on Saturday',
                                    },
                                  },
                                  else: {
                                    $cond: {
                                      if: {
                                        $and: [
                                          { $gt: ['$lateComingMinutes', 0] },
                                          { $gt: ['$earlyGoingMinutes', 0] },
                                        ],
                                      },
                                      then: 'Late and Early Leave',
                                      else: {
                                        $cond: {
                                          if: { $gt: ['$lateComingMinutes', 0] },
                                          then: 'Late',
                                          else: {
                                            $cond: {
                                              if: { $gt: ['$earlyGoingMinutes', 0] },
                                              then: 'Early',
                                              else: 'Present',
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          else: 'Present',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    const attendanceRequests = await AttendanceRequest.aggregate(pipeline);
    return attendanceRequests;
  } catch (error) {
    console.error('Error fetching attendance requests:', error);
    throw new Error('Could not fetch attendance requests');
  }
}





