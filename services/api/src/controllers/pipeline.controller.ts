import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../errors/api-error.js';
import {
  createPipelineService,
  triggerPipelineService
} from '../services/pipeline.service.js';
import {
  createPipelineSchema,
  triggerPipelineSchema
} from '../validators/pipeline.validator.js';

export const createPipelineController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createPipelineSchema.parse(req.body);
  const pipeline = await createPipelineService(parsed);

  res.status(StatusCodes.CREATED).json({
    id: pipeline._id,
    pipelineId: pipeline.pipelineId,
    name: pipeline.name,
    description: pipeline.description,
    steps: pipeline.steps,
    createdAt: pipeline.createdAt
  });
};

export const triggerPipelineController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pipelineId } = req.params;
  if (!pipelineId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'pipelineId is required');
  }

  const parsed = triggerPipelineSchema.parse(req.body);
  const job = await triggerPipelineService(pipelineId, parsed.input);

  res.status(StatusCodes.ACCEPTED).json(job);
};
