import { Router } from 'express';

import { pipelineRouter } from './v1/pipeline.routes.js';

export const apiRouter = Router();

apiRouter.use('/pipelines', pipelineRouter);
