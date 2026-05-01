import { StatusCodes } from 'http-status-codes';
import { customAlphabet } from 'nanoid';

import { ApiError } from '../errors/api-error.js';
import { createJob } from '../repositories/job.repository.js';
import {
  createPipeline,
  getPipelineByPipelineId
} from '../repositories/pipeline.repository.js';
import { type CreatePipelineInput } from '../validators/pipeline.validator.js';

const generateJobId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

const validatePipelineStepFlow = (steps: CreatePipelineInput['steps']): void => {
  if (steps[0]?.type !== 'input') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'First step must be input');
  }

  if (steps[steps.length - 1]?.type !== 'output') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Last step must be output');
  }
};

export const createPipelineService = async (payload: CreatePipelineInput) => {
  validatePipelineStepFlow(payload.steps);

  const existing = await getPipelineByPipelineId(payload.pipelineId);
  if (existing) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `Pipeline with id '${payload.pipelineId}' already exists`
    );
  }

  return createPipeline(payload);
};

export const triggerPipelineService = async (
  pipelineId: string,
  input: Record<string, unknown>
) => {
  const pipeline = await getPipelineByPipelineId(pipelineId);

  if (!pipeline) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Pipeline '${pipelineId}' not found`);
  }

  const job = await createJob({
    jobId: generateJobId(),
    pipelineId,
    input
  });

  return {
    jobId: job.jobId,
    pipelineId: job.pipelineId,
    status: job.status,
    createdAt: job.createdAt
  };
};
