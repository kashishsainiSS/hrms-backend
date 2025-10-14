
import { Schema, model, Document } from "mongoose";

export interface IRoster extends Document {
  empId: string;
  name:string;
  date: Date;
  teamLeader:string;
  shiftTime: string; // Morning / Evening / Night / WO / Leave
  status:string;
  day:string;
}

const RosterSchema = new Schema<IRoster>({
  empId: { type: String, required: true },
  name:{type:String},
  date: { type: Date, required: true },
  teamLeader:{type:String,required:true},
  shiftTime: { type: String, required: true },
  status:{type:String, required:true},
  day:{type:String},
},
{timestamps:true}
);

export default model<IRoster>("Roster", RosterSchema);