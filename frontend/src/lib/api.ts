const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

// --- Helpers to flatten NocoDB v3 records ---

interface NocoDBRecord<T> {
  id: string | number;
  fields: T;
}

interface NocoDBListResponse<T> {
  records: NocoDBRecord<T>[];
  next: string | null;
  prev: string | null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTreatmentFields(fields: RawTreatmentFields): TreatmentFields {
  return {
    ...fields,
    version: toNumber(fields.version) ?? 0,
  };
}

function normalizeShotFields(fields: RawShotFields): ShotFields {
  return {
    ...fields,
    shot_number: toNumber(fields.shot_number) ?? 0,
    screen_position: toNumber(fields.screen_position) ?? 0,
    narrative_position: toNumber(fields.narrative_position) ?? 0,
    is_pivot_shot: toBoolean(fields.is_pivot_shot),
    batch_variant: toNumber(fields.batch_variant) ?? 0,
    anamorphic_fidelity: toNumber(fields.anamorphic_fidelity),
    lighting_quality: toNumber(fields.lighting_quality),
    color_grade: toNumber(fields.color_grade),
    subject_sharpness: toNumber(fields.subject_sharpness),
    composition: toNumber(fields.composition),
    shot_energy: toNumber(fields.shot_energy),
    per_image_average: toNumber(fields.per_image_average),
    pivot_shot_score: toNumber(fields.pivot_shot_score),
    expander_used: toBoolean(fields.expander_used),
    optimizer_cycles: toNumber(fields.optimizer_cycles) ?? 0,
    training_set_eligible: toBoolean(fields.training_set_eligible),
    pivot_archive_eligible: toBoolean(fields.pivot_archive_eligible),
  };
}

function normalizeSequenceFields(fields: RawSequenceFields): SequenceFields {
  return {
    ...fields,
    sequence_dynamicism: toNumber(fields.sequence_dynamicism),
    anamorphic_consistency: toNumber(fields.anamorphic_consistency),
    character_consistency: toNumber(fields.character_consistency),
    world_continuity: toNumber(fields.world_continuity),
    narrative_flow: toNumber(fields.narrative_flow),
    sequence_average: toNumber(fields.sequence_average),
    minimum_coverage_met: toBoolean(fields.minimum_coverage_met),
    sequence_pass: toBoolean(fields.sequence_pass),
    training_set_eligible: toBoolean(fields.training_set_eligible),
    reference_library_used: toBoolean(fields.reference_library_used),
  };
}

function flatten<T, U = T>(
  record: NocoDBRecord<T>,
  normalize?: (fields: T) => U
): U & { _id: string | number } {
  const fields = normalize ? normalize(record.fields) : (record.fields as unknown as U);
  return { _id: record.id, ...fields };
}

function flattenList<T, U = T>(
  response: NocoDBListResponse<T>,
  normalize?: (fields: T) => U
): {
  data: (U & { _id: string | number })[];
  next: string | null;
  prev: string | null;
} {
  return {
    data: response.records.map((record) => flatten(record, normalize)),
    next: response.next,
    prev: response.prev,
  };
}

// --- Treatments ---

export async function listTreatments(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  const res = await fetchAPI<NocoDBListResponse<RawTreatmentFields>>(
    `/api/treatments${qs ? `?${qs}` : ""}`
  );
  return flattenList(res, normalizeTreatmentFields);
}

export async function getTreatment(id: string) {
  const res = await fetchAPI<NocoDBRecord<RawTreatmentFields>>(
    `/api/treatments/${id}`
  );
  return flatten(res, normalizeTreatmentFields);
}

export async function getTreatmentShots(id: string) {
  const res = await fetchAPI<NocoDBListResponse<RawShotFields>>(
    `/api/treatments/${id}/shots`
  );
  return flattenList(res, normalizeShotFields);
}

export async function getTreatmentSequences(id: string) {
  const res = await fetchAPI<NocoDBListResponse<RawSequenceFields>>(
    `/api/treatments/${id}/sequences`
  );
  return flattenList(res, normalizeSequenceFields);
}

// --- Shots ---

export async function listShots(params?: {
  treatment_id?: string;
  routing?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.treatment_id) query.set("treatment_id", params.treatment_id);
  if (params?.routing) query.set("routing", params.routing);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  const res = await fetchAPI<NocoDBListResponse<RawShotFields>>(
    `/api/shots${qs ? `?${qs}` : ""}`
  );
  return flattenList(res, normalizeShotFields);
}

export async function listFailingShots(params?: {
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  const res = await fetchAPI<NocoDBListResponse<RawShotFields>>(
    `/api/shots/failing${qs ? `?${qs}` : ""}`
  );
  return flattenList(res, normalizeShotFields);
}

// --- Sequences ---

export async function listSequences(params?: {
  treatment_id?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.treatment_id) query.set("treatment_id", params.treatment_id);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  const res = await fetchAPI<NocoDBListResponse<RawSequenceFields>>(
    `/api/sequences${qs ? `?${qs}` : ""}`
  );
  return flattenList(res, normalizeSequenceFields);
}

// --- Pipeline ---

export async function triggerGeneration(treatmentId: string) {
  return fetchAPI<{ message: string }>("/api/pipeline/generate", {
    method: "POST",
    body: JSON.stringify({ treatment_id: treatmentId }),
  });
}

export async function triggerEvaluation(treatmentId: string) {
  return fetchAPI<{ message: string }>("/api/pipeline/evaluate", {
    method: "POST",
    body: JSON.stringify({ treatment_id: treatmentId }),
  });
}

// --- Types (NocoDB v3 field objects) ---

interface RawTreatmentFields {
  treatment_id: string;
  title: string;
  tagline: string;
  structure: string;
  structure_name: string;
  collision: string;
  director_tone: string;
  product_mode: string;
  location_type: string;
  location_description: string;
  status: string;
  version: number | string;
  created_at: string;
  treatment_json_path: string;
  prompts_json_path: string;
}

interface RawShotFields {
  shot_id: string;
  treatment_id: string;
  shot_number: number | string;
  screen_position: number | string;
  narrative_position: number | string;
  is_pivot_shot: boolean | string;
  title: string;
  prompt: string | null;
  negative_prompt: string | null;
  image_path: string | null;
  image_url: string | null;
  model_used: string | null;
  batch_variant: number | string;
  generated_at: string;
  anamorphic_fidelity: number | string | null;
  lighting_quality: number | string | null;
  color_grade: number | string | null;
  subject_sharpness: number | string | null;
  composition: number | string | null;
  shot_energy: number | string | null;
  per_image_average: number | string | null;
  pivot_shot_score: number | string | null;
  failure_axes: string | null;
  judge_notes: string | null;
  routing: string | null;
  expander_used: boolean | string;
  expansion_type: string | null;
  optimizer_cycles: number | string;
  training_set_eligible: boolean | string;
  pivot_archive_eligible: boolean | string;
}

interface RawSequenceFields {
  sequence_id: string;
  treatment_id: string;
  grid_image_path: string;
  grid_image_url: string | null;
  evaluated_at: string;
  evaluation_model: string;
  sequence_dynamicism: number | string | null;
  anamorphic_consistency: number | string | null;
  character_consistency: number | string | null;
  world_continuity: number | string | null;
  narrative_flow: number | string | null;
  sequence_average: number | string | null;
  minimum_coverage_met: boolean | string | null;
  sequence_pass: boolean | string;
  blocking_axes: string | null;
  top_failure: string | null;
  recommended_action: string | null;
  training_set_eligible: boolean | string | null;
  reference_library_used: boolean | string;
  judge_notes: string | null;
}

export interface TreatmentFields {
  treatment_id: string;
  title: string;
  tagline: string;
  structure: string;
  structure_name: string;
  collision: string;
  director_tone: string;
  product_mode: string;
  location_type: string;
  location_description: string;
  status: string;
  version: number;
  created_at: string;
  treatment_json_path: string;
  prompts_json_path: string;
}

export interface ShotFields {
  shot_id: string;
  treatment_id: string;
  shot_number: number;
  screen_position: number;
  narrative_position: number;
  is_pivot_shot: boolean;
  title: string;
  prompt: string | null;
  negative_prompt: string | null;
  image_path: string | null;
  image_url: string | null;
  model_used: string | null;
  batch_variant: number;
  generated_at: string;
  anamorphic_fidelity: number | null;
  lighting_quality: number | null;
  color_grade: number | null;
  subject_sharpness: number | null;
  composition: number | null;
  shot_energy: number | null;
  per_image_average: number | null;
  pivot_shot_score: number | null;
  failure_axes: string | null;
  judge_notes: string | null;
  routing: string | null;
  expander_used: boolean;
  expansion_type: string | null;
  optimizer_cycles: number;
  training_set_eligible: boolean;
  pivot_archive_eligible: boolean;
}

export interface SequenceFields {
  sequence_id: string;
  treatment_id: string;
  grid_image_path: string;
  grid_image_url: string | null;
  evaluated_at: string;
  evaluation_model: string;
  sequence_dynamicism: number | null;
  anamorphic_consistency: number | null;
  character_consistency: number | null;
  world_continuity: number | null;
  narrative_flow: number | null;
  sequence_average: number | null;
  minimum_coverage_met: boolean;
  sequence_pass: boolean;
  blocking_axes: string | null;
  top_failure: string | null;
  recommended_action: string | null;
  training_set_eligible: boolean;
  reference_library_used: boolean;
  judge_notes: string | null;
}

export type Treatment = TreatmentFields & { _id: string | number };
export type Shot = ShotFields & { _id: string | number };
export type Sequence = SequenceFields & { _id: string | number };
