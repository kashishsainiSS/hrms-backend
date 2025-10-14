const Joi = require('joi');

const TravelDetailsSchema = Joi.object({
  country: Joi.string(),
  state: Joi.string(),
  fromCity: Joi.string(),
  toCity: Joi.string(),
  startDate: Joi.date().required().messages({
    "date.base": "Start date must be a valid date.",
    "any.required": "Start date is required.",
  }),
  endDate: Joi.date().required().messages({
    "date.base": "End date must be a valid date.",
    "any.required": "End date is required.",
  }),
  travelMode: Joi.string().required().messages({
    "string.base": "Travel mode must be a string.",
    "string.empty": "Travel mode is required.",
    "any.required": "Travel mode is required.",
  }),
  amount: Joi.string(),
  isCab: Joi.boolean(),
  cabFair: Joi.string(),
  isAccommodation: Joi.boolean(),
  locality: Joi.string().required().messages({
    "string.base": "Locality must be a string.",
    "string.empty": "Locality is required.",
    "any.required": "Locality is required.",
  }),
  durationOfStay: Joi.number().required().messages({
    "number.base": "Duration of stay must be a number.",
    "any.required": "Duration of stay is required.",
  }),
  accommodationCost: Joi.string().required().messages({
    "string.base": "Accommodation cost must be a string.",
    "string.empty": "Accommodation cost is required.",
    "any.required": "Accommodation cost is required.",
  }),
});

const AdditionalExpenseSchema = Joi.object({
  type: Joi.string().required().messages({
    "string.base": "Expense type must be a string.",
    "string.empty": "Expense type is required.",
    "any.required": "Expense type is required.",
  }),
  amount: Joi.string().required().messages({
    "string.base": "Expense amount must be a string.",
    "string.empty": "Expense amount is required.",
    "any.required": "Expense amount is required.",
  }),
});

const TripSchema = Joi.object({
  title: Joi.string().trim().required().min(3).max(100).messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least {#limit} characters long.",
    "string.max": "Title cannot be more than {#limit} characters long.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
  }),
  thumbnail: Joi.string(),
  currency: Joi.string(),
  type: Joi.string().valid("individual", "group").default("individual"),
  isActive: Joi.boolean().default(true),
  participants: Joi.array().items(Joi.string()),
  travelDetails: Joi.array().items(TravelDetailsSchema),
  additionalExpenses: Joi.array().items(AdditionalExpenseSchema),
}).options({ abortEarly: false });;

module.exports = {TripSchema};
