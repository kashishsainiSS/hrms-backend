import { Response } from "express";
import {
  checkWebTemplate,
  createWebTemplate,
  getWebTemplate,
  updateWebTemplate,
} from "../../repository/websiteTemplate/websiteTemplate.repository";
import mongoose from "mongoose";

export const createWebTemplateService = async (req: any, res: Response) => {
  try {
    const { status, data, statusCode, message } = await checkWebTemplate({
      name: req.body?.webInfo?.metaData?.name,
    });
    if (status === "success") {
      res.status(statusCode).send({
        message,
        data,
        status,
      });
    } else {
      const { webInfo, sectionsLayout, webType, colorSetting } = req.body;
      const { status, statusCode, data, message } = await createWebTemplate({
        sectionsLayout,
        webInfo: { sections: webInfo, colorSetting },
        webType,
        name: webInfo?.metaData?.name,
        user: req.userId,
        company: req.bodyData.companyDetail || req.userId,
      });
      res.status(statusCode).send({
        message,
        data,
        status,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: err?.message,
      data: err?.message,
      status: "error",
    });
  }
};


export const getWebTemplateService = async (req : any, res : Response) => {
  try
  {
    const { status, data, statusCode, message } = await getWebTemplate({
      name: req.params?.slug?.split('-').join(' '),
    });
      res.status(statusCode).send({
        message,
        data,
        status,
      });
  }
  catch(err : any)
  {
    res.status(500).send({
      message: err?.message,
      data: err?.message,
      status: "error",
    });
  }
}

export const updateWebTemplateService = async (req: any, res: Response) => {
  try {
      const { webInfo, sectionsLayout, webType, colorSetting } = req.body;
      const { status, statusCode, data, message } = await updateWebTemplate({
        sectionsLayout,
        webInfo: { sections: webInfo, colorSetting },
        webType,
        name: webInfo?.metaData?.name,
        user: req.userId,
        company: req.bodyData.companyDetail,
        id : new mongoose.Types.ObjectId(req.body.id)
      });
      res.status(statusCode).send({
        message,
        data,
        status,
      });
  } catch (err: any) {
    res.status(500).send({
      message: err?.message,
      data: err?.message,
      status: "error",
    });
  }
};