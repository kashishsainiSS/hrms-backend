import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'

dotenv.config()
cloudinary.config({
  cloud_name: 'dsckn1jjj',
  api_key: '591561974842918',
  api_secret: 'ANFnW5o7KEt4YGbjiefwKKf-XK8'
});

interface UploadedFile {
  buffer: string;
  filename: string;
}

async function uploadFile(file: any): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: process.env.bucketFolder_Name,
      public_id: file.filename.replace(/\.[^/.]+$/, ""),
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error : any) {
    console.log(error?.message)
    throw new Error('Failed to upload file to Cloudinary');
  }
}

async function deleteFile(public_id: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(`${process.env.bucketFolder_Name}/${public_id?.replace(/\.[^/.]+$/, "")}`);
    if (result.result === 'ok') {
      return true;
    } else {
      return false;
    }
  } catch (error : any) {
    return false;
  }
}

export { uploadFile, deleteFile };
