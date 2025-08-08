export const appLogger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
};

export const timeLogger = {
  start(label: string) {
    console.time(label);
  },
  stop(label: string) {
    console.timeEnd(label);
  },
};

export default { appLogger, timeLogger };
