# LLM Flow Engine

Production-oriented starter for a pipeline orchestration system:

`Input -> Process (LLM) -> Output`

This repository is structured for your 7-day roadmap, with Day 1, Day 2, and Day 3 implemented.

## Completed Milestones

- Day 1: API setup, Mongo models, create + trigger endpoints
- Day 2: Local execution engine, context passing, input/output steps
- Day 3: OpenAI integration, prompt templating (`{{variable}}`), real LLM execution

## Monorepo Structure

```text
LLMFlowEngine/
  services/
    api/
    web/
```

## Backend Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp services/api/.env.example services/api/.env
```

3. Set your key in `services/api/.env`:

```env
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-4o-mini
```

4. Start API:

```bash
npm run dev:api
```

## API Endpoints

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
    { "type": "llm", "prompt": "Summarize this text in 2 bullet points:\n\n{{text}}", "model": "gpt-4o-mini" },
    { "type": "output", "key": "llm_output" }
  ]
}
```

### Trigger Pipeline

`POST /pipelines/summary-flow/trigger`

```json
{
  "input": {
    "text": "OpenAI released a new API update and the team needs a concise summary for management by end of day."
  }
}
```

Expected result: job completes with `status: "success"` and response in `result.llm_output`.

## Notes

- Prompt templating supports placeholders like `{{text}}` and nested paths like `{{user.name}}`.
- For now, LLM output is stored in context under `llm_output`.
