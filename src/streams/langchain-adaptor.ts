import { formatDataStreamPart } from "@ai-sdk/ui-utils";
import { prepareResponseHeaders } from "../core/util/prepare-response-headers";
import type { DataStreamWriter } from "../core/data-stream/data-stream-writer";

import type {
	LangChainStreamEvent,
	LangChainAIMessageChunk,
	LangChainMessageContentComplex,
} from "./langchain-schema";

import { LangChainIntermediateStreamEventSchema } from "./langchain-schema";

import type { StreamCallbacks } from "./stream-callbacks";

import { createCallbacksTransformer } from "./stream-callbacks";

/**
Converts LangChain output streams to an AI SDK Data Stream.

The following streams are supported:
- `LangChainAIMessageChunk` streams (LangChain `model.stream` output)
- `string` streams (LangChain `StringOutputParser` output)
 */
export function toDataStream(
	stream:
		| ReadableStream<LangChainStreamEvent>
		| ReadableStream<LangChainAIMessageChunk>
		| ReadableStream<string>,
	callbacks?: StreamCallbacks,
) {
	return toDataStreamInternal(stream, callbacks).pipeThrough(
		new TextEncoderStream(),
	);
}

export function toDataStreamResponse(
	stream:
		| ReadableStream<LangChainStreamEvent>
		| ReadableStream<LangChainAIMessageChunk>
		| ReadableStream<string>,
	options?: {
		init?: ResponseInit;
		callbacks?: StreamCallbacks;
	},
) {
	const dataStream = toDataStreamInternal(
		stream,
		options?.callbacks,
	).pipeThrough(new TextEncoderStream());
	const init = options?.init;

	return new Response(dataStream, {
		status: init?.status ?? 200,
		statusText: init?.statusText,
		headers: prepareResponseHeaders(init?.headers, {
			contentType: "text/plain; charset=utf-8",
			dataStreamVersion: "v1",
		}),
	});
}

export function mergeIntoDataStream(
	stream:
		| ReadableStream<LangChainStreamEvent>
		| ReadableStream<LangChainAIMessageChunk>
		| ReadableStream<string>,
	options: { dataStream: DataStreamWriter; callbacks?: StreamCallbacks },
) {
	options.dataStream.merge(toDataStreamInternal(stream, options.callbacks));
}

function toDataStreamInternal(
	stream:
		| ReadableStream<LangChainStreamEvent>
		| ReadableStream<LangChainAIMessageChunk>
		| ReadableStream<string>,
	callbacks?: StreamCallbacks,
) {
	return stream
		.pipeThrough(
			new TransformStream<
				LangChainStreamEvent | LangChainAIMessageChunk | string
			>({
				transform: async (value, controller) => {
					if (typeof value === "string") {
						controller.enqueue(JSON.stringify({ type: "text", data: value }));
						return;
					}

					if ("event" in value) {
						if (value.event === "on_chat_model_stream") {
							const chunk = value.data?.chunk as LangChainAIMessageChunk;
							if (typeof chunk.content === "string") {
								controller.enqueue(
									JSON.stringify({ type: "text", data: chunk.content }),
								);
							} else {
								const content: LangChainMessageContentComplex[] = chunk.content;
								for (const item of content) {
									if (item.type === "text") {
										controller.enqueue(
											JSON.stringify({ type: "text", data: item.text }),
										);
									}
								}
							}
						} else if (use_data(value.event)) {
							controller.enqueue(JSON.stringify({ type: "data", data: value }));
						}
						return;
					}
				},
			}),
		)
		.pipeThrough(createCallbacksTransformer(callbacks))
		.pipeThrough(new TextDecoderStream())
		.pipeThrough(
			new TransformStream({
				transform: async (value, controller) => {
					let obj = {};
					try {
						obj = JSON.parse(value);
					} catch {
						return;
					}
					const parsed = LangChainIntermediateStreamEventSchema.safeParse(obj);

					/**
					 * @see https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol
					 */

					if (parsed.data?.type === "text") {
						controller.enqueue(formatDataStreamPart("text", parsed.data?.data));
					} else if (parsed.data?.type === "data") {
						controller.enqueue(
							formatDataStreamPart("data", [parsed.data?.data]),
						);
					}
				},
			}),
		);
}

function use_data(event: string): boolean {
	return [
		// "on_chat_model_start",
		// "on_chat_model_end",
		// "on_llm_start",
		// "on_llm_new_token",
		// "on_llm_end",
		// "on_llm_error",
		// "on_chain_start",
		// "on_chain_end",
		// "on_chain_error",
		"on_tool_start",
		"on_tool_end",
		"on_tool_error",
		// "on_text",
		// "on_agent_action",
		// "on_agent_finish",
	].includes(event);
}
