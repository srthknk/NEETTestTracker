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
    studentName: {
      type: String,
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || v.endsWith('@gmail.com');
        },
        message: 'Student email must end with @gmail.com',
      },
    },
    parentName: {
      type: String,
      trim: true,
    },
    parentEmails: {
      type: [String],
      default: [],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string[]) {
          return !v || v.every(email => !email || email.endsWith('@gmail.com'));
        },
        message: 'All parent emails must end with @gmail.com',
      },
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
