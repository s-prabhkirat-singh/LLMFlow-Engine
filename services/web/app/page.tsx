'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type ApiState = {
  loading: boolean;
  response: string;
  error: string;
};

type StepLog = {
  _id?: string;
  stepIndex: number;
  stepType: 'input' | 'llm' | 'output';
  status: 'started' | 'success' | 'failed';
  durationMs?: number;
  attempt?: number;
  error?: string | null;
  createdAt?: string;
};

type JobStatusResponse = {
  jobId: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  attemptCount: number;
  maxAttempts: number;
  result: Record<string, unknown> | null;
  error: string | null;
  stepLogs: StepLog[];
  updatedAt?: string;
};

const defaultPipelineJson = JSON.stringify(
  {
    pipelineId: 'summary-flow',
    name: 'Summary Flow',
    description: 'Summarize input text',
    steps: [
      { type: 'input', key: 'text' },
      {
        type: 'llm',
        prompt: 'Summarize this in 2 bullet points:\n\n{{text}}',
        model: 'gpt-4o-mini'
      },
      { type: 'output', key: 'llm_output' }
    ]
  },
  null,
  2
);

const defaultTriggerJson = JSON.stringify(
  {
    input: {
      text: 'OpenAI released a major update and leadership needs a concise summary today.'
    }
  },
  null,
  2
);

const prettify = (value: unknown) => JSON.stringify(value, null, 2);

export default function HomePage() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:4000/api/v1');
  const [pipelineJson, setPipelineJson] = useState(defaultPipelineJson);
  const [triggerJson, setTriggerJson] = useState(defaultTriggerJson);
  const [jobId, setJobId] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

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
  const [logsState, setLogsState] = useState<ApiState>({
    loading: false,
    response: '',
    error: ''
  });
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);

  const pipelineIdFromJson = useMemo(() => {
    try {
      const parsed = JSON.parse(pipelineJson) as { pipelineId?: string };
      return parsed.pipelineId ?? '';
    } catch {
      return '';
    }
  }, [pipelineJson]);

  const fetchJobStatus = async (id: string, silent = false) => {
    if (!id) {
      return;
    }

    if (!silent) {
      setLogsState({ loading: true, response: '', error: '' });
    }

    try {
      const response = await fetch(`${apiBaseUrl}/pipelines/jobs/${id}`);
      const data = (await response.json()) as JobStatusResponse;

      if (!response.ok) {
        throw new Error(prettify(data));
      }

      setJobStatus(data);
      setLogsState({ loading: false, response: prettify(data), error: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch job logs';
      setJobStatus(null);
      setLogsState({ loading: false, response: '', error: message });
    }
  };

  useEffect(() => {
    if (!autoRefresh || !jobId) {
      return;
    }

    const interval = setInterval(() => {
      void fetchJobStatus(jobId, true);
    }, 2500);

    return () => clearInterval(interval);
  }, [autoRefresh, jobId, apiBaseUrl]);

  const handleCreatePipeline = async (event: FormEvent) => {
    event.preventDefault();
    setCreateState({ loading: true, response: '', error: '' });

    try {
      const parsed = JSON.parse(pipelineJson);
      const response = await fetch(`${apiBaseUrl}/pipelines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
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
      const parsed = JSON.parse(triggerJson);
      const response = await fetch(`${apiBaseUrl}/pipelines/${pipelineIdFromJson}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(prettify(data));
      }

      setTriggerState({ loading: false, response: prettify(data), error: '' });
      if (typeof data?.jobId === 'string') {
        setJobId(data.jobId);
        void fetchJobStatus(data.jobId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to trigger pipeline';
      setTriggerState({ loading: false, response: '', error: message });
    }
  };

  const handleLoadLogs = async (event: FormEvent) => {
    event.preventDefault();
    await fetchJobStatus(jobId);
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
            <h2>Create Pipeline (JSON)</h2>
            <button type="submit" disabled={createState.loading}>
              {createState.loading ? 'Creating...' : 'Create'}
            </button>
          </div>
          <textarea
            value={pipelineJson}
            onChange={(event) => setPipelineJson(event.target.value)}
            spellCheck={false}
          />
          {createState.error ? <pre className="error">{createState.error}</pre> : null}
          {createState.response ? <pre className="success">{createState.response}</pre> : null}
        </form>

        <form className="panel" onSubmit={handleTriggerPipeline}>
          <div className="panelHeader">
            <h2>Trigger Pipeline</h2>
            <button type="submit" disabled={triggerState.loading || !pipelineIdFromJson}>
              {triggerState.loading ? 'Triggering...' : 'Trigger'}
            </button>
          </div>
          <p className="pipelineHint">Using pipelineId: {pipelineIdFromJson || 'invalid JSON / missing pipelineId'}</p>
          <textarea
            value={triggerJson}
            onChange={(event) => setTriggerJson(event.target.value)}
            spellCheck={false}
          />
          {triggerState.error ? <pre className="error">{triggerState.error}</pre> : null}
          {triggerState.response ? <pre className="success">{triggerState.response}</pre> : null}
        </form>
      </section>

      <section className="panel logsPanel">
        <div className="panelHeader">
          <h2>Job Inspector</h2>
        </div>

        <form className="jobInspectorForm" onSubmit={handleLoadLogs}>
          <label htmlFor="jobId">Job ID</label>
          <input
            id="jobId"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            placeholder="Paste jobId from trigger response"
            required
          />
          <button type="submit" disabled={logsState.loading}>
            {logsState.loading ? 'Loading...' : 'Load Logs'}
          </button>
          <label className="inlineCheck">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Auto refresh (2.5s)
          </label>
        </form>

        {jobStatus ? (
          <div className="jobStatusCards">
            <div className="statusCard">
              <span>Status</span>
              <strong>{jobStatus.status}</strong>
            </div>
            <div className="statusCard">
              <span>Attempts</span>
              <strong>
                {jobStatus.attemptCount}/{jobStatus.maxAttempts}
              </strong>
            </div>
            <div className="statusCard">
              <span>Pipeline</span>
              <strong>{jobStatus.pipelineId}</strong>
            </div>
          </div>
        ) : null}

        {jobStatus?.stepLogs?.length ? (
          <div className="timeline">
            {jobStatus.stepLogs.map((log, idx) => (
              <article key={`${log.stepIndex}-${idx}-${log.status}`} className={`timelineItem ${log.status}`}>
                <div className="timelineHead">
                  <h3>
                    Step {log.stepIndex} - {log.stepType}
                  </h3>
                  <span>{log.status}</span>
                </div>
                <p>
                  Attempt: {log.attempt ?? '-'} | Duration: {log.durationMs ?? 0}ms
                </p>
                {log.error ? <p className="errorText">{log.error}</p> : null}
              </article>
            ))}
          </div>
        ) : null}

        {logsState.error ? <pre className="error">{logsState.error}</pre> : null}
        {logsState.response ? <pre className="success">{logsState.response}</pre> : null}
      </section>
    </main>
  );
}
