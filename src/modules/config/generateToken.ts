import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET as string;
const expiresIn = process.env.EXPIRES_TOKEN || "1h"; // fallback to 1 hour

const generateToken = (payload: object): string => {
  const secretKey = process.env.SECRET_KEY ?? '@#$4515Rahulkushwa_675@#';
  const token = jwt.sign(payload, secretKey, { expiresIn:"25h"});
  return token;
};

export default generateToken;


export const generateResetPasswordToken = (userId : string) => {
  const secretKey = process.env.SECRET_KEY ?? '@#$4515Rahulkushwa_675@#';
  const token = jwt.sign({userId : userId}, secretKey, { expiresIn: '24h' });
  return token;
}

export const verifyResetPasswordToken = (token : string) : any => {
  const secretKey = process.env.SECRET_KEY ?? '@#$4515Rahulkushwa_675@#';
  const decoded = jwt.verify(token, secretKey) as {
    userId: string;
  };
  return decoded?.userId
}