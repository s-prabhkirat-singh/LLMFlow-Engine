import { env } from '../config/env.js';
import { getPipelineByPipelineId } from '../repositories/pipeline.repository.js';
import {
  getJobByJobId,
  markJobPendingForRetry,
  markJobRunning,
  updateJobStatus
} from '../repositories/job.repository.js';
import { executePipeline } from '../services/pipeline-engine.service.js';

type QueueJobMessage = {
  jobId: string;
  pipelineId: string;
  input: Record<string, unknown>;
};

const normalizeStepsForExecution = (
  steps: Array<{
    type: 'input' | 'llm' | 'output';
    key?: string | null;
    prompt?: string | null;
    model?: string | null;
  }>
) => {
  return steps.map((step) => ({
    type: step.type,
    key: step.key ?? undefined,
    prompt: step.prompt ?? undefined,
    model: step.model ?? undefined
  }));
};

export const processPipelineJob = async (
  message: QueueJobMessage
): Promise<{ shouldRetry: boolean }> => {
  const running = await markJobRunning(message.jobId);

  if (!running) {
    const existing = await getJobByJobId(message.jobId);
    if (existing?.status === 'success' || existing?.status === 'failed') {
      return { shouldRetry: false };
    }

    throw new Error(`Job '${message.jobId}' is not in pending state`);
  }

  try {
    const pipeline = await getPipelineByPipelineId(message.pipelineId);

    if (!pipeline) {
      throw new Error(`Pipeline '${message.pipelineId}' not found`);
    }

    const result = await executePipeline({
      jobId: message.jobId,
      pipelineId: message.pipelineId,
      attempt: running.attemptCount,
      steps: normalizeStepsForExecution(pipeline.steps),
      input: message.input
    });

    await updateJobStatus(message.jobId, {
      status: 'success',
      result,
      error: null
    });

    return { shouldRetry: false };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Pipeline execution failed';

    const hasRetriesLeft = running.attemptCount < running.maxAttempts;

    if (hasRetriesLeft) {
      await markJobPendingForRetry(message.jobId, errorMessage);
      return { shouldRetry: true };
    }

    await updateJobStatus(message.jobId, {
      status: 'failed',
      error: errorMessage,
      result: null
    });

    return { shouldRetry: false };
  }
};
