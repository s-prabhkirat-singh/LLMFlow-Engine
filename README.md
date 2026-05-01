# LLM Flow Engine

A flexible, scalable pipeline orchestration system for processing text through Large Language Models.

## Features

- **Drag-and-Drop or JSON Pipeline Builder**: Create processing workflows visually or via JSON configuration
- **Input → Process → Output Architecture**: Streamlined data flow for LLM-based workflows
- **OpenAI API Integration**: Seamless integration with OpenAI's language models
- **Message Queue Support**: Built-in RabbitMQ support for asynchronous task processing

## How It Works

The engine processes text through a simple, scalable workflow:

1. **User Input**: A user submits text to the system
2. **Queue Processing**: The input is placed in a message queue for reliable handling
3. **LLM Processing**: A worker processes the queued text using the configured LLM
4. **Output Delivery**: The processed response is returned to the user

## Architecture

```
Input → Queue → Worker (LLM Processing) → Output
```