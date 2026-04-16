import mongoose, { Schema, model, models } from 'mongoose';
import { ITest } from '@/types';

const TestSchema = new Schema<ITest>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    coaching: {
      type: String,
      enum: ['Allen', 'Aakash', 'PW', 'PW NRTS', 'NTA NEET'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Subject-wise marks (NEET structure: each subject out of 180)
    subjectWiseMarks: {
      physics: {
        obtained: {
          type: Number,
          required: true,
          min: 0,
          max: 180,
        },
        total: {
          type: Number,
          default: 180,
        },
      },
      chemistry: {
        obtained: {
          type: Number,
          required: true,
          min: 0,
          max: 180,
        },
        total: {
          type: Number,
          default: 180,
        },
      },
      botany: {
        obtained: {
          type: Number,
          required: true,
          min: 0,
          max: 180,
        },
        total: {
          type: Number,
          default: 180,
        },
      },
      zoology: {
        obtained: {
          type: Number,
          required: true,
          min: 0,
          max: 180,
        },
        total: {
          type: Number,
          default: 180,
        },
      },
    },
    // Total marks (calculated: sum of all subject obtained marks)
    totalMarksObtained: {
      type: Number,
      required: true,
      default: 720,
    },
    totalMarksPossible: {
      type: Number,
      default: 720,
    },
    // Percentiles
    subjectWisePercentiles: {
      physics: Number,
      chemistry: Number,
      botany: Number,
      zoology: Number,
    },
    overallPercentile: Number,
    // AIR (All India Rank) - calculated from percentile
    estimatedAIR: {
      type: Number,
      default: 999999,
    },
    // Deprecated fields (keeping for backward compatibility)
    marksObtained: {
      type: Number,
    },
    totalMarks: {
      type: Number,
      default: 720,
    },
    accuracy: {
      type: Number,
    },
    timeTaken: {
      type: Number,
      required: true,
      default: 0,
    },
    subjects: [
      {
        type: String,
        enum: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
      },
    ],
    chapters: {
      physics: String,
      chemistry: String,
      botany: String,
      zoology: String,
    },
    syllabusCovered: [String],
    tags: [
      {
        type: String,
        enum: ['full-syllabus', 'part-test', 'PYQ'],
      },
    ],
  },
  { timestamps: true }
);

export default models.Test || model<ITest>('Test', TestSchema);
