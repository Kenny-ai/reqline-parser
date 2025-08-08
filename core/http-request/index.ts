import axios from "axios";

export async function request(options: {
  method: "GET" | "POST";
  url: string;
  headers?: Record<string, string>;
  data?: any;
}) {
  return axios.request({
    method: options.method,
    url: options.url,
    headers: options.headers,
    data: options.data,
    validateStatus: () => true,
  });
}

export default { request };
