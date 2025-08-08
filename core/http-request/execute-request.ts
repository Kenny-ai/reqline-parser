import { sendHttpRequest } from "./request-proxy";
import type { ParsedReqline } from "../validator/parse-reqline";

type SuccessResponse = {
  request: {
    query: Record<string, unknown>;
    body: Record<string, unknown>;
    headers: Record<string, unknown>;
    full_url: string;
  };
  response: {
    http_status: number;
    duration: number;
    request_start_timestamp: number;
    request_stop_timestamp: number;
    response_data: unknown;
  };
};

export async function executeParsedRequest(
  parsed: ParsedReqline
): Promise<SuccessResponse> {
  const { method, url, headers, query, body } = parsed;

  const urlObj = new URL(url);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    urlObj.searchParams.set(String(key), String(value));
  });
  const fullUrl = urlObj.toString();

  const start = Date.now();
  try {
    const resp = await sendHttpRequest({
      method,
      url: fullUrl,
      headers,
      body: method === "POST" ? body : undefined,
    });
    const stop = Date.now();
    const duration = stop - start;
    return {
      request: {
        query: query || {},
        body: body || {},
        headers: headers || {},
        full_url: fullUrl,
      },
      response: {
        http_status: resp.status,
        duration,
        request_start_timestamp: start,
        request_stop_timestamp: stop,
        response_data: resp.data,
      },
    };
  } catch (error: any) {
    const message = error?.message || "Request failed";
    const err: any = new Error(message);
    err.expose = true;
    throw err;
  }
}

export default { executeParsedRequest };
