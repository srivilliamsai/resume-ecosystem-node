// services/notification-service/src/config.ts
// Centralized configuration for notification-service

export const config = {
  /** Service identity */
  serviceName: "notification-service" as const,
  port: Number(process.env.PORT) || 4060,

  /** Kafka */
  kafkaBroker: process.env.KAFKA_BROKER || "localhost:9092",
  kafkaClientId: "notification-service",
  kafkaGroupId: "notify-consumer",

  /** SMTP / Email */
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "noreply@resume-ecosystem.com",
  },

  /** JWT (for WebSocket authentication) */
  jwtSecret: process.env.JWT_SECRET || "",

  /** App URLs (for email links) */
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5173",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000",

  /** Database */
  postgresUrl: process.env.POSTGRES_URL || "postgresql://postgres:postgres@localhost:5432/resume_db",
} as const;

export default config;
