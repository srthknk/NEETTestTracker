import mongoose, { Schema, model, models } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetMarks: {
      type: Number,
      default: 650,
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
