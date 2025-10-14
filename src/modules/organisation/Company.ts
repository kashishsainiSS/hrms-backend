import { Response, NextFunction } from "express";
import User from "../../schemas/User/User";
import Company from "../../schemas/company/Company";
import ProfileDetails from "../../schemas/User/ProfileDetails";
import QualificationDetails from "../../schemas/User/Qualifications";
import { createValidation } from "./utils/validation";
import { generateError } from "../config/function";
import generateToken from "../config/generateToken";
import Token from "../../schemas/Token/Token";
import WorkExperience from "../../schemas/User/WorkExperience";
import BankDetails from "../../schemas/User/BankDetails";
import DocumentDetails from "../../schemas/User/Document";
import CompanyPolicy from "../../schemas/company/CompanyPolicy";
import CompanyDetails from "../../schemas/User/CompanyDetails";
import FamilyDetails from "../../schemas/User/FamilyDetails";
import { deleteFile, uploadFile } from "../../repository/uploadDoc.repository";
import { statusCode } from "../../config/helper/statusCode";
import mongoose from "mongoose";

const createCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = createValidation.validate(req.body);
    if (result.error) {
      throw generateError(result.error.details, 422);
    }

    const token = await Token.findOne({ token: req.query.token });
    if (!token) {
      throw generateError("Invalid token or token has expired", 400);
    }

    const user = await User.findById(token.userId);
    if (!user || user?.role !== "superadmin") {
      throw generateError("Invalid token or token has expired", 400);
    }

    const existsComp = await Company.findOne({
      company_name: new RegExp(
        req.body.companyDetails?.company_name?.trim(),
        "i"
      ),
    });
    if (existsComp) {
      throw generateError(
        `${existsComp.company_name} company already exists`,
        400
      );
    }

    const existingCompanyCode = await Company.findOne({
      company_name: new RegExp(
        req.body.companyDetails?.companyCode?.trim(),
        "i"
      ),
    });
    if (existingCompanyCode) {
      throw generateError(
        `${existingCompanyCode?.companyCode} code is alredy existing with ${existingCompanyCode.company_name} company`,
        400
      );
    }


    const comp: any = new Company({
      company_name: req.body.companyDetails?.company_name?.trim(),
      companyType: "organisation",
      companyCode : req.body.companyDetails?.companyCode,
      is_active: true,
      activeUser:token.userId,
      createdBy: token.userId,
      ...req.body.companyDetails,
    });

    const createdComp: any = await comp.save();

    const compPolicy = new CompanyPolicy({
      company: createdComp._id,
      createdBy: user._id,
    });

    const createdCompPolicy: any = await compPolicy.save();

    createdComp.policy = createdCompPolicy._id;
    createdComp.companyOrg = createdComp._id;
    await createdComp.save();

    const profileDetail = new ProfileDetails({
      user: user._id,
    });
    const createdProfileDetails = await profileDetail.save();

    const BankDetail = new BankDetails({
      user: user._id,
    });
    const savedBank = await BankDetail.save();

    const WorkExperienceDetail = new WorkExperience({
      user: user._id,
    });

    const savedWorkExperience = await WorkExperienceDetail.save();

    const documentDetails = new DocumentDetails({
      user: user._id,
    });

    const savedDocument = await documentDetails.save();

    const familyDetails = new FamilyDetails({
      user: user._id,
    });

    const savedFamilyDetails = await familyDetails.save();

    const companyDetails = new CompanyDetails({
      user: user._id,
      company: createdComp._id,
      companyOrg: createdComp._id,
      is_active: true,
    });

    const savedCompanyDetails = await companyDetails.save();

    const qualifications = new QualificationDetails({
      user: user._id,
    });

    const savedQualifications = await qualifications.save()

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          name: req.body.name,
          code : req.body.code,
          profile_details: createdProfileDetails._id,
          companyOrg: createdComp._id,
          companyDetail: savedCompanyDetails._id,
          password: req.body.password,
        },
      },
      { new: true }
    )
      .populate("profile_details")
      .populate("companyDetail");

    if (!updatedUser) {
      throw generateError("Something went wrong, contact administration", 400);
    }

    await token.deleteOne();

    if (req.body.companyDetails.logo && req.body.companyDetails.logo !== "") {
      try{
        let url = await uploadFile(req.body.companyDetails.logo);
      comp.logo = {
        name: req.body.companyDetails.logo.filename,
        url: url,
        type: req.body.companyDetails.logo.type,
      };
      await comp.save();
      }
      catch{}
    }

    const { password, ...rest } = updatedUser.toObject();
    return res.status(201).send({
      message: `${comp.company_name} company has been created successfully`,
      data: {
        ...rest,
        bankDetails: savedBank._id,
        documentDetails: savedDocument._id,
        workExperience: savedWorkExperience._id,
        companyPolicy: createdCompPolicy._id,
        familyDetails: savedFamilyDetails._id,
        qualifications:savedQualifications?._id,
        authorization_token: generateToken({ userId: updatedUser._id }),
      },
      statusCode: 201,
      success: true,
    });
  } catch (err: any) {
    next(err);
  }
};

const createOrganisationCompany = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const companyOrg = req.bodyData.companyOrg;
    let user: any = null;

    // Check the Company
    const checkExistsCompany = await Company.findOne({company_name : { $regex: new RegExp(req.body.companyDetails?.company_name?.trim(), 'i') }})
    if(checkExistsCompany){
      return res.status(statusCode.info).send({
        status: "error",
        data: `${checkExistsCompany.company_name} Company is already exists`,
        message: `${checkExistsCompany.company_name} Company is already exists`,
      });
    }

    const codeCompany = await Company.findOne({companyCode : { $regex: new RegExp(req.body.companyDetails?.companyCode?.trim(), 'i') }});
      if (codeCompany) {
        return res.status(statusCode.info).send({
          status: "error",
          data: `${codeCompany.companyCode} Code is already exists with ${codeCompany.company_name}`,
          message: `${codeCompany.companyCode} Code is already exists with ${codeCompany.company_name}`,
        });
    }

    // Check the User
    user = await User.findOne({ username: { $regex: new RegExp(req.body.username?.trim(), 'i') } });
    if (user) {
      return res.status(statusCode.info).send({
          status: "error",
          data: `${user.username} user is already exists`,
          message: `${user.username} user is already exists`,
      });
    } else {
      const codeUser = await User.findOne({ code: req.body.code?.trim() });
      if (codeUser) {
        return res.status(statusCode.info).send({
          status: "error",
          data: `${codeUser.code} Code is already exists with ${user.username}`,
          message: `${codeUser.code} Code is already exists with ${user.username}`,
        });
      }
      else {
        const userData = new User({
          name: req.body.name,
          username: req.body.username,
          password: req.body.password,
          code : req.body.code,
          role: "admin",
        });
        user = await userData.save();
      }
    }

    // Create the Company
    const comp: any = new Company({
      company_name: req.body.companyDetails?.company_name?.trim(),
      companyType: "company",
      is_active: true,
      ...req.body.companyDetails,
      companyOrg: companyOrg,
      activeUser:user._id,
      createdBy: userId,
    });

    const createdComp: any = await comp.save();

    const compPolicy = new CompanyPolicy({
      company: createdComp._id,
      createdBy: userId,
    });

    const createdCompPolicy: any = await compPolicy.save();

    createdComp.policy = createdCompPolicy._id;
    await createdComp.save();

    if (req.body.companyDetails.logo && req.body.companyDetails.logo !== "") {
      try
      {
        let url = await uploadFile(req.body.companyDetails.logo);
        comp.logo = {
          name: req.body.companyDetails.logo.filename,
          url: url,
          type: req.body.companyDetails.logo.type,
        };
        await comp.save();
      }catch{}
    }

    const profileDetail = new ProfileDetails({
      user: user._id,
    });
    const createdProfileDetails = await profileDetail.save();

    const BankDetail = new BankDetails({
      user: user._id,
    });
    await BankDetail.save();

    const WorkExperienceDetail = new WorkExperience({
      user: user._id,
    });

    await WorkExperienceDetail.save();

    const documentDetails = new DocumentDetails({
      user: user._id,
    });

    await documentDetails.save();

    const familyDetails = new FamilyDetails({
      user: user._id,
    });

    await familyDetails.save();

    const qualifications = new QualificationDetails({
      user: user._id,
    });

     await qualifications.save()

    const companyDetails = new CompanyDetails({
      user: user._id,
      company: createdComp._id,
      companyOrg: companyOrg,
      is_active: true,
    });

    const savedCompanyDetails = await companyDetails.save();

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          profile_details: createdProfileDetails._id,
          companyOrg: companyOrg,
          companyDetail: savedCompanyDetails._id,
          password: req.body.password,
        },
      },
      { new: true }
    )
      .populate("profile_details")
      .populate("companyDetail");

    res.status(statusCode.success).send({
      status: "success",
      data: `${createdComp.company_name} company has been created successfully`,
      message: `${createdComp.company_name} company has been created successfully`,
    });
  } catch (err: any) {
    return res.status(statusCode.serverError).send({
      status: "error",
      message: err?.message,
      data: err?.message,
    });
  }
};

const updateOrganisationCompany = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id);
    const comp = await Company.findOne({
      _id: _id,
      deletedAt: { $exists: false },
    });
    if (comp) {
      const updatedCompany : any = await Company.findByIdAndUpdate(
        _id,
        { $set: req.body.companyDetails },
        { new: true }
      );

      for (const file of req.body.companyDetails.deletedFiles) {
        await deleteFile(file);
      }

      if (req.body.companyDetails.logo && req.body.companyDetails.logo !== "" && req.body.companyDetails.isLogoEdit) {
        try{
          let url = await uploadFile(req.body.companyDetails.logo);
          updatedCompany.logo = {
          name: req.body.companyDetails.logo.filename,
          url: url,
          type: req.body.companyDetails.logo.type,
        };
        await updatedCompany.save();
        }
        catch{}
      }

      res.status(statusCode.success).send({
        message: "Company has been Successfully",
        data: updatedCompany,
        status: "success",
      });
    } else {
      res.status(statusCode.info).send({
        message: "Record does not exists",
        data: "Record does not exists",
        status: "error",
      });
    }
  } catch (err: any) {
    return res.status(statusCode.serverError).send({
      status: "error",
      message: err?.message,
      data: err?.message,
    });
  }
};

const filterCompany = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await Company.findOne({
      company_name: req.query?.company?.trim(),
    });
    if (result) {
      throw generateError(`${req.query.company} company is not allowed`, 400);
    }
    res.status(200).send({
      message: `${req.query.company} company is allowed`,
      data: `${req.query.company} company is allowed`,
      statusCode: 200,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export {
  createCompany,
  filterCompany,
  createOrganisationCompany,
  updateOrganisationCompany,
};
