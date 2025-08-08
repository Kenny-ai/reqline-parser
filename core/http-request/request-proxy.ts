import { request } from "./index";

export async function sendHttpRequest(args: {
  method: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const { method, url, headers, body } = args;
  return request({ method, url, headers, data: body });
}

export default { sendHttpRequest };
