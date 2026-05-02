import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../errors/api-error.js';
import { createStepLog } from '../repositories/step-log.repository.js';
import { renderTemplate } from '../utils/template.js';
import { runLlmCompletion } from './openai.service.js';

type PipelineStep = {
  type: 'input' | 'llm' | 'output';
  key?: string;
  prompt?: string;
  model?: string;
};

type ExecutePipelineArgs = {
  jobId: string;
  pipelineId: string;
  attempt: number;
  steps: PipelineStep[];
  input: Record<string, unknown>;
};

const executeStep = async (args: {
  step: PipelineStep;
  context: Record<string, unknown>;
  input: Record<string, unknown>;
}): Promise<unknown> => {
  const { step, context, input } = args;

  switch (step.type) {
    case 'input': {
      if (!step.key) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Input step requires a key');
      }

      context[step.key] = input[step.key];
      return { [step.key]: context[step.key] };
    }

    case 'llm': {
      if (!step.prompt) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'LLM step requires a prompt');
      }

      const renderedPrompt = renderTemplate(step.prompt, context);
      const llmOutput = await runLlmCompletion({
        prompt: renderedPrompt,
        model: step.model
      });

      context.llm_output = llmOutput;
      return { llm_output: llmOutput, renderedPrompt };
    }

    case 'output': {
      if (step.key) {
        return { [step.key]: context[step.key] };
      }

      return { ...context };
    }

    default: {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Unknown pipeline step type');
    }
  }
};

export const executePipeline = async ({
  jobId,
  pipelineId,
  attempt,
  steps,
  input
}: ExecutePipelineArgs): Promise<Record<string, unknown>> => {
  const context: Record<string, unknown> = {};
  let finalOutput: Record<string, unknown> | null = null;

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const startedAt = Date.now();

    await createStepLog({
      jobId,
      pipelineId,
      attempt,
      stepIndex: index,
      stepType: step.type,
      status: 'started',
      input: {
        context: { ...context },
        payload: input
      }
    });

    try {
      const output = await executeStep({ step, context, input });
      const durationMs = Date.now() - startedAt;

      if (step.type === 'output') {
        finalOutput = output as Record<string, unknown>;
      }

      await createStepLog({
        jobId,
        pipelineId,
        attempt,
        stepIndex: index,
        stepType: step.type,
        status: 'success',
        output,
        durationMs
      });
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const errorMessage =
        error instanceof Error ? error.message : 'Pipeline step execution failed';

      await createStepLog({
        jobId,
        pipelineId,
        attempt,
        stepIndex: index,
        stepType: step.type,
        status: 'failed',
        error: errorMessage,
        durationMs
      });

      throw error;
    }
  }

  if (!finalOutput) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Pipeline did not produce output');
  }

  return finalOutput;
};
