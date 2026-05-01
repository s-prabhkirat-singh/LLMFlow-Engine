import { z } from 'zod';

const inputStepSchema = z.object({
  type: z.literal('input'),
  key: z.string().min(1)
});

const llmStepSchema = z.object({
  type: z.literal('llm'),
  prompt: z.string().min(1),
  model: z.string().min(1).optional()
});

const outputStepSchema = z.object({
  type: z.literal('output'),
  key: z.string().min(1).optional()
});

const stepSchema = z.discriminatedUnion('type', [
  inputStepSchema,
  llmStepSchema,
  outputStepSchema
]);

export const createPipelineSchema = z.object({
  pipelineId: z.string().min(3).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  steps: z.array(stepSchema).min(2)
});

export const triggerPipelineSchema = z.object({
  input: z.record(z.any())
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type TriggerPipelineInput = z.infer<typeof triggerPipelineSchema>;
