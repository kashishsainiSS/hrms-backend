import mongoose from "mongoose";

const SalaryStructureSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true
  },
  effectiveFrom: {
    type: Date
  },
  disbursementFrom: {
    type: Date
  },
  salaryComponents: [
    {
      head: {
        type: String
      },
      monthlyValue: {
        type: String
      },
      yearlyValue: {
        type: String
      },
      frequency: {
        type: String,
        enum: ["Monthly", "Yearly"]
      },
    },
  ],
  benefits: [
    {
      head: {
        type: String
      },
      monthlyValue: {
        type: String
      },
      yearlyValue: {
        type: String
      },
      frequency: {
        type: String,
        enum: ["Monthly", "Yearly"]
      },
    },
  ],
  grossSalary: {
    monthly: {
      type: String
    },
    yearly: {
      type: String
    },
  },
  ctc: {
    monthly: {
      type: String
    },
    yearly: {
      type: String
    },
  },
  inHandSalary: {
    type: String
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  }
});

const SalaryStructure = mongoose.model("SalaryStructure", SalaryStructureSchema);

export default SalaryStructure