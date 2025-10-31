export interface ApiUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface Activity {
  id: string;
  title: string;
  type: "INTERNSHIP" | "COURSE" | "HACKATHON" | "PROJECT";
  org?: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
}

export interface VerificationCase {
  id: string;
  activityId: string;
  status: "OK" | "FAILED" | "PENDING";
  method: "HASH" | "WEBHOOK" | "OAUTH" | "OCR";
  logs?: Record<string, unknown> | null;
  verifiedAt?: string | null;
}

export interface ResumeVersion {
  id: string;
  score: number;
  createdAt: string;
  sections: Record<string, unknown>;
}

export interface ResumeResponse {
  id?: string;
  currentVersion?: ResumeVersion | null;
  versions?: ResumeVersion[];
}

export interface GenericResponse {
  ok: boolean;
  message?: string;
}
