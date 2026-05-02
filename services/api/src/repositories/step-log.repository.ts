import { StepLogModel } from '../models/step-log.model.js';

export const createStepLog = async (payload: {
  jobId: string;
  pipelineId: string;
  stepIndex: number;
  stepType: 'input' | 'llm' | 'output';
  status: 'started' | 'success' | 'failed';
  input?: unknown;
  output?: unknown;
  error?: string | null;
  durationMs?: number;
  attempt?: number;
}) => {
  return StepLogModel.create({
    ...payload,
    input: payload.input ?? null,
    output: payload.output ?? null,
    error: payload.error ?? null,
    durationMs: payload.durationMs ?? 0,
    attempt: payload.attempt ?? 1
  });
};

export const getStepLogsByJobId = async (jobId: string) => {
  return StepLogModel.find({ jobId }).sort({ createdAt: 1 }).lean();
};
