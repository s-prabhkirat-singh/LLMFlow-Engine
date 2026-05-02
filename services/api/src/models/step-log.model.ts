import mongoose, { Schema } from 'mongoose';

const stepLogSchema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true
    },
    pipelineId: {
      type: String,
      required: true,
      index: true
    },
    stepIndex: {
      type: Number,
      required: true
    },
    stepType: {
      type: String,
      enum: ['input', 'llm', 'output'],
      required: true
    },
    status: {
      type: String,
      enum: ['started', 'success', 'failed'],
      required: true,
      index: true
    },
    input: {
      type: Schema.Types.Mixed,
      default: null
    },
    output: {
      type: Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    attempt: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const StepLogModel = mongoose.model('StepLog', stepLogSchema);
