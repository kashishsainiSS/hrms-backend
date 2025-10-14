import mongoose, { Schema, Document } from "mongoose";

export interface CompanyDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  company: mongoose.Schema.Types.ObjectId;
  companyOrg: mongoose.Schema.Types.ObjectId;
  details: {
    doj: Date;
    confirmationDate: Date;
    managers:mongoose.Schema.Types.ObjectId[];
    department: mongoose.Schema.Types.ObjectId;
    designation: mongoose.Schema.Types.ObjectId;
    noticePeriod: string;
    workingLocation: mongoose.Schema.Types.ObjectId[];
    workTiming: mongoose.Schema.Types.ObjectId[];
    eCode: string;
    eType: string;
    eCategory: string;
    description: string;
    createdAt : Date
  }[];
  workHistory: any[];
  is_active: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const CompanyDetailsSchema: Schema<CompanyDetailsI> =
  new Schema<CompanyDetailsI>({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    companyOrg: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    details: [
      {
        doj: {
          type: Date,
        },
        confirmationDate: {
          type: Date,
        },
        managers: [{ type: Schema.Types.ObjectId, ref: "User" }],
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DepartmentCategory",
        },
        designation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Department",
        },
        noticePeriod: {
          type: String,
        },
        workingLocation: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "workLocation",
        }],
        workTiming: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "workTiming",
        }],
        eCode: {
          type: String,
        },
        eType: {
          type: String,
        },
        eCategory: {
          type: String,
        },
        description: {
          type: String,
        },
        createdAt : {
          type : Date,
          default : new Date()
        }
      },
    ],
    workHistory: {
      type: [],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
    },
  });

const CompanyDetails = mongoose.model<CompanyDetailsI>(
  "CompanyDetail",
  CompanyDetailsSchema
);
export default CompanyDetails;
