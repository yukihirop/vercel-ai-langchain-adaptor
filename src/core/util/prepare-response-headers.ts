/**
 * @description copy from https://github.com/vercel/ai/blob/b9cba49c0db07890e46aa9ea6e53023f1f051a2a/packages/ai/core/util/prepare-response-headers.ts
 */

export function prepareResponseHeaders(
  headers: HeadersInit | undefined,
  {
    contentType,
    dataStreamVersion,
  }: { contentType: string; dataStreamVersion?: "v1" | undefined },
) {
  const responseHeaders = new Headers(headers ?? {});

  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", contentType);
  }

  if (dataStreamVersion !== undefined) {
    responseHeaders.set("X-Vercel-AI-Data-Stream", dataStreamVersion);
  }

  return responseHeaders;
}
