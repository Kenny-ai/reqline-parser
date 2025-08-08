export type ParsedReqline = {
  method: "GET" | "POST";
  url: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
};

class ExposedError extends Error {
  expose = true;
}

function throwBadRequest(message: string): never {
  const err = new ExposedError(message);
  throw err;
}

// No regex: use indexOf/slice and manual checks
export function parseReqline(input: string): ParsedReqline {
  // Basic delimiter validation and split preserving exact spacing rules
  const PIPE = "|";
  const rawParts: string[] = [];
  let cursor = 0;
  while (cursor < input.length) {
    const next = input.indexOf(PIPE, cursor);
    if (next === -1) {
      rawParts.push(input.slice(cursor));
      break;
    }
    rawParts.push(input.slice(cursor, next));
    cursor = next + 1;
  }

  // Validate spacing around pipes: exactly one space on each side
  // Reconstruct and compare segments to ensure each segment (except boundaries) ends/starts with space
  for (let i = 0; i < rawParts.length - 1; i++) {
    const leftEnd = rawParts[i].length - 1;
    const rightStart = 0;
    const leftEndsWithSpace = rawParts[i][leftEnd] === " ";
    const rightStartsWithSpace = rawParts[i + 1][rightStart] === " ";
    if (!leftEndsWithSpace || !rightStartsWithSpace) {
      throwBadRequest("Invalid spacing around pipe delimiter");
    }
    // also ensure single space, not multiple, by peeking before/after
    if (leftEnd - 1 >= 0 && rawParts[i][leftEnd - 1] === " ") {
      throwBadRequest("Multiple spaces found where single space expected");
    }
    if (rawParts[i + 1].length >= 2 && rawParts[i + 1][1] === " ") {
      throwBadRequest("Multiple spaces found where single space expected");
    }
  }

  const segments = rawParts.map((s) => s.trim());
  if (segments.length === 0) {
    throwBadRequest("Empty reqline");
  }

  // First segment must be HTTP <METHOD>
  const first = segments[0];
  const httpPrefix = "HTTP ";
  if (first.indexOf(httpPrefix) !== 0) {
    throwBadRequest("Missing required HTTP keyword");
  }
  // Check exact single space after keyword
  if (first.length <= httpPrefix.length) {
    throwBadRequest("Missing space after keyword");
  }
  const methodPart = first.slice(httpPrefix.length);
  if (methodPart[0] === " ") {
    throwBadRequest("Multiple spaces found where single space expected");
  }
  if (methodPart !== methodPart.toUpperCase()) {
    throwBadRequest("HTTP method must be uppercase");
  }
  if (methodPart !== "GET" && methodPart !== "POST") {
    throwBadRequest("Invalid HTTP method. Only GET and POST are supported");
  }

  // Second segment must be URL <value>
  if (segments.length < 2) {
    throwBadRequest("Missing required URL keyword");
  }
  const second = segments[1];
  const urlPrefix = "URL ";
  if (second.indexOf(urlPrefix) !== 0) {
    throwBadRequest("Missing required URL keyword");
  }
  if (second.length <= urlPrefix.length) {
    throwBadRequest("Missing space after keyword");
  }
  const url = second.slice(urlPrefix.length);
  if (url[0] === " ") {
    throwBadRequest("Multiple spaces found where single space expected");
  }
  if (url.length === 0) {
    throwBadRequest("Missing required URL keyword");
  }

  // Remaining optional segments: HEADERS, QUERY, BODY in any order (uppercase keywords)
  let headers: Record<string, string> = {};
  let query: Record<string, unknown> = {};
  let body: Record<string, unknown> = {};

  for (let i = 2; i < segments.length; i++) {
    const seg = segments[i];
    // Find first space to split keyword and value
    const spaceIdx = seg.indexOf(" ");
    if (spaceIdx === -1) {
      throwBadRequest("Missing space after keyword");
    }
    const keyword = seg.slice(0, spaceIdx);
    const rest = seg.slice(spaceIdx + 1);
    if (keyword !== keyword.toUpperCase()) {
      throwBadRequest("Keywords must be uppercase");
    }
    if (rest.length === 0) {
      throwBadRequest("Missing space after keyword");
    }
    if (rest[0] === " ") {
      throwBadRequest("Multiple spaces found where single space expected");
    }
    // Parse JSON values without regex
    try {
      const parsed = JSON.parse(rest);
      if (keyword === "HEADERS") {
        headers = parsed;
      } else if (keyword === "QUERY") {
        query = parsed;
      } else if (keyword === "BODY") {
        body = parsed;
      } else {
        throwBadRequest("Unknown keyword");
      }
    } catch (e) {
      if (keyword === "HEADERS")
        throwBadRequest("Invalid JSON format in HEADERS section");
      if (keyword === "QUERY")
        throwBadRequest("Invalid JSON format in QUERY section");
      if (keyword === "BODY")
        throwBadRequest("Invalid JSON format in BODY section");
      throw e;
    }
  }

  return { method: methodPart as "GET" | "POST", url, headers, query, body };
}
