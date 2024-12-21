import { describe, it, expect, vi } from "vitest";
import {
	toDataStream,
	toDataStreamResponse,
	mergeIntoDataStream,
} from "./langchain-adaptor";
import { createDataStream } from "../core/data-stream/create-data-stream";
import { convertReadableStreamToArray } from "@ai-sdk/provider-utils/test";

describe("toDataStream", () => {
	it("should convert a string stream into a data stream", async () => {
		const inputStream = new ReadableStream({
			start(controller) {
				controller.enqueue({
					event: "on_tool_start",
					data: {
						input: {
							input: "generative ai",
						},
					},
					// "name": "WikipediaQueryRun",
					// "run_id": "09dd2469-f1f7-4734-a5cc-4f02dbcd2e68",
					// "tags": [],
					// "metadata": {
					//   "thread_id": "123",
					//   "langgraph_step": 2,
					//   "langgraph_node": "tools",
					//   "langgraph_triggers": [
					//     "branch:agent:condition:tools"
					//   ],
					//   "langgraph_path": [
					//     "__pregel_pull",
					//     "tools"
					//   ],
					//   "langgraph_checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282",
					//   "__pregel_resuming": false,
					//   "__pregel_task_id": "9763385f-ade7-5174-9621-cadd75920282",
					//   "checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282"
					// }
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "h" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "e" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "o" } },
				});
				controller.enqueue(" ");
				controller.enqueue("w");
				controller.enqueue("o");
				controller.enqueue("r");
				controller.enqueue("l");
				controller.enqueue("d");
				controller.enqueue(" ");
				controller.enqueue({
					event: "on_chat_model_stream",
					data: {
						chunk: {
							content: [
								{ type: "text", text: "hinton" },
								{ type: "text", text: " " },
								{ type: "text", text: "hopfield" },
							],
						},
					},
				});
				controller.close();
			},
		});

		const resultStream = toDataStream(inputStream);

		const result = await convertReadableStreamToArray(
			resultStream.pipeThrough(new TextDecoderStream()),
		);

		expect(result).toMatchObject([
			'2:[{"event":"on_tool_start","data":{"input":{"input":"generative ai"}}}]\n',
			'0:"h"\n',
			'0:"e"\n',
			'0:"l"\n',
			'0:"l"\n',
			'0:"o"\n',
			'0:" "\n',
			'0:"w"\n',
			'0:"o"\n',
			'0:"r"\n',
			'0:"l"\n',
			'0:"d"\n',
			'0:" "\n',
			'0:"hinton"\n',
			'0:" "\n',
			'0:"hopfield"\n',
		]);
	});
});

describe("toDataStreamResponse", () => {
	it("should return a response with the correct headers and body", async () => {
		const inputStream = new ReadableStream({
			start(controller) {
				controller.enqueue({
					event: "on_tool_start",
					data: {
						input: {
							input: "generative ai",
						},
					},
					// "name": "WikipediaQueryRun",
					// "run_id": "09dd2469-f1f7-4734-a5cc-4f02dbcd2e68",
					// "tags": [],
					// "metadata": {
					//   "thread_id": "123",
					//   "langgraph_step": 2,
					//   "langgraph_node": "tools",
					//   "langgraph_triggers": [
					//     "branch:agent:condition:tools"
					//   ],
					//   "langgraph_path": [
					//     "__pregel_pull",
					//     "tools"
					//   ],
					//   "langgraph_checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282",
					//   "__pregel_resuming": false,
					//   "__pregel_task_id": "9763385f-ade7-5174-9621-cadd75920282",
					//   "checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282"
					// }
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "h" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "e" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "o" } },
				});
				controller.enqueue(" ");
				controller.enqueue("w");
				controller.enqueue("o");
				controller.enqueue("r");
				controller.enqueue("l");
				controller.enqueue("d");
				controller.enqueue(" ");
				controller.enqueue({
					event: "on_chat_model_stream",
					data: {
						chunk: {
							content: [
								{ type: "text", text: "hinton" },
								{ type: "text", text: " " },
								{ type: "text", text: "hopfield" },
							],
						},
					},
				});
				controller.close();
			},
		});

		const callbacks = {
			onText: vi.fn(),
			onFinal: vi.fn(),
		};

		const response = toDataStreamResponse(inputStream, {
			init: {
				headers: { "X-Test": "HeaderValue" },
			},
			callbacks,
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe(
			"text/plain; charset=utf-8",
		);
		expect(response.headers.get("X-Test")).toBe("HeaderValue");

		const text = await response.text();
		expect(text.trim()).toEqual(
			[
				'2:[{"event":"on_tool_start","data":{"input":{"input":"generative ai"}}}]',
				'0:"h"',
				'0:"e"',
				'0:"l"',
				'0:"l"',
				'0:"o"',
				'0:" "',
				'0:"w"',
				'0:"o"',
				'0:"r"',
				'0:"l"',
				'0:"d"',
				'0:" "',
				'0:"hinton"',
				'0:" "',
				'0:"hopfield"',
			].join("\n"),
		);
		expect(callbacks.onText).toHaveBeenCalledTimes(15);
		expect(callbacks.onFinal).toHaveBeenCalledTimes(1);
	});
});

describe("mergeIntoDataStream", () => {
	it("should merge the input stream into the provided data stream writer", async () => {
		const inputStream = new ReadableStream({
			start(controller) {
				controller.enqueue({
					event: "on_tool_start",
					data: {
						input: {
							input: "generative ai",
						},
					},
					// "name": "WikipediaQueryRun",
					// "run_id": "09dd2469-f1f7-4734-a5cc-4f02dbcd2e68",
					// "tags": [],
					// "metadata": {
					//   "thread_id": "123",
					//   "langgraph_step": 2,
					//   "langgraph_node": "tools",
					//   "langgraph_triggers": [
					//     "branch:agent:condition:tools"
					//   ],
					//   "langgraph_path": [
					//     "__pregel_pull",
					//     "tools"
					//   ],
					//   "langgraph_checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282",
					//   "__pregel_resuming": false,
					//   "__pregel_task_id": "9763385f-ade7-5174-9621-cadd75920282",
					//   "checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282"
					// }
				});
				controller.enqueue({
					event: "on_tool_end",
					data: {
						output: {
							// "lc": 1,
							// "type": "constructor",
							// "id": [
							//   "langchain_core",
							//   "messages",
							//   "ToolMessage"
							// ],
							kwargs: {
								content: "generative ai is ...",
								// "tool_call_id": "call_yCdCWBiE0B5jbzJg2T60Z0hR",
								// "name": "wikipedia-api",
								// "additional_kwargs": {},
								// "response_metadata": {}
							},
						},
						input: {
							input: "generative ai",
						},
					},
					// "run_id": "09dd2469-f1f7-4734-a5cc-4f02dbcd2e68",
					// "name": "WikipediaQueryRun",
					// "tags": [],
					// "metadata": {
					//   "thread_id": "123",
					//   "langgraph_step": 2,
					//   "langgraph_node": "tools",
					//   "langgraph_triggers": [
					//     "branch:agent:condition:tools"
					//   ],
					//   "langgraph_path": [
					//     "__pregel_pull",
					//     "tools"
					//   ],
					//   "langgraph_checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282",
					//   "__pregel_resuming": false,
					//   "__pregel_task_id": "9763385f-ade7-5174-9621-cadd75920282",
					//   "checkpoint_ns": "tools:9763385f-ade7-5174-9621-cadd75920282"
					// }
				});
				controller.enqueue({
					event: "on_tool_error",
					data: { error: "unknown error" },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "h" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "e" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "l" } },
				});
				controller.enqueue({
					event: "on_chat_model_stream",
					data: { chunk: { content: "o" } },
				});
				controller.enqueue(" ");
				controller.enqueue("w");
				controller.enqueue("o");
				controller.enqueue("r");
				controller.enqueue("l");
				controller.enqueue("d");
				controller.enqueue(" ");
				controller.enqueue({
					event: "on_chat_model_stream",
					data: {
						chunk: {
							content: [
								{ type: "text", text: "hinton" },
								{ type: "text", text: " " },
								{ type: "text", text: "hopfield" },
							],
						},
					},
				});
				controller.close();
			},
		});

		const callbacks = {
			onText: vi.fn(),
			onFinal: vi.fn(),
		};

		const dataStream = createDataStream({
			execute(writer) {
				writer.writeData("data");
				mergeIntoDataStream(inputStream, { dataStream: writer, callbacks });
			},
		});

		const result = await convertReadableStreamToArray(dataStream);

		expect(callbacks.onText).toHaveBeenCalledTimes(15);
		expect(callbacks.onText).toHaveBeenNthCalledWith(1, "h");
		expect(callbacks.onText).toHaveBeenNthCalledWith(2, "e");
		expect(callbacks.onText).toHaveBeenNthCalledWith(3, "l");
		expect(callbacks.onText).toHaveBeenNthCalledWith(4, "l");
		expect(callbacks.onText).toHaveBeenNthCalledWith(5, "o");
		expect(callbacks.onText).toHaveBeenNthCalledWith(6, " ");
		expect(callbacks.onText).toHaveBeenNthCalledWith(7, "w");
		expect(callbacks.onText).toHaveBeenNthCalledWith(8, "o");
		expect(callbacks.onText).toHaveBeenNthCalledWith(9, "r");
		expect(callbacks.onText).toHaveBeenNthCalledWith(10, "l");
		expect(callbacks.onText).toHaveBeenNthCalledWith(11, "d");
		expect(callbacks.onText).toHaveBeenNthCalledWith(12, " ");
		expect(callbacks.onText).toHaveBeenNthCalledWith(13, "hinton");
		expect(callbacks.onText).toHaveBeenNthCalledWith(14, " ");
		expect(callbacks.onText).toHaveBeenNthCalledWith(15, "hopfield");

		expect(callbacks.onFinal).toHaveBeenCalledTimes(1);
		expect(callbacks.onFinal).toHaveBeenCalledWith(
			"hello world hinton hopfield",
		);

		expect(result).toMatchObject([
			'2:["data"]\n',
			'2:[{"event":"on_tool_start","data":{"input":{"input":"generative ai"}}}]\n',
			'2:[{"event":"on_tool_end","data":{"output":{"kwargs":{"content":"generative ai is ..."}},"input":{"input":"generative ai"}}}]\n',
			'2:[{"event":"on_tool_error","data":{"error":"unknown error"}}]\n',
			'0:"h"\n',
			'0:"e"\n',
			'0:"l"\n',
			'0:"l"\n',
			'0:"o"\n',
			'0:" "\n',
			'0:"w"\n',
			'0:"o"\n',
			'0:"r"\n',
			'0:"l"\n',
			'0:"d"\n',
			'0:" "\n',
			'0:"hinton"\n',
			'0:" "\n',
			'0:"hopfield"\n',
		]);
	});
});
