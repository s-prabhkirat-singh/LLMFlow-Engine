import { getPipelineByPipelineId } from '../repositories/pipeline.repository.js';
import {
  getJobByJobId,
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
): Promise<void> => {
  const running = await markJobRunning(message.jobId);

  if (!running) {
    const existing = await getJobByJobId(message.jobId);
    if (existing?.status === 'success' || existing?.status === 'failed') {
      return;
    }

    throw new Error(`Job '${message.jobId}' is not in pending state`);
  }

  try {
    const pipeline = await getPipelineByPipelineId(message.pipelineId);

    if (!pipeline) {
      throw new Error(`Pipeline '${message.pipelineId}' not found`);
    }

    const result = await executePipeline({
      steps: normalizeStepsForExecution(pipeline.steps),
      input: message.input
    });

    await updateJobStatus(message.jobId, {
      status: 'success',
      result,
      error: null
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Pipeline execution failed';

    await updateJobStatus(message.jobId, {
      status: 'failed',
      error: errorMessage,
      result: null
    });

    throw error;
  }
};
