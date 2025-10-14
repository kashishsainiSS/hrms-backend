import mongoose, { Document } from "mongoose";

interface addressInfo  {
  address?:string;
  country?:string;
  state?:string;
  city?:string;
  pinCode?:string
}

interface CompanyI extends Document {
  company_name: string;
  companyCode:string;
  companyOrg:mongoose.Schema.Types.ObjectId,
  companyType:string;
  verified_email_allowed:boolean;
  policy:mongoose.Schema.Types.ObjectId;
  createdBy : mongoose.Schema.Types.ObjectId;
  activeUser:mongoose.Schema.Types.ObjectId;
  is_active?: boolean;
  logo?: string;
  bio?: string;
  mobileNo?: string;
  workNo?: string;
  facebookLink?: string;
  instagramLink?: string;
  linkedInLink?: string;
  twitterLink?: string;
  githubLink?: string;
  telegramLink?: string;
  otherLinks?: string[];
  webLink?: string;
  address1?: string;
  address2?: string;
  pinCode?: string;
  country?: string;
  state?: string;
  city?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  addressInfo?:addressInfo[]
}

const companySchema = new mongoose.Schema<CompanyI>({
  company_name: {
    type: String,
    unique: true,
    index: true,
    trim: true,
  },
  companyOrg : {
    type : mongoose.Schema.Types.ObjectId,
  },
  policy:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'CompanyPolicy'
  },
  companyCode : {
    type : String,
    required : true
  },
  companyType:{
    type : String,
    default : 'company'
  },
  is_active: {
    type: Boolean,
    default: false
  },
  verified_email_allowed: {
    type: Boolean,
    default: false,
  },
  logo: {
    name : {
      type : String
    },
    url : {
      type : String
    },
    type : {
      type : String
    }
  },
  bio: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  workNo: {
    type: String,
  },
  facebookLink: {
    type: String,
  },
  instagramLink: {
    type: String,
  },
  twitterLink: {
    type: String,
  },
  githubLink: {
    type: String,
  },
  telegramLink: {
    type: String,
  },
  linkedInLink: {
    type: String,
  },
  otherLinks: {
    type: [{ type: String }],
  },
  addressInfo: {
    type: [{
      address : String,
      country: String,
      state:String,
      city: String,
      pinCode: String
    }]
  },
  activeUser : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'User'
  },
  createdBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
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

export default mongoose.model<CompanyI>("Company", companySchema);
