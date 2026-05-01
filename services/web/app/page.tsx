'use client';

import { FormEvent, useMemo, useState } from 'react';

type ApiState = {
  loading: boolean;
  response: string;
  error: string;
};

const prettify = (value: unknown) => JSON.stringify(value, null, 2);

export default function HomePage() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:4000/api/v1');

  const [pipelineId, setPipelineId] = useState('summary-flow');
  const [pipelineName, setPipelineName] = useState('Summary Flow');
  const [pipelineDescription, setPipelineDescription] = useState('Summarize input text');
  const [inputKey, setInputKey] = useState('text');
  const [llmPrompt, setLlmPrompt] = useState('Summarize this in 2 bullet points:\n\n{{text}}');
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
  const [outputKey, setOutputKey] = useState('llm_output');

  const [triggerText, setTriggerText] = useState(
    'OpenAI released a major update and leadership needs a concise summary today.'
  );

  const [createState, setCreateState] = useState<ApiState>({
    loading: false,
    response: '',
    error: ''
  });
  const [triggerState, setTriggerState] = useState<ApiState>({
    loading: false,
    response: '',
    error: ''
  });

  const previewPipeline = useMemo(
    () => ({
      pipelineId,
      name: pipelineName,
      description: pipelineDescription,
      steps: [
        { type: 'input', key: inputKey },
        { type: 'llm', prompt: llmPrompt, model: llmModel },
        { type: 'output', key: outputKey }
      ]
    }),
    [pipelineDescription, pipelineId, pipelineName, inputKey, llmPrompt, llmModel, outputKey]
  );

  const handleCreatePipeline = async (event: FormEvent) => {
    event.preventDefault();
    setCreateState({ loading: true, response: '', error: '' });

    try {
      const response = await fetch(`${apiBaseUrl}/pipelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewPipeline)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(prettify(data));
      }

      setCreateState({ loading: false, response: prettify(data), error: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create pipeline';
      setCreateState({ loading: false, response: '', error: message });
    }
  };

  const handleTriggerPipeline = async (event: FormEvent) => {
    event.preventDefault();
    setTriggerState({ loading: true, response: '', error: '' });

    try {
      const response = await fetch(`${apiBaseUrl}/pipelines/${pipelineId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            [inputKey]: triggerText
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(prettify(data));
      }

      setTriggerState({ loading: false, response: prettify(data), error: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to trigger pipeline';
      setTriggerState({ loading: false, response: '', error: message });
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="badge">LLM Flow Engine</p>
      </section>

      <section className="panel">
        <label htmlFor="apiBaseUrl">API Base URL</label>
        <input
          id="apiBaseUrl"
          value={apiBaseUrl}
          onChange={(event) => setApiBaseUrl(event.target.value)}
          placeholder="http://localhost:4000/api/v1"
        />
      </section>

      <section className="grid">
        <form className="panel" onSubmit={handleCreatePipeline}>
          <div className="panelHeader">
            <h2>Create Pipeline</h2>
            <button type="submit" disabled={createState.loading}>
              {createState.loading ? 'Creating...' : 'Create'}
            </button>
          </div>

          <label htmlFor="pipelineId">Pipeline ID</label>
          <input id="pipelineId" value={pipelineId} onChange={(event) => setPipelineId(event.target.value)} required />

          <label htmlFor="pipelineName">Pipeline Name</label>
          <input id="pipelineName" value={pipelineName} onChange={(event) => setPipelineName(event.target.value)} required />

          <label htmlFor="pipelineDescription">Description</label>
          <input
            id="pipelineDescription"
            value={pipelineDescription}
            onChange={(event) => setPipelineDescription(event.target.value)}
          />

          <label htmlFor="inputKey">Input Key</label>
          <input id="inputKey" value={inputKey} onChange={(event) => setInputKey(event.target.value)} required />

          <label htmlFor="llmPrompt">LLM Prompt Template</label>
          <textarea id="llmPrompt" value={llmPrompt} onChange={(event) => setLlmPrompt(event.target.value)} required />

          <label htmlFor="llmModel">Model</label>
          <input id="llmModel" value={llmModel} onChange={(event) => setLlmModel(event.target.value)} required />

          <label htmlFor="outputKey">Output Key</label>
          <input id="outputKey" value={outputKey} onChange={(event) => setOutputKey(event.target.value)} required />

          <p className="pipelineHint">Preview payload generated from form:</p>
          <pre className="success">{prettify(previewPipeline)}</pre>

          {createState.error ? <pre className="error">{createState.error}</pre> : null}
          {createState.response ? <pre className="success">{createState.response}</pre> : null}
        </form>

        <form className="panel" onSubmit={handleTriggerPipeline}>
          <div className="panelHeader">
            <h2>Trigger Pipeline</h2>
            <button type="submit" disabled={triggerState.loading}>
              {triggerState.loading ? 'Triggering...' : 'Trigger'}
            </button>
          </div>

          <label htmlFor="triggerPipelineId">Pipeline ID</label>
          <input id="triggerPipelineId" value={pipelineId} readOnly />

          <label htmlFor="triggerText">Input Text</label>
          <textarea
            id="triggerText"
            value={triggerText}
            onChange={(event) => setTriggerText(event.target.value)}
            required
          />

          <p className="pipelineHint">
            This sends: <code>{`{ "input": { "${inputKey}": "..." } }`}</code>
          </p>

          {triggerState.error ? <pre className="error">{triggerState.error}</pre> : null}
          {triggerState.response ? <pre className="success">{triggerState.response}</pre> : null}
        </form>
      </section>
    </main>
  );
}
