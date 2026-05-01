import mongoose, { Schema } from 'mongoose';

const pipelineStepSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['input', 'llm', 'output'],
      required: true
    },
    key: {
      type: String
    },
    prompt: {
      type: String
    },
    model: {
      type: String
    }
  },
  { _id: false }
);

const pipelineSchema = new Schema(
  {
    pipelineId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    steps: {
      type: [pipelineStepSchema],
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const PipelineModel = mongoose.model('Pipeline', pipelineSchema);
