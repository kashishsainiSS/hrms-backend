import { generateError } from "../config/Error/functions";
import CompanyFollow from "../schemas/company/CompanyFollower";

const followCompanyByUser = async (data: any) => {
  try {
    const comp = await CompanyFollow.findOne({
      company: data.company,
      follower: data.userId,
    });
    if (comp) {
      throw generateError(`already following this company`, 400);
    }
    const createdData = new CompanyFollow({
      company: data.company,
      follower: data.userId,
    });
    const savedData = await createdData.save();
    return { status: "success", data: savedData };
  } catch (err: any) {
    return { status: "error", data: err };
  }
};

module.exports = { followCompanyByUser };
