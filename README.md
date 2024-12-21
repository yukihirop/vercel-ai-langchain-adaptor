# Vercel AI LangChain Adaptor

generated by gpt-4o

## Description

`vercel-ai-langchain-adaptor` is a lightweight and flexible adaptor for integrating LangChain-based applications with Vercel's AI platform. This package provides extended support for handling key events during AI interactions, offering a streamlined way to manage AI workflows, especially in serverless environments.

### Features:
- **Enhanced Event Handling**: Supports critical AI and LLM-related events, providing hooks for monitoring and extending behavior.
- **Streamlined Integration**: Simplifies the process of connecting LangChain workflows to Vercel's infrastructure.
- **Customizability**: Enables developers to adapt event handling (`on_tool_*` and `on_chat_model_*`) to fit specific application needs.
- **Serverless Ready**: Designed to work seamlessly with Vercel's serverless deployment model.

### Supported Events

This package focuses on select events from LangChain's ecosystem, with additional integration into Vercel's AI platform through `useChat`. 

| **Event**             | **Official Support** | **This Package** | **Use in `useChat`** |
|------------------------|-----------------------|-------------------|-----------------------|
| `on_chat_model_start`  | 🔴                   | 🔴                |                       |
| `on_chat_model_end`    | 🔴                   | 🔴                |                       |
| `on_chat_model_stream` | 🟢                   | 🟢                | `messages`            |
| `on_llm_start`         | 🔴                   | 🔴                |                       |
| `on_llm_new_token`     | 🔴                   | 🔴                |                       |
| `on_llm_end`           | 🔴                   | 🔴                |                       |
| `on_llm_error`         | 🔴                   | 🔴                |                       |
| `on_chain_start`       | 🔴                   | 🔴                |                       |
| `on_chain_end`         | 🔴                   | 🔴                |                       |
| `on_tool_start`        | 🔴                   | 🟢                | `data`                |
| `on_tool_end`          | 🔴                   | 🟢                | `data`                |
| `on_tool_error`        | 🔴                   | 🟢                | `data`                |
| `on_text`              | 🔴                   | 🔴                |                       |
| `on_agent_action`      | 🔴                   | 🔴                |                       |
| `on_agent_finish`      | 🔴                   | 🔴                |                       |

---

### Use Cases
- Real-time AI model updates through streaming (`on_chat_model_stream`).
- Tool usage monitoring and error handling with events like `on_tool_start`, `on_tool_end`, and `on_tool_error`.
- Extending LangChain's capabilities in serverless environments without significant overhead.

#### toDataStreamResponse

```ts
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'vercel-ai-langchain-adaptor';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const model = new ChatOpenAI({
    model: 'gpt-3.5-turbo-0125',
    temperature: 0,
  });

  const stream = await model.stream(prompt);

  return LangChainAdapter.toDataStreamResponse(stream);
}
```

https://sdk.vercel.ai/docs/reference/stream-helpers/langchain-adapter

---

### Installation

Install the package using your favorite package manager:

```bash
npm install vercel-ai-langchain-adaptor
```

---

### Contributions

Feel free to contribute to improve the adaptor or extend event support. See our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
