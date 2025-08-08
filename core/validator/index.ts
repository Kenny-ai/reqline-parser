// Minimal no-op validator that can be expanded; present to mirror structure
export { parseReqline } from "./parse-reqline";
export default {
  parse(_: string) {
    return {};
  },
  validate<T>(data: T) {
    return data;
  },
};
