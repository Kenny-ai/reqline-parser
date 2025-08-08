import express, { Request, Response, NextFunction } from "express";
import createHandler from "./core/express/create-handler";
import { parseReqline } from "./core/validator/parse-reqline";
import { executeParsedRequest } from "./core/http-request/execute-request";

const app = express();
app.use(express.json());

const baseHandler = createHandler({
  path: "/",
  method: "post",
  async handler(rc) {
    const { reqline } = (rc.body as any) || {};
    if (typeof reqline !== "string" || reqline.trim().length === 0) {
      const err: any = new Error("Missing reqline in request body");
      err.expose = true;
      throw err;
    }
    const parsed = parseReqline(reqline);
    const result = await executeParsedRequest(parsed);
    return result;
  },
});

app.post("/", baseHandler);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err && err.expose === true) {
    return res.status(400).json({ error: true, message: err.message });
  }
  return res
    .status(500)
    .json({ error: true, message: "Internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});

export default app;
