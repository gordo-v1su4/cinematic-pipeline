# NOCODB_SCHEMA.md
## Pipeline Database — NocoDB Self-Hosted

**Instance**: https://nocodb.v1su4.dev
**n8n instance**: https://n8n.v1su4.dev

---

## SETUP STEPS

### 1. Get your API token
NocoDB → bottom-left user icon → Account Settings → API Tokens
→ Create token named `cinematic-pipeline`
→ Copy token → store as n8n credential `NOCODB_API_TOKEN`

### 2. Get your Base ID
Open your NocoDB base → click base name top-left → URL will show:
`https://nocodb.v1su4.dev/nc/p_XXXXXXXXXX/...`
The `p_XXXXXXXXXX` is your Base ID.

### 3. Get Table IDs after creating tables
Each table URL contains the Table ID: `m_XXXXXXXXXX`
Note these after creating each table below.

---

## API BASE URL PATTERN

```
https://nocodb.v1su4.dev/api/v2/tables/{tableId}/records
```

### Headers for every request
```
xc-token: {your-api-token}
Content-Type: application/json
```

### Create record (POST)
```
POST https://nocodb.v1su4.dev/api/v2/tables/{tableId}/records
```

### Update record (PATCH)
```
PATCH https://nocodb.v1su4.dev/api/v2/tables/{tableId}/records
Body: [{ "Id": {recordId}, "field": "value" }]
```

### Get records with filter (GET)
```
GET https://nocodb.v1su4.dev/api/v2/tables/{tableId}/records
  ?where=(treatment_id,eq,20260314_une_seconde)
  &limit=25
```

---

## TABLE SCHEMAS

Create these three tables in NocoDB.
After creation, note the Table ID (m_XXXX) from the URL for each.

---

### TABLE 1 — Treatments

**Purpose**: One row per treatment. The master record.

| Field Name | Type | Notes |
|---|---|---|
| treatment_id | Single line text | Primary — e.g. `20260314_une_seconde` |
| title | Single line text | e.g. `Une Seconde / One Second` |
| tagline | Long text | One sentence emotional premise |
| structure | Single line text | A / B / C etc |
| structure_name | Single line text | Reverse / Forward / Loop etc |
| collision | Single line text | physical / audible / visual etc |
| director_tone | Single line text | Glazer / Jeunet / hybrid etc |
| product_mode | Single line text | pure / ghost / integrated / assigned |
| location_type | Single line text | transit / margin / interior etc |
| location_description | Long text | Full location brief |
| created_at | Date | Auto |
| version | Number | Default 1 |
| treatment_json_path | Single line text | Path to full JSON file |
| prompts_json_path | Single line text | Path to prompts JSON file |
| status | Single select | Options: draft / generating / evaluating / approved / training-set |

---

### TABLE 2 — Shots

**Purpose**: One row per generated image. 9 rows per treatment.
Links to Treatments table via treatment_id.

| Field Name | Type | Notes |
|---|---|---|
| shot_id | Single line text | `{treatment_id}_s{shot_number}` e.g. `20260314_une_seconde_s05` |
| treatment_id | Single line text | FK → Treatments.treatment_id |
| shot_number | Number | 1–9 |
| screen_position | Number | 1–9 |
| narrative_position | Number | 1–9 |
| is_pivot_shot | Checkbox | True for shot 05 |
| title | Single line text | Shot title |
| prompt | Long text | Full NB Pro prompt string |
| negative_prompt | Long text | |
| image_path | Single line text | Local path to generated image |
| image_url | URL | If hosted |
| model_used | Single line text | nano-banana-pro / nano-banana-2 / flux-1-dev |
| batch_variant | Number | Which variant was selected (1–8) |
| generated_at | Date | |
| anamorphic_fidelity | Decimal | 1.0–5.0 |
| lighting_quality | Decimal | 1.0–5.0 |
| color_grade | Decimal | 1.0–5.0 |
| subject_sharpness | Decimal | 1.0–5.0 |
| composition | Decimal | 1.0–5.0 |
| shot_energy | Decimal | 1.0–5.0 |
| per_image_average | Decimal | Auto-calculated or filled by Judge |
| pivot_shot_score | Decimal | Null unless is_pivot_shot |
| failure_axes | Long text | JSON array of failing axis names |
| judge_notes | Long text | VLM evaluation notes |
| routing | Single select | Options: approved / optimizer / expander / regenerate / human-review |
| expander_used | Checkbox | Whether Expander was run on this shot |
| expansion_type | Single line text | through_something / motion_evidence / etc |
| optimizer_cycles | Number | How many Optimizer cycles ran |
| training_set_eligible | Checkbox | |
| pivot_archive_eligible | Checkbox | |

---

### TABLE 3 — Sequences

**Purpose**: One row per evaluated 3×3 grid. Sequence-level scores.
Links to Treatments table via treatment_id.

| Field Name | Type | Notes |
|---|---|---|
| sequence_id | Single line text | `{treatment_id}_v{version}` |
| treatment_id | Single line text | FK → Treatments.treatment_id |
| grid_image_path | Single line text | Path to assembled 3×3 PNG |
| grid_image_url | URL | If hosted |
| evaluated_at | Date | |
| evaluation_model | Single line text | claude-sonnet-4-5 |
| sequence_dynamicism | Decimal | 1.0–5.0 |
| anamorphic_consistency | Decimal | 1.0–5.0 |
| character_consistency | Decimal | 1.0–5.0 |
| world_continuity | Decimal | 1.0–5.0 |
| narrative_flow | Decimal | 1.0–5.0 |
| sequence_average | Decimal | |
| minimum_coverage_met | Checkbox | |
| sequence_pass | Checkbox | All axes ≥ 4.0 |
| blocking_axes | Long text | JSON array |
| top_failure | Single line text | |
| recommended_action | Single select | Options: approve / optimizer / expander / regenerate / human-review |
| training_set_eligible | Checkbox | |
| reference_library_used | Checkbox | Whether ref images were loaded |
| judge_notes | Long text | |

---

## NOCODB API CALLS USED IN n8n

### Log a new treatment
```http
POST https://nocodb.v1su4.dev/api/v2/tables/{TREATMENTS_TABLE_ID}/records
Headers: xc-token: {token}
Body:
{
  "treatment_id": "20260314_une_seconde",
  "title": "Une Seconde / One Second",
  "structure": "A",
  "structure_name": "Reverse",
  "collision": "audible",
  "director_tone": "hybrid",
  "product_mode": "pure",
  "location_type": "transit",
  "status": "generating",
  "treatment_json_path": "/treatments/20260314_une_seconde.json"
}
```

### Log a shot after generation
```http
POST https://nocodb.v1su4.dev/api/v2/tables/{SHOTS_TABLE_ID}/records
Body:
{
  "shot_id": "20260314_une_seconde_s05",
  "treatment_id": "20260314_une_seconde",
  "shot_number": 5,
  "is_pivot_shot": true,
  "prompt": "...",
  "image_path": "/outputs/shots/20260314_une_seconde_s05_v3.jpg",
  "model_used": "nano-banana-pro",
  "batch_variant": 3
}
```

### Update shot with scores after Judge
```http
PATCH https://nocodb.v1su4.dev/api/v2/tables/{SHOTS_TABLE_ID}/records
Body:
[{
  "Id": {nocodb_record_id},
  "anamorphic_fidelity": 4.5,
  "lighting_quality": 4.0,
  "color_grade": 4.0,
  "subject_sharpness": 4.5,
  "composition": 3.5,
  "shot_energy": 2.5,
  "per_image_average": 3.83,
  "failure_axes": "[\"shot_energy\", \"composition\"]",
  "routing": "expander"
}]
```

### Update treatment status
```http
PATCH https://nocodb.v1su4.dev/api/v2/tables/{TREATMENTS_TABLE_ID}/records
Body:
[{
  "Id": {nocodb_record_id},
  "status": "approved"
}]
```

### Query shots needing reprocessing
```http
GET https://nocodb.v1su4.dev/api/v2/tables/{SHOTS_TABLE_ID}/records
  ?where=(routing,eq,expander)~and(treatment_id,eq,20260314_une_seconde)
```

---

## ENV VARIABLES FOR n8n

Store these as n8n credentials / environment variables:

```
NOCODB_BASE_URL=https://nocodb.v1su4.dev
NOCODB_API_TOKEN={your-token}
NOCODB_TREATMENTS_TABLE_ID={m_XXXX after creating table}
NOCODB_SHOTS_TABLE_ID={m_XXXX after creating table}
NOCODB_SEQUENCES_TABLE_ID={m_XXXX after creating table}
```

---

## SWAGGER UI

To explore and test all API endpoints interactively:
```
https://nocodb.v1su4.dev/api/v2/meta/tables/{tableId}/swagger
```
Or access from within NocoDB: base name → Rest APIs
