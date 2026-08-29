type LogLevel = "info" | "warning" | "error" | "audit";

type LogContext = Record<string, unknown>;

function writeLog(
  level: LogLevel,
  message: string,
  context: LogContext = {}
) {
  const entry = {
    at: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warning") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

export const logger = {
  info(message: string, context?: LogContext) {
    writeLog("info", message, context);
  },
  warning(message: string, context?: LogContext) {
    writeLog("warning", message, context);
  },
  error(message: string, context?: LogContext) {
    writeLog("error", message, context);
  },
  audit(message: string, context?: LogContext) {
    writeLog("audit", message, context);
  },
};
