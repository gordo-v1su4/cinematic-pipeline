# NOCODB_SCHEMA.md
## Pipeline Database Contract — NocoDB Base + MCP

**NocoDB instance**: [https://nocodb.v1su4.dev](https://nocodb.v1su4.dev)
**Approved Swagger UI**: [https://nocodb.v1su4.dev/api/v3/meta/bases/pp23qqevp2igvcy/swagger](https://nocodb.v1su4.dev/api/v3/meta/bases/pp23qqevp2igvcy/swagger)
**Approved Swagger JSON**: `GET /api/v3/meta/bases/pp23qqevp2igvcy/swagger.json` on the same host
**Approved MCP endpoint**: `https://nocodb.v1su4.dev/mcp/nc6qdr2naw76ymg1`

This project is pinned to a single NocoDB base:

```text
Base ID: pp23qqevp2igvcy
```

Do not use legacy `api/v2/tables/{tableId}/records` examples for this repo.
Only use:

1. The base-scoped operations exposed by the authenticated Swagger above.
2. The NocoDB MCP server configured for this project.

---

## Project MCP Setup

Use the project-local MCP template at [`/.mcp.json.example`](../.mcp.json.example).

Create a local ignored file at `/.mcp.json` with your real token:

```json
{
  "mcpServers": {
    "NocoDB Base - Cinematic Pipeline": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://nocodb.v1su4.dev/mcp/nc6qdr2naw76ymg1",
        "--header",
        "xc-mcp-token: ${NOCODB_MCP_TOKEN}"
      ]
    }
  }
}
```

### Auth details

- Swagger JSON requires authenticated access. The Swagger UI loads `./swagger.json` with the `xc-auth` header from a signed-in browser session.
- MCP uses the `xc-mcp-token` header instead.
- Keep the real MCP token out of git. `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` are ignored.

---

## Storage Contract

This pipeline uses local filesystem storage as the source of truth for generated assets.
NocoDB stores metadata plus file paths and optional hosted URLs.

### Required local directories

```text
/treatments
/prompts
/outputs/shots
/outputs/grids
/outputs/training-set
```

### Storage rules

- `treatments/` stores the authoritative treatment JSON payloads.
- `prompts/` stores the prompt sets derived from treatments.
- `outputs/shots/` stores generated individual frames.
- `outputs/grids/` stores assembled 3x3 sequence grids.
- `outputs/training-set/` stores approved exports for LoRA training.
- NocoDB rows should reference these paths directly and only add `image_url` or `grid_image_url` when assets are also published elsewhere.

### Frontend env scaffold

Use [`frontend/.env.example`](../frontend/.env.example) as the starting point for `frontend/.env.local`.

```bash
cp frontend/.env.example frontend/.env.local
```

Recommended values:

```dotenv
NEXT_PUBLIC_NOCODB_BASE_URL=https://nocodb.v1su4.dev
NEXT_PUBLIC_NOCODB_BASE_ID=pp23qqevp2igvcy
NEXT_PUBLIC_NOCODB_SWAGGER_URL=https://nocodb.v1su4.dev/api/v3/meta/bases/pp23qqevp2igvcy/swagger

PIPELINE_STORAGE_ROOT=/Users/robertspaniolo/Documents/Github/cinematic-pipeline
PIPELINE_TREATMENTS_DIR=/Users/robertspaniolo/Documents/Github/cinematic-pipeline/treatments
PIPELINE_PROMPTS_DIR=/Users/robertspaniolo/Documents/Github/cinematic-pipeline/prompts
PIPELINE_SHOTS_DIR=/Users/robertspaniolo/Documents/Github/cinematic-pipeline/outputs/shots
PIPELINE_GRIDS_DIR=/Users/robertspaniolo/Documents/Github/cinematic-pipeline/outputs/grids
PIPELINE_TRAINING_SET_DIR=/Users/robertspaniolo/Documents/Github/cinematic-pipeline/outputs/training-set
```

---

## Local Setup Checklist

### 1. Create the directories

```bash
mkdir -p prompts outputs/shots outputs/grids outputs/training-set
```

### 2. Configure local MCP access

Set your token in shell config or a local secret store:

```bash
export NOCODB_MCP_TOKEN='replace-with-real-token'
```

Then copy the template:

```bash
cp .mcp.json.example .mcp.json
```

### 3. Verify the approved Swagger target

Open:

```text
https://nocodb.v1su4.dev/api/v3/meta/bases/pp23qqevp2igvcy/swagger
```

If `swagger.json` returns `401 Authentication required`, that is expected until you are signed in or attaching the required auth header.

---

## Data Model

The project still uses three logical collections:

1. `Treatments`
2. `Shots`
3. `Sequences`

Keep the existing business fields from the earlier draft schema, but resolve the exact create/read/update operations from the approved base Swagger or the MCP server rather than hardcoding legacy v2 routes.

### Treatments

- `treatment_id`
- `title`
- `tagline`
- `structure`
- `structure_name`
- `collision`
- `director_tone`
- `product_mode`
- `location_type`
- `location_description`
- `created_at`
- `version`
- `treatment_json_path`
- `prompts_json_path`
- `status`

### Shots

- `shot_id`
- `treatment_id`
- `shot_number`
- `screen_position`
- `narrative_position`
- `is_pivot_shot`
- `title`
- `prompt`
- `negative_prompt`
- `image_path`
- `image_url`
- `model_used`
- `batch_variant`
- `generated_at`
- `anamorphic_fidelity`
- `lighting_quality`
- `color_grade`
- `subject_sharpness`
- `composition`
- `shot_energy`
- `per_image_average`
- `pivot_shot_score`
- `failure_axes`
- `judge_notes`
- `routing`
- `expander_used`
- `expansion_type`
- `optimizer_cycles`
- `training_set_eligible`
- `pivot_archive_eligible`

### Sequences

- `sequence_id`
- `treatment_id`
- `grid_image_path`
- `grid_image_url`
- `evaluated_at`
- `evaluation_model`
- `sequence_dynamicism`
- `anamorphic_consistency`
- `character_consistency`
- `world_continuity`
- `narrative_flow`
- `sequence_average`
- `minimum_coverage_met`
- `sequence_pass`
- `blocking_axes`
- `top_failure`
- `recommended_action`
- `training_set_eligible`
- `reference_library_used`
- `judge_notes`

---

## Operational Rule

For this repository, NocoDB integration means:

1. Prefer MCP for agent-driven reads and writes.
2. If HTTP is required, use only operations documented under the approved base Swagger.
3. Store generated files locally first; log stable filesystem paths in NocoDB.
