import { Document, ObjectId } from 'mongoose';

export interface ILibrarySection extends Document {
  sectionName: string;
  room: ObjectId;
  seats: ObjectId[];
  company: ObjectId;
  status: 'active' | 'inactive' | 'under_maintenance';
  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILibrarySeat extends Document {
    seatNumber: string;
    section: ObjectId;
    room: ObjectId;
    company: ObjectId;
    isAvailable: boolean;
    createdBy: ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

}

export interface ILibraryRoom extends Document {
    title: string;
    sections: ObjectId[];
    ratings:string;
    description:string;
    coverImage:any;
    company: ObjectId;
    user: ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }