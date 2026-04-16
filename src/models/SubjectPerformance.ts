import mongoose, { Schema, model, models } from 'mongoose';
import { ISubjectPerformance } from '@/types';

const SubjectPerformanceSchema = new Schema<ISubjectPerformance>(
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
    subject: {
      type: String,
      enum: ['physics', 'chemistry', 'biology'],
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    attemptedQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.SubjectPerformance ||
  model<ISubjectPerformance>('SubjectPerformance', SubjectPerformanceSchema);
