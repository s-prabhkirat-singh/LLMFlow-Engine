import { Router } from 'express';

import {
  createPipelineController,
  triggerPipelineController
} from '../../controllers/pipeline.controller.js';

export const pipelineRouter = Router();

pipelineRouter.post('/', createPipelineController);
pipelineRouter.post('/:pipelineId/trigger', triggerPipelineController);
