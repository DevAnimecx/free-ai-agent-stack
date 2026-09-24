// The shape of what scripts/export_json.py writes into public/data/*.json.
// Mirrors schemas/*.schema.json — the schemas are the source of truth; this file
// only tells TypeScript what to expect.

export type Status = "active" | "degraded" | "broken" | "deprecated";

export type Modality =
  | "text"
  | "vision"
  | "audio"
  | "video"
  | "image-gen"
  | "embeddings"
  | "rerank"
  | "speech-to-text"
  | "text-to-speech"
  | "translation"
  | "ocr";

export interface BaseEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  docs_url?: string;
  tags?: string[];
  verified: string;
  verified_by: string;
  status: Status;
  notes?: string | string[];
  stars?: number;
}

export interface LlmApiEntry extends BaseEntry {
  provider: string;
  free_limit: string;
  free_limit_tokens_per_day?: number;
  requires_card: boolean;
  requires_phone?: boolean;
  rate_limit?: string;
  models?: string[];
  modalities?: Modality[];
  context_window?: number;
  commercial_use?: boolean;
  data_used_for_training?: boolean | null;
  signup_url?: string;
}

export interface McpServerEntry extends BaseEntry {
  maintainer: string;
  install: string;
  transport?: Array<"stdio" | "http" | "sse">;
  official: boolean;
  language?: string;
  tools_exposed?: number;
  requires_auth: boolean;
  auth_type?: string;
  clients?: string[];
}

export interface AgentToolEntry extends BaseEntry {
  category: "ide" | "cli" | "framework" | "orchestrator";
  free_limit: string;
  requires_card: boolean;
  open_source: boolean;
  license?: string;
  language?: string;
  platforms?: string[];
  install?: string;
}

export interface FreeTierEntry extends BaseEntry {
  category:
    | "hosting"
    | "compute"
    | "database"
    | "vector-db"
    | "auth"
    | "storage"
    | "queue"
    | "observability"
    | "analytics"
    | "email"
    | "search";
  free_limit: string;
  requires_card: boolean;
  cold_start_risk?: "low" | "medium" | "high";
}

export type AnyEntry = LlmApiEntry | McpServerEntry | AgentToolEntry | FreeTierEntry;

export interface CategoryConfig {
  slug: string;
  label: string;
  title: string;
  metaDescription: string;
  intro: string[];
  schema: string;
  /** Which boolean a "no credit card" filter should read. */
  cardFreeField?: "requires_card";
}

export interface Stats {
  generated_at: string;
  total: number;
  counts: Record<string, number>;
  no_card: Record<string, number>;
  total_no_card: number;
  fresh_within_7_days: Record<string, number>;
  fresh_within_30_days: Record<string, number>;
  freshness_pct_30d: number;
  statuses: Record<string, Record<string, number>>;
  contributors: Record<string, number>;
  top_tags: Record<string, number>;
  deprecated_entries: string[];
  featured: Record<string, string[]>;
}
