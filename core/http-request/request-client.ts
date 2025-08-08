export type HttpMethod = "GET" | "POST";

export type HttpRequestArgs = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: any;
};
