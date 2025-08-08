export const ERROR_CODE = {
  NOAUTHERR: "NOAUTHERR",
  BADREQUEST: "BADREQUEST",
};

export function throwAppError(message: string, _code?: string): never {
  const err: any = new Error(message);
  err.expose = true;
  throw err;
}
