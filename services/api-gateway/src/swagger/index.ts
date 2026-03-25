// services/api-gateway/src/swagger/index.ts
// Barrel export for swagger configuration

export { registerSwagger, swaggerOptions, swaggerUiOptions } from "./config.js";
export { registerDocumentedRoutes } from "./routes.js";
export * from "./schemas.js";
