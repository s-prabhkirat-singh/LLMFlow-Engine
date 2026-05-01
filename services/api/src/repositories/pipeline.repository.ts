import { PipelineModel } from '../models/pipeline.model.js';
import { type CreatePipelineInput } from '../validators/pipeline.validator.js';

export const createPipeline = async (pipeline: CreatePipelineInput) => {
  return PipelineModel.create(pipeline);
};

export const getPipelineByPipelineId = async (pipelineId: string) => {
  return PipelineModel.findOne({ pipelineId }).lean();
};
