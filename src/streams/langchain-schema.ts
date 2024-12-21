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

export const LangChainStreamEventSchema = z.object({
	event: z.string(),
	data: z.any(),
});
export type LangChainStreamEvent = z.infer<typeof LangChainStreamEventSchema>;

export const LangChainIntermediateStreamEventSchema = z.object({
	type: z.union([z.literal("text"), z.literal("data"), z.string()]).optional(),
	data: z.any(),
});
export type LangChainIntermediateStreamEventSchema = z.infer<
	typeof LangChainIntermediateStreamEventSchema
>;
