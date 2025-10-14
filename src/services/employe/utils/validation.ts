import * as Joi from 'joi';

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const customMessages = {
    "string.empty": "{#label} is required",
    "any.required": "{#label} is required",
    "string.min": "{#label} should be at least {#limit} characters",
    "string.max": "{#label} should be at most {#limit} characters",
    "number.min": "{#label} should be at least {#limit}",
    "number.max": "{#label} should be at most {#limit}",
    "array.min": "{#label} should have at least {#limit} items",
};

export const createUserValidation = Joi.object({
    title: Joi.string().required().messages(customMessages),
    name : Joi.string().min(5).max(80).trim().required().messages(customMessages),
    company : Joi.string().min(5).max(80).trim().required().messages(customMessages),
    username: Joi.string().min(4).trim().required().messages(customMessages),
    personalEmail: Joi.string().min(5).trim().required().messages(customMessages),
    code:Joi.string().min(4).required().messages(customMessages),
    pic: Joi.any().allow("").optional(),
    pfUanNo:Joi.string().allow("").optional(),
    aadharNo:Joi.string().allow("").optional(),
    panNo:Joi.string().allow("").optional(),
    refferedBy:Joi.string().allow("").optional(),
    maritalStatus:Joi.string().allow("").optional(),
    insuranceCardNo:Joi.string().allow("").optional(),
    healthCardNo:Joi.string().allow("").optional(),
    bloodGroup:Joi.string().allow("").optional(),
    weddingDate:Joi.string().allow("").optional(),
    dob:Joi.string().allow("").optional(),
    medicalCertificationDetails:Joi.string().allow("").optional(),
    nickName : Joi.string().trim().messages(customMessages),
    mobileNo: Joi.string().pattern(phoneRegExp).message('please provide a valid number').required(),
    emergencyNo: Joi.string().allow("").pattern(phoneRegExp).message('please provide a valid number'),
    password : Joi.string()
      .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
      .message(
        "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one digit."
      )
      .required(),
    language:Joi.array().messages(customMessages),
    bio:Joi.string().trim().allow("").optional(),
    addressInfo:Joi.array().min(1).required().messages(customMessages)
}).options({
  abortEarly : false
})

export const getStudentsValidation = Joi.object({
  section : Joi.string().required().messages(customMessages),
}).options({
abortEarly : false
})