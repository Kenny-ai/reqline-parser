import { Request, Response, NextFunction } from "express";

type HandlerConfig = {
  path?: string;
  method?: "get" | "post" | "put" | "delete" | "";
  handler: (rc: Request, helpers: { http_statuses: any }) => Promise<any>;
};

export function createHandler(config: HandlerConfig) {
  const http_statuses = {
    HTTP_200_OK: 200,
    HTTP_201_CREATED: 201,
    HTTP_400_BAD_REQUEST: 400,
    HTTP_500_INTERNAL_SERVER_ERROR: 500,
  };

  return async function handler(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await config.handler(req, { http_statuses });
      if (result && typeof result === "object" && "status" in result) {
        return res.status((result as any).status).json((result as any).data);
      }
      return res.json(result);
    } catch (err: any) {
      if (err && err.expose === true) {
        return res.status(400).json({ error: true, message: err.message });
      }
      return next(err);
    }
  };
}

export default createHandler;
