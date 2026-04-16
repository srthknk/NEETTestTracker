import mongoose, { Schema, model, models } from 'mongoose';
import { IMistakeLog } from '@/types';

const MistakeLogSchema = new Schema<IMistakeLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testId: {
      type: String,
      required: true,
      index: true,
    },
    mistakeType: {
      type: String,
      enum: ['conceptual', 'silly', 'guessing'],
      required: true,
    },
    marksLost: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      enum: ['Physics', 'Chemistry', 'Biology'],
      required: true,
    },
  },
  { timestamps: true }
);

export default models.MistakeLog ||
  model<IMistakeLog>('MistakeLog', MistakeLogSchema);
