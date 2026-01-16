import type { Express } from "express";
import methodOverride from "method-override";

export const configureMethodOverride = (app: Express) => {
  app.use(
    methodOverride((req) => {
      const queryMethod = (req.query as Record<string, unknown> | undefined)
        ?._method;
      if (typeof queryMethod === "string" && queryMethod) return queryMethod;

      const headerMethod = req.headers["x-http-method-override"];
      if (typeof headerMethod === "string" && headerMethod) return headerMethod;

      return req.method;
    }),
  );
};

