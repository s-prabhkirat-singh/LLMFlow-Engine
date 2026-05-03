# LLM Flow Engine

LLM Flow Engine is an asynchronous workflow system for running JSON-defined LLM pipelines with production-oriented execution patterns.

## Core Capabilities

- JSON pipeline definitions with step-based flow:
  - `input`
  - `llm`
  - `output`
- Async job execution using RabbitMQ
- Dedicated worker process for pipeline execution
- OpenAI integration with variable templating (`{{variable}}`)
- Job lifecycle tracking:
  - `pending`
  - `running`
  - `success`env
  - `failed`
- Step-level execution logs (status, duration, attempt, error)
- Basic retry with capped attempts
- Next.js demo UI for:
  - Create Pipeline (JSON)
  - Trigger Pipeline
  - View job logs and step timeline

## Architecture

```text
Client -> API -> RabbitMQ -> Worker -> OpenAI -> MongoDB
```

## Repository Structure

```text
LLMFlowEngine/
  infra/
    docker-compose.yml
  services/
    api/
    web/
```

## Prerequisites

- Node.js 20+
- Docker (recommended for local MongoDB + RabbitMQ)

## Local Infrastructure

Start MongoDB and RabbitMQ:

```bash
npm run infra:up
```

Stop infrastructure:

```bash
npm run infra:down
```

Default local endpoints:

- RabbitMQ management UI: `http://localhost:15672` (`guest` / `guest`)
- MongoDB: `mongodb://localhost:27017`

## Installation

```bash
npm install
```

## Environment Setup

```bash
cp services/api/.env.example services/api/.env
```

Set required values in `services/api/.env`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/llm_flow_engine
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_NAME=pipeline.jobs
RABBITMQ_PREFETCH=10
JOB_MAX_RETRIES=2
```

## Run Services

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

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Create Pipeline

`POST /pipelines`

```json
{
  "pipelineId": "summary-flow",
  "name": "Summary Flow",
  "description": "Summarize text input",
  "steps": [
    { "type": "input", "key": "text" },
    { "type": "llm", "prompt": "Summarize this in 2 bullet points:\n\n{{text}}", "model": "gpt-4o-mini" },
    { "type": "output", "key": "llm_output" }
  ]
}
```

### Trigger Pipeline

`POST /pipelines/:pipelineId/trigger`

```json
{
  "input": {
    "text": "OpenAI released a major update and leadership needs a concise summary today."
  }
}
```

Returns `202 Accepted` with `jobId`.

### Get Job Status and Logs

`GET /pipelines/jobs/:jobId`

Returns job status, retry metadata, output/error, and step logs.

## Reliability Notes

- Durable RabbitMQ queue
- Persistent queue messages
- Manual `ack/nack`
- Prefetch-based worker flow control
- Capped retries with final failure state
- Step-level logging for observability and debugging
