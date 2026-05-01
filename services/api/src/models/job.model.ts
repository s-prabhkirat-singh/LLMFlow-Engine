import mongoose, { Schema } from 'mongoose';

const jobSchema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pipelineId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
      index: true
    },
    input: {
      type: Schema.Types.Mixed,
      required: true
    },
    result: {
      type: Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const JobModel = mongoose.model('Job', jobSchema);
