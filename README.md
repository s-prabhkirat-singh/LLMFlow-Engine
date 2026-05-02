# LLM Flow Engine

Production-oriented starter for a pipeline orchestration system:

`Input -> Process (LLM) -> Output`


## Completed Milestones

- Day 1: API setup, Mongo models, create + trigger endpoints
- Day 2: Local execution engine, context passing, input/output steps
- Day 3: OpenAI integration, prompt templating (`{{variable}}`), real LLM execution
- Day 4: RabbitMQ integration, async execution with dedicated worker

## Monorepo Structure

```text
LLMFlowEngine/
  infra/
    docker-compose.yml
  services/
    api/
    web/
```

## Day 4 Architecture

```text
Client -> API -> RabbitMQ -> Worker -> OpenAI -> MongoDB
```

- API creates job in MongoDB with `pending` status and enqueues to RabbitMQ.
- Worker consumes queue messages and executes pipeline steps.
- Worker updates job status to `running`, then `success` or `failed`.

## Infrastructure Boot

```bash
npm run infra:up
```

- RabbitMQ management UI: `http://localhost:15672` (`guest/guest`)
- MongoDB: `mongodb://localhost:27017`

## Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp services/api/.env.example services/api/.env
```

3. Set real OpenAI key in `services/api/.env`:

```env
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-3
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_NAME=pipeline.jobs
RABBITMQ_PREFETCH=10
```

## Start Services

Start API:

```bash
npm run dev:api
```

Start worker (separate terminal):

```bash
npm run dev:worker
```

Start frontend:

```bash
npm run dev:web
```

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

### 1) Create Pipeline

`POST /pipelines`

```json
{
  "pipelineId": "summary-flow",
  "name": "Summary Flow",
  "description": "Summarize text input",
  "steps": [
    { "type": "input", "key": "text" },
    { "type": "llm", "prompt": "Summarize this text in 2 bullet points:\n\n{{text}}", "model": "gpt-3" },
    { "type": "output", "key": "llm_output" }
  ]
}
```

### 2) Trigger Pipeline (enqueue only)

`POST /pipelines/summary-flow/trigger`

```json
{
  "input": {
    "text": "OpenAI released a new API update and the team needs a concise summary for management by end of day."
  }
}
```

Response is async acknowledgement (`202`), example:

```json
{
  "jobId": "f8t8lw9um6j2a3n4",
  "pipelineId": "summary-flow",
  "status": "pending",
  "createdAt": "2026-05-01T00:00:00.000Z"
}
```

### 3) Get Job Status

`GET /pipelines/jobs/:jobId`

Example response:

```json
{
  "jobId": "f8t8lw9um6j2a3n4",
  "pipelineId": "summary-flow",
  "status": "success",
  "input": {
    "text": "..."
  },
  "result": {
    "llm_output": "- bullet 1\n- bullet 2"
  },
  "error": null,
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-05-01T00:00:02.000Z"
}
```

## Queue Reliability Choices

- Durable queue (`assertQueue` with `durable: true`)
- Persistent messages (`sendToQueue` with `persistent: true`)
- Manual acknowledgements (`ack` on success)
- Dead-letter style behavior via `nack(requeue=false)` on hard failures
- Worker prefetch control (`RABBITMQ_PREFETCH`) to prevent overload
