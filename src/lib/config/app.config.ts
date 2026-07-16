import { Config as env } from "./index";

export const AppConfig = {
  appName:
    env.APP_NAME,

  environment:
    env.NODE_ENV,

  port:
    env.PORT,
};