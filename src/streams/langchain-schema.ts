import { z } from "zod";

export const LangChainImageDetailSchema = z.enum(["auto", "low", "high"]);
export type LangChainImageDetail = z.infer<typeof LangChainImageDetailSchema>;

export const LangChainMessageContentTextSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
});
export type LangChainMessageContentText = z.infer<
	typeof LangChainMessageContentTextSchema
>;

export const LangChainMessageContentImageUrlSchema = z.object({
	type: z.literal("image_url"),
	image_url: z.union([
		z.string(),
		z.object({
			url: z.string(),
			detail: LangChainImageDetailSchema.optional(),
		}),
	]),
});
export type LangChainMessageContentImageUrl = z.infer<
	typeof LangChainMessageContentImageUrlSchema
>;

export const LangChainMessageContentComplexSchema = z.union([
	LangChainMessageContentTextSchema,
	LangChainMessageContentImageUrlSchema,
	z
		.object({
			type: z
				.union([z.literal("text"), z.literal("image_url"), z.string()])
				.optional(),
		})
		.catchall(z.any()),
	z
		.object({
			type: z.never().optional(),
		})
		.catchall(z.any()),
]);
export type LangChainMessageContentComplex = z.infer<
	typeof LangChainMessageContentComplexSchema
>;

export const LangChainMessageContentSchema = z.union([
	z.string(),
	z.array(LangChainMessageContentComplexSchema),
]);
export type LangChainMessageContent = z.infer<
	typeof LangChainMessageContentSchema
>;

export const LangChainAIMessageChunkSchema = z.object({
	content: LangChainMessageContentSchema,
});
export type LangChainAIMessageChunk = z.infer<
	typeof LangChainAIMessageChunkSchema
>;

export const eventSchemaMap = {
	on_chat_model_stream: z.object({
		event: z.literal("on_chat_model_stream"),
		data: z.object({
			chunk: LangChainAIMessageChunkSchema,
		}),
	}),
	on_tool_start: z.object({
		event: z.literal("on_tool_start"),
		data: z.any(),
	}),
	on_tool_end: z.object({
		event: z.literal("on_tool_end"),
		data: z.any(),
	}),
	on_tool_error: z.object({
		event: z.literal("on_tool_error"),
		data: z.any(),
	}),
};

export const LangChainStreamEventSchema = z
	.object({
		event: z.union([
			// z.literal("on_chat_model_start"),
			// z.literal("on_chat_model_end"),
			z.literal("on_chat_model_stream"),
			// z.literal("on_llm_start"),
			// z.literal("on_llm_new_token"),
			// z.literal("on_llm_end"),
			// z.literal("on_llm_error"),
			// z.literal("on_chain_start"),
			// z.literal("on_chain_end"),
			// z.literal("on_chain_error"),
			z.literal("on_tool_start"),
			z.literal("on_tool_end"),
			z.literal("on_tool_error"),
			// z.literal("on_text"),
			// z.literal("on_agent_action"),
			// z.literal("on_agent_finish"),
		]),
		data: z.any(),
	})
	.superRefine((value, ctx) => {
		const schema = eventSchemaMap[value.event as keyof typeof eventSchemaMap];
		if (schema && value.data) {
			const parsed = schema.safeParse(value.data);
			if (parsed.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ctx.path,
					message: `Data does not match event schema at ${value.event}`,
				});
			}
		}
	});

export type LangChainStreamEvent = z.infer<typeof LangChainStreamEventSchema>;

export const LangChainIntermediateStreamEventSchema = z.union([
	z.object({
		type: z.literal("text"),
		data: z.string(),
	}),
	z.object({
		type: z.literal("data"),
		data: z.any(),
	}),
]);

export type LangChainIntermediateStreamEventSchema = z.infer<
	typeof LangChainIntermediateStreamEventSchema
>;
