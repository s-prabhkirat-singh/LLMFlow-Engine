import { Router } from 'express';

import {
  createPipelineController,
  getJobStatusController,
  triggerPipelineController
} from '../../controllers/pipeline.controller.js';

export const pipelineRouter = Router();

pipelineRouter.post('/', createPipelineController);
pipelineRouter.post('/:pipelineId/trigger', triggerPipelineController);
pipelineRouter.get('/jobs/:jobId', getJobStatusController);
