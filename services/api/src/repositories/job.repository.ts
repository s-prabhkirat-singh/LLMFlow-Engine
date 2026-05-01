import { JobModel } from '../models/job.model.js';

export const createJob = async (job: {
  jobId: string;
  pipelineId: string;
  input: Record<string, unknown>;
}) => {
  return JobModel.create(job);
};
