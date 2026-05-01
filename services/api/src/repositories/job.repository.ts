import { JobModel } from '../models/job.model.js';

export const createJob = async (job: {
  jobId: string;
  pipelineId: string;
  input: Record<string, unknown>;
}) => {
  return JobModel.create(job);
};

export const updateJobStatus = async (
  jobId: string,
  payload: {
    status: 'pending' | 'running' | 'success' | 'failed';
    result?: Record<string, unknown> | null;
    error?: string | null;
  }
) => {
  return JobModel.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: payload.status,
        result: payload.result ?? null,
        error: payload.error ?? null
      }
    },
    { new: true }
  );
};
