import mongoose, { Schema, model, models } from 'mongoose';
import { IAnalyticsSummary } from '@/types';

const AnalyticsSummarySchema = new Schema<IAnalyticsSummary>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalTestsAttempted: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    highestScore: {
      type: Number,
      default: 0,
    },
    overallAccuracy: {
      type: Number,
      default: 0,
    },
    subjectWisePerformance: {
      physics: { type: Number, default: 0 },
      chemistry: { type: Number, default: 0 },
      botany: { type: Number, default: 0 },
      zoology: { type: Number, default: 0 },
    },
    mistakeAnalysis: {
      conceptual: { type: Number, default: 0 },
      silly: { type: Number, default: 0 },
      guessing: { type: Number, default: 0 },
    },
    estimatedAIR: {
      type: Number,
      default: 999999,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default models.AnalyticsSummary ||
  model<IAnalyticsSummary>('AnalyticsSummary', AnalyticsSummarySchema);
