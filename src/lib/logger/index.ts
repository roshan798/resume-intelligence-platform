import pino from "pino";
import { Config } from "@/lib/config";

export const logger = pino({
    level: Config.LOG_LEVEL,

    transport:
        Config.NODE_ENV === "development"
            ? {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: true,
                  },
              }
            : undefined,
});
