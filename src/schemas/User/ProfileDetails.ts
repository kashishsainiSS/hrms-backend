import mongoose, { Schema, Document } from "mongoose";


interface addressInfo  {
  address?:string;
  country?:string;
  state?:string;
  city?:string;
  pinCode?:string
}

interface ProfileDetailsI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  nickName?: string;
  mobileNo?: string;
  language?: String[];
  emergencyNo?: String;
  dob?:String;
  personalEmail?:String;
  bloodGroup?:String;
  panNo?:String;
  aadharNo?:String;
  pfUanNo?:String;
  maritalStatus?:String;
  weddingDate?:String;
  insuranceCardNo?:string;
  healthCardNo?:String;
  medicalCertificationDetails?:String;
  refferedBy?:String;
  addressInfo?:addressInfo[]
}

const ProfileDetailsSchema = new mongoose.Schema<ProfileDetailsI>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  nickName: {
    type: String,
    trim: true,
  },
  personalEmail:{
    type : String
  },
  dob:{
    type : Date
  },
  language: {
    type: Array,
    default: [],
  },
  mobileNo: {
    type: String,
    trim: true,
  },
  emergencyNo: {
    type: String,
    trim: true,
  },
  bloodGroup:{
    type : String
  },
  panNo:{
    type : String
  },
  aadharNo:{
    type : String
  },
  pfUanNo:{
    type : String
  },
  maritalStatus :  {
    type : String
  },
  insuranceCardNo:{
    type : String
  },
  healthCardNo:{
    type : String
  },
  weddingDate:{
    type : String
  },
  medicalCertificationDetails : {
    type : String
  },
  refferedBy:{
    type : String
  },
  addressInfo: {
    type: [{
      address : String,
      country: String,
      state:String,
      city: String,
      pinCode: String
    }],
    default: [],
  },
});

export default mongoose.model<ProfileDetailsI>(
  "ProfileDetails",
  ProfileDetailsSchema
);
