export type PipelineStepType = 'input' | 'llm' | 'output';

export interface PipelineStepInput {
  type: 'input';
  key: string;
}

export interface PipelineStepLlm {
  type: 'llm';
  prompt: string;
  model?: string;
}

export interface PipelineStepOutput {
  type: 'output';
  key?: string;
}

export type PipelineStep = PipelineStepInput | PipelineStepLlm | PipelineStepOutput;

export interface PipelineDefinition {
  pipelineId: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
}
