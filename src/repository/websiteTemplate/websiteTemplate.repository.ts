import WebsiteTemplate from "../../schemas/websiteTemplate/websiteTemplate";

export const checkWebTemplate = async (data: any) => {
  try {
    const webTemp = await WebsiteTemplate.findOne({
      name: { $regex: new RegExp(`^${data?.name?.trim()}$`, "i") },
    });
    if (webTemp) {
      return {
        status: "success",
        data: webTemp,
        statusCode: 300,
        message: `${data?.name} Name is already registered`,
      };
    } else {
      return {
        status: "error",
        data: "Template does not exists",
        message: "Template does not exists",
        statusCode: 400,
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      message: err?.message,
      statusCode: 400,
    };
  }
};

export const createWebTemplate = async (datas: any) => {
  try {
    const webTemp = new WebsiteTemplate(datas);
    const savedWebTemp = await webTemp.save();
    return {
      statusCode: 200,
      status: "success",
      data: savedWebTemp,
      message: "Template createed successfully",
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      status: "error",
      data: err?.message,
      message: err?.message,
    };
  }
};

export const getWebTemplate = async (datas: any) => {
  try {
    const template = await WebsiteTemplate.findOne({
      name: { $regex: new RegExp(`^${datas?.name?.trim()}$`, "i") },
      // status : 'approved'
    });
    if (template) {
      return {
        status: "success",
        data: template,
        statusCode: 200,
        message: "Retrieve Template Successfully",
      };
    } else {
      return {
        status: "error",
        data: "Template does not exists",
        statusCode: 400,
        message: "Template does not exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 400,
      message: err?.message,
    };
  }
};

export const updateWebTemplate = async (datas: any) => {
  try {
    const template = await WebsiteTemplate.findById(datas.id);
    if (template) {
      const temp = await WebsiteTemplate.findByIdAndUpdate(datas.id, {$set : {...datas}})
      return {
        status: "success",
        data: temp,
        statusCode: 200,
        message: "Update Template Successfully",
      };
    } else {
      return {
        status: "error",
        data: "Template does not exists",
        statusCode: 400,
        message: "Template does not exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 400,
      message: err?.message,
    };
  }
};