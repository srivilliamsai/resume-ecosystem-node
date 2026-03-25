// services/api-gateway/src/swagger/schemas.ts
// OpenAPI schema definitions for resume-ecosystem API
// These schemas document all routes proxied through the API gateway

import { FastifySchema } from "fastify";

// =============================================================================
// Common Schema Definitions
// =============================================================================

export const ErrorResponse = {
  type: "object",
  properties: {
    error: { type: "string", description: "Error message" },
    code: { type: "string", description: "Error code" },
    details: { type: "object", description: "Additional error details" },
  },
  required: ["error"],
} as const;

export const PaginationQuery = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1, description: "Page number" },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 20, description: "Items per page" },
    sort: { type: "string", description: "Sort field" },
    order: { type: "string", enum: ["asc", "desc"], default: "desc" },
  },
} as const;

// =============================================================================
// Auth Service Schemas (/auth/*)
// =============================================================================

export const UserSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "cuid", description: "User ID" },
    email: { type: "string", format: "email", description: "User email" },
    name: { type: "string", nullable: true, description: "User display name" },
    roles: {
      type: "array",
      items: { type: "string", enum: ["USER", "ADMIN"] },
      description: "User roles",
    },
    createdAt: { type: "string", format: "date-time", description: "Account creation date" },
  },
  required: ["id", "email", "roles"],
} as const;

export const RegisterRequest = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", description: "User email address" },
    password: { type: "string", minLength: 8, description: "Password (min 8 characters)" },
    name: { type: "string", description: "Display name (optional)" },
  },
  required: ["email", "password"],
} as const;

export const RegisterResponse = {
  type: "object",
  properties: {
    id: { type: "string", description: "Created user ID" },
    email: { type: "string", format: "email", description: "User email" },
  },
  required: ["id", "email"],
} as const;

export const LoginRequest = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", description: "User email" },
    password: { type: "string", description: "User password" },
  },
  required: ["email", "password"],
} as const;

export const LoginResponse = {
  type: "object",
  properties: {
    token: { type: "string", description: "JWT access token" },
    user: UserSchema,
  },
  required: ["token", "user"],
} as const;

export const MeResponse = {
  type: "object",
  properties: {
    sub: { type: "string", description: "User ID (subject)" },
    email: { type: "string", format: "email" },
    name: { type: "string", nullable: true },
    roles: { type: "array", items: { type: "string" } },
    iat: { type: "integer", description: "Issued at timestamp" },
    exp: { type: "integer", description: "Expiration timestamp" },
  },
  required: ["sub", "email", "roles", "iat", "exp"],
} as const;

// =============================================================================
// Activity Service Schemas (/activities/*)
// =============================================================================

export const ActivityType = {
  type: "string",
  enum: ["INTERNSHIP", "COURSE", "HACKATHON", "PROJECT"],
  description: "Type of activity",
} as const;

export const ActivityStatus = {
  type: "string",
  enum: ["PENDING", "VERIFIED", "REJECTED"],
  description: "Verification status",
} as const;

export const ActivitySchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "cuid" },
    userId: { type: "string", format: "cuid" },
    type: ActivityType,
    title: { type: "string", description: "Activity title" },
    org: { type: "string", nullable: true, description: "Organization name" },
    startDate: { type: "string", format: "date-time", nullable: true },
    endDate: { type: "string", format: "date-time", nullable: true },
    status: ActivityStatus,
    source: { type: "string", description: "Data source (MANUAL, GITHUB, etc.)" },
    metadata: { type: "object", nullable: true, description: "Additional metadata" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: ["id", "userId", "type", "title", "status", "source", "createdAt"],
} as const;

export const CreateActivityRequest = {
  type: "object",
  properties: {
    type: ActivityType,
    title: { type: "string", minLength: 1, maxLength: 255 },
    org: { type: "string", maxLength: 255 },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: "string", format: "date-time" },
    metadata: { type: "object" },
  },
  required: ["type", "title"],
} as const;

export const ActivityListResponse = {
  type: "object",
  properties: {
    data: { type: "array", items: ActivitySchema },
    total: { type: "integer" },
    page: { type: "integer" },
    limit: { type: "integer" },
  },
  required: ["data", "total", "page", "limit"],
} as const;

// =============================================================================
// Verification Service Schemas (/verify/*)
// =============================================================================

export const VerificationMethod = {
  type: "string",
  enum: ["WEBHOOK", "OAUTH", "HASH", "OCR"],
  description: "Verification method",
} as const;

export const VerificationStatus = {
  type: "string",
  enum: ["OK", "FAILED", "PENDING"],
  description: "Verification result status",
} as const;

export const VerificationCaseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "cuid" },
    activityId: { type: "string", format: "cuid" },
    method: VerificationMethod,
    status: VerificationStatus,
    logs: { type: "object", nullable: true },
    verifiedAt: { type: "string", format: "date-time", nullable: true },
  },
  required: ["id", "activityId", "method", "status"],
} as const;

export const VerifyHashRequest = {
  type: "object",
  properties: {
    activityId: { type: "string", format: "cuid", description: "Activity to verify" },
    artifactUrl: { type: "string", format: "uri", description: "URL of artifact to hash" },
    expectedHash: { type: "string", description: "Expected SHA256 hash" },
  },
  required: ["activityId", "artifactUrl", "expectedHash"],
} as const;

export const VerifyResponse = {
  type: "object",
  properties: {
    verified: { type: "boolean" },
    case: VerificationCaseSchema,
  },
  required: ["verified", "case"],
} as const;

// =============================================================================
// Resume Service Schemas (/resume/*)
// =============================================================================

export const ResumeVisibility = {
  type: "string",
  enum: ["PRIVATE", "PUBLIC", "LINK"],
  description: "Resume visibility setting",
} as const;

export const ResumeSectionSchema = {
  type: "object",
  properties: {
    type: { type: "string", description: "Section type (experience, education, etc.)" },
    title: { type: "string" },
    items: { type: "array", items: { type: "object" } },
  },
  required: ["type", "items"],
} as const;

export const ResumeVersionSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "cuid" },
    resumeId: { type: "string", format: "cuid" },
    createdAt: { type: "string", format: "date-time" },
    score: { type: "integer", minimum: 0, maximum: 100, description: "Resume quality score" },
    sections: { type: "array", items: ResumeSectionSchema },
  },
  required: ["id", "resumeId", "createdAt", "score", "sections"],
} as const;

export const ResumeSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "cuid" },
    userId: { type: "string", format: "cuid" },
    visibility: ResumeVisibility,
    currentVersionId: { type: "string", format: "cuid", nullable: true },
    currentVersion: { ...ResumeVersionSchema, nullable: true },
  },
  required: ["id", "userId", "visibility"],
} as const;

export const RebuildResumeRequest = {
  type: "object",
  properties: {
    template: { type: "string", default: "default", description: "Resume template" },
    forceRebuild: { type: "boolean", default: false },
  },
} as const;

export const RebuildResumeResponse = {
  type: "object",
  properties: {
    resume: ResumeSchema,
    version: ResumeVersionSchema,
    score: { type: "integer" },
  },
  required: ["resume", "version", "score"],
} as const;

// =============================================================================
// Integration Service Schemas (/webhooks/*)
// =============================================================================

export const WebhookPayload = {
  type: "object",
  properties: {
    event: { type: "string", description: "Webhook event type" },
    source: { type: "string", description: "Source platform (github, coursera, etc.)" },
    data: { type: "object", description: "Event payload" },
    signature: { type: "string", description: "HMAC signature for verification" },
  },
  required: ["event", "source", "data"],
} as const;

export const WebhookResponse = {
  type: "object",
  properties: {
    received: { type: "boolean" },
    eventId: { type: "string" },
  },
  required: ["received"],
} as const;

// =============================================================================
// File Service Schemas (/render/*)
// =============================================================================

export const RenderPdfRequest = {
  type: "object",
  properties: {
    resumeId: { type: "string", format: "cuid" },
    versionId: { type: "string", format: "cuid", description: "Optional specific version" },
    template: {
      type: "string",
      enum: ["minimal", "modern", "ats-optimized"],
      default: "modern",
    },
    format: {
      type: "string",
      enum: ["pdf", "html"],
      default: "pdf",
    },
  },
  required: ["resumeId"],
} as const;

// =============================================================================
// Route Schema Definitions (for Fastify)
// =============================================================================

export const authSchemas = {
  register: {
    tags: ["Authentication"],
    summary: "Register a new user",
    description: "Create a new user account with email and password",
    body: RegisterRequest,
    response: {
      200: RegisterResponse,
      409: ErrorResponse,
    },
  } as FastifySchema,

  login: {
    tags: ["Authentication"],
    summary: "Login and get JWT token",
    description: "Authenticate with email/password and receive a JWT token",
    body: LoginRequest,
    response: {
      200: LoginResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  me: {
    tags: ["Authentication"],
    summary: "Get current user info",
    description: "Returns the authenticated user's information from the JWT token",
    security: [{ bearerAuth: [] }],
    response: {
      200: MeResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,
};

export const activitySchemas = {
  list: {
    tags: ["Activities"],
    summary: "List user activities",
    description: "Get paginated list of activities for the authenticated user",
    security: [{ bearerAuth: [] }],
    querystring: PaginationQuery,
    response: {
      200: ActivityListResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  create: {
    tags: ["Activities"],
    summary: "Create a new activity",
    description: "Add a new activity (internship, course, hackathon, or project)",
    security: [{ bearerAuth: [] }],
    body: CreateActivityRequest,
    response: {
      200: ActivitySchema,
      401: ErrorResponse,
      400: ErrorResponse,
    },
  } as FastifySchema,

  get: {
    tags: ["Activities"],
    summary: "Get activity by ID",
    description: "Retrieve a specific activity by its ID",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      properties: {
        id: { type: "string", format: "cuid" },
      },
      required: ["id"],
    },
    response: {
      200: ActivitySchema,
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  update: {
    tags: ["Activities"],
    summary: "Update an activity",
    description: "Update an existing activity",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      properties: {
        id: { type: "string", format: "cuid" },
      },
      required: ["id"],
    },
    body: CreateActivityRequest,
    response: {
      200: ActivitySchema,
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  delete: {
    tags: ["Activities"],
    summary: "Delete an activity",
    description: "Delete an activity by ID",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      properties: {
        id: { type: "string", format: "cuid" },
      },
      required: ["id"],
    },
    response: {
      200: { type: "object", properties: { deleted: { type: "boolean" } } },
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,
};

export const verifySchemas = {
  hash: {
    tags: ["Verification"],
    summary: "Verify activity by hash",
    description: "Verify an activity artifact using SHA256 hash comparison",
    security: [{ bearerAuth: [] }],
    body: VerifyHashRequest,
    response: {
      200: VerifyResponse,
      400: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  status: {
    tags: ["Verification"],
    summary: "Get verification status",
    description: "Get verification cases for an activity",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      properties: {
        activityId: { type: "string", format: "cuid" },
      },
      required: ["activityId"],
    },
    response: {
      200: {
        type: "array",
        items: VerificationCaseSchema,
      },
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,
};

export const resumeSchemas = {
  get: {
    tags: ["Resume"],
    summary: "Get current resume",
    description: "Get the authenticated user's resume with current version",
    security: [{ bearerAuth: [] }],
    response: {
      200: ResumeSchema,
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  rebuild: {
    tags: ["Resume"],
    summary: "Rebuild resume",
    description: "Trigger a resume rebuild from verified activities",
    security: [{ bearerAuth: [] }],
    body: RebuildResumeRequest,
    response: {
      200: RebuildResumeResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  versions: {
    tags: ["Resume"],
    summary: "List resume versions",
    description: "Get all versions of the user's resume",
    security: [{ bearerAuth: [] }],
    querystring: PaginationQuery,
    response: {
      200: {
        type: "object",
        properties: {
          data: { type: "array", items: ResumeVersionSchema },
          total: { type: "integer" },
        },
      },
      401: ErrorResponse,
    },
  } as FastifySchema,

  updateVisibility: {
    tags: ["Resume"],
    summary: "Update resume visibility",
    description: "Change resume visibility (private, public, or link-only)",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      properties: {
        visibility: ResumeVisibility,
      },
      required: ["visibility"],
    },
    response: {
      200: ResumeSchema,
      401: ErrorResponse,
    },
  } as FastifySchema,
};

export const webhookSchemas = {
  receive: {
    tags: ["Webhooks"],
    summary: "Receive webhook event",
    description: "Endpoint for external platforms to send activity events",
    body: WebhookPayload,
    response: {
      200: WebhookResponse,
      400: ErrorResponse,
    },
  } as FastifySchema,
};

export const renderSchemas = {
  pdf: {
    tags: ["File Generation"],
    summary: "Render resume as PDF",
    description: "Generate a PDF file from the user's resume",
    security: [{ bearerAuth: [] }],
    body: RenderPdfRequest,
    response: {
      200: {
        type: "string",
        format: "binary",
        description: "PDF file",
      },
      404: ErrorResponse,
      401: ErrorResponse,
    },
  } as FastifySchema,

  preview: {
    tags: ["File Generation"],
    summary: "Preview resume as HTML",
    description: "Generate an HTML preview of the resume",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        template: { type: "string", enum: ["minimal", "modern", "ats-optimized"] },
      },
    },
    response: {
      200: {
        type: "string",
        description: "HTML content",
      },
      401: ErrorResponse,
    },
  } as FastifySchema,
};
