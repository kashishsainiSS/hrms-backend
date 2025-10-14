import mongoose from "mongoose";

export interface GetRoleUsersParams {
    company: mongoose.Types.ObjectId;
  }