import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { ApiError } from '../errors/api-error.js';

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export const runLlmCompletion = async (args: {
  prompt: string;
  model?: string;
}): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: args.model ?? env.OPENAI_MODEL,
      messages: [
        {
          role: 'user',
          content: args.prompt
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      `OpenAI request failed with status ${response.status}: ${errorBody}`
    );
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'OpenAI returned an empty response');
  }

  return content;
};
