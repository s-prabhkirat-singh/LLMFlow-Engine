import { StatusCodes } from 'http-status-codes';

import { ApiError } from '../errors/api-error.js';
import { renderTemplate } from '../utils/template.js';
import { runLlmCompletion } from './openai.service.js';

type PipelineStep = {
  type: 'input' | 'llm' | 'output';
  key?: string;
  prompt?: string;
  model?: string;
};

type ExecutePipelineArgs = {
  steps: PipelineStep[];
  input: Record<string, unknown>;
};

export const executePipeline = async ({
  steps,
  input
}: ExecutePipelineArgs): Promise<Record<string, unknown>> => {
  const context: Record<string, unknown> = {};
  let finalOutput: Record<string, unknown> | null = null;

  for (const step of steps) {
    switch (step.type) {
      case 'input': {
        if (!step.key) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Input step requires a key');
        }

        context[step.key] = input[step.key];
        break;
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
        break;
      }

      case 'output': {
        if (step.key) {
          finalOutput = { [step.key]: context[step.key] };
        } else {
          finalOutput = { ...context };
        }
        break;
      }

      default: {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Unknown pipeline step type');
      }
    }
  }

  if (!finalOutput) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Pipeline did not produce output');
  }

  return finalOutput;
};
