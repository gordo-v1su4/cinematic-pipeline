# N8N_WORKFLOW.md
## Pipeline Automation — n8n Self-Hosted

**n8n instance**: https://n8n.v1su4.dev
**NocoDB instance**: https://nocodb.v1su4.dev

This document describes the n8n workflow architecture for the
cinematic commercial pipeline. Each workflow is a separate n8n
flow. They are triggered in sequence by webhooks or manual runs.

> Project rule: for NocoDB access, use only the authenticated operations exposed by [`docs/NOCODB_SCHEMA.md`](./NOCODB_SCHEMA.md) for base `pp23qqevp2igvcy`, or the project MCP server. Do not add new `api/v2/tables/...` integrations to this repo.

---

## WORKFLOW OVERVIEW

```
WORKFLOW 1 — Treatment Intake
  Trigger: Webhook or manual
  Input: treatment JSON + prompts JSON
  Output: NocoDB record created, generation triggered

WORKFLOW 2 — Image Generation
  Trigger: Called by Workflow 1
  Input: prompts.json path + treatment_id
  Output: 9 images generated, paths logged to NocoDB

WORKFLOW 3 — Grid Assembly
  Trigger: Called by Workflow 2 when all 9 shots complete
  Input: 9 image paths
  Output: 3×3 PNG assembled, path logged

WORKFLOW 4 — Judge Evaluation
  Trigger: Called by Workflow 3
  Input: 9 image paths + grid PNG + treatment JSON
  Output: scores logged to NocoDB, routing decision made

WORKFLOW 5 — Optimizer Loop
  Trigger: routing = "optimizer" in NocoDB Shots table
  Input: failing shot + score JSON
  Output: revised prompt → triggers single-shot regeneration

WORKFLOW 6 — Expander Loop
  Trigger: routing = "expander" in NocoDB Shots table
  Input: failing shot image + score JSON
  Output: 4 NB Pro variants → re-scored → best replaces original

WORKFLOW 7 — Training Set Export
  Trigger: Manual or scheduled
  Input: NocoDB query for training_set_eligible = true
  Output: Curated image set copied to /training-set/
```

---

## WORKFLOW 1 — Treatment Intake

**Purpose**: Register a new treatment in NocoDB and kick off generation.

**Trigger options**:
- Webhook: POST to `https://n8n.v1su4.dev/webhook/new-treatment`
- Manual: paste treatment_id into n8n form node

**Nodes**:

```
[Webhook / Manual Trigger]
    → [Read File: /treatments/{treatment_id}.json]
    → [Read File: /treatments/{treatment_id}_prompts.json]
    → [HTTP Request: POST approved NocoDB Treatments operation]
         Resolve the exact operation from the authenticated base Swagger
         at /api/v3/meta/bases/pp23qqevp2igvcy/swagger
         Body: {
           treatment_id, title, tagline, structure, structure_name,
           collision, director_tone, product_mode, location_type,
           status: "generating",
           treatment_json_path, prompts_json_path
         }
    → [Set: store NocoDB record ID from response]
    → [Execute Workflow: Workflow 2 — Image Generation]
         Pass: treatment_id, prompts.json content
```

---

## WORKFLOW 2 — Image Generation

**Purpose**: Generate all 9 shots via ComfyUI / Nano Banana Pro API.

**Note on generation method**:
NB Pro runs via API key through ComfyUI Partner Nodes.
The ComfyUI server is on your local network — n8n calls
the ComfyUI API endpoint to queue workflows.

**ComfyUI API endpoint**:
```
POST http://localhost:8188/prompt
Body: { "prompt": {comfyui_workflow_json} }
```

**Nodes**:

```
[Execute Workflow Trigger]
    → [Function: Parse prompts.json → array of 9 shot objects]
    → [Split In Batches: process shots 1-4 together, 5 alone, 6-9 together]
         (Shot 5 — pivot — gets 8 variants, others get 3)

    For each shot:
    → [Function: Build ComfyUI workflow JSON]
         Inject: prompt string, negative prompt, aspect ratio 21:9,
         model: nano-banana-pro, batch_size: 3 (or 8 for pivot)
         character_references: if provided, attach as reference images

    → [HTTP Request: POST ComfyUI /prompt]
         http://localhost:8188/prompt
         Body: { "prompt": {workflow_json} }

    → [Wait: poll ComfyUI /history/{prompt_id} until complete]
         Poll interval: 15 seconds
         Max wait: 5 minutes

    → [Function: Extract output image paths from ComfyUI history]

    → [HTTP Request: POST approved NocoDB Shots operation]
         For each generated image:
         {
           shot_id: "{treatment_id}_s{shot_number}",
           treatment_id,
           shot_number,
           is_pivot_shot,
           prompt,
           image_path,
           model_used: "nano-banana-pro",
           batch_variant: selected_variant_number
         }

    → [Merge: wait for all 9 shots complete]
    → [Execute Workflow: Workflow 3 — Grid Assembly]
         Pass: treatment_id, array of 9 image paths
```

**Shot selection logic** (for pivot shot with 8 variants):
- Auto-select the variant with highest visual variance from others
- Or: hold all 8, send to Judge, pick highest scoring
- Recommended: send all 8 to Judge, select best on Shot Energy axis

---

## WORKFLOW 3 — Grid Assembly

**Purpose**: Assemble 9 individual images into a 3×3 PNG grid.

**Nodes**:

```
[Execute Workflow Trigger]
    → [Function: Validate all 9 image paths exist]
    → [Execute Command: Python grid assembly script]
         python3 /scripts/assemble_grid.py
           --images {comma-separated image paths, in screen order}
           --output /outputs/grids/{treatment_id}_grid.png
           --size 3x3
           --cell-size 1280x534
           (1280x534 = 2.39:1 ratio per cell, 3840x1602 total)

    → [HTTP Request: POST approved NocoDB Sequences operation]
         Resolve the exact operation from the authenticated base Swagger
         {
           sequence_id: "{treatment_id}_v1",
           treatment_id,
           grid_image_path: "/outputs/grids/{treatment_id}_grid.png",
           evaluated_at: null
         }

    → [Execute Workflow: Workflow 4 — Judge Evaluation]
         Pass: treatment_id, grid_image_path, 9 individual image paths
```

**Grid assembly Python script** (save at /scripts/assemble_grid.py):
```python
from PIL import Image
import sys, os

def assemble_grid(image_paths, output_path, cell_w=1280, cell_h=534):
    cols, rows = 3, 3
    grid = Image.new('RGB', (cell_w * cols, cell_h * rows))
    for i, path in enumerate(image_paths):
        img = Image.open(path).resize((cell_w, cell_h), Image.LANCZOS)
        x = (i % cols) * cell_w
        y = (i // cols) * cell_h
        grid.paste(img, (x, y))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    grid.save(output_path, 'PNG', quality=95)
    print(f"Grid saved: {output_path}")
```

---

## WORKFLOW 4 — Judge Evaluation

**Purpose**: Score all images and the grid. Route based on results.

**Two evaluation calls**:

### Call A — Per-image scoring (Qwen2-VL via Ollama)

```
For each of the 9 shots:
→ [HTTP Request: POST Ollama]
     POST http://localhost:11434/api/generate
     Body: {
       model: "qwen2-vl",
       prompt: {judge_prompt_per_image},
       images: [base64_encoded_image],
       stream: false
     }
→ [Function: Parse JSON response → extract 6 axis scores]
→ [HTTP Request: PATCH NocoDB Shots]
     Update: anamorphic_fidelity, lighting_quality, color_grade,
     subject_sharpness, composition, shot_energy,
     per_image_average, failure_axes, routing
```

### Call B — Sequence scoring (Claude Vision via API)

```
→ [Function: Base64 encode grid PNG]
→ [HTTP Request: POST Anthropic API]
     POST https://api.anthropic.com/v1/messages
     Headers: x-api-key: {ANTHROPIC_API_KEY}
     Body: {
       model: "claude-sonnet-4-6",
       max_tokens: 1000,
       messages: [{
         role: "user",
         content: [
           { type: "image", source: { type: "base64", data: {grid_b64} }},
           { type: "text", text: {judge_sequence_prompt} }
         ]
       }]
     }
→ [Function: Parse JSON response → extract 5 sequence scores]
→ [HTTP Request: PATCH NocoDB Sequences]
     Update: all sequence axes, sequence_pass, recommended_action
```

### Routing node

```
→ [Switch: based on overall routing decision]
     routing = "approve"   → [HTTP Request: PATCH treatment status = approved]
     routing = "optimizer" → [Execute Workflow 5]
     routing = "expander"  → [Execute Workflow 6]
     routing = "regenerate"→ [Execute Workflow 2 for failing shots only]
     routing = "human-review" → [Send notification: Slack/email]
```

---

## WORKFLOW 5 — Optimizer Loop

**Purpose**: Fix failing shots via revised text prompts.
Handles: anamorphic_fidelity, lighting_quality, color_grade,
subject_sharpness failures.

```
[Execute Workflow Trigger]
    → [HTTP Request: GET NocoDB — fetch failing shot record]
    → [Function: Build Optimizer prompt]
         Input: current prompt + failure_axes + axis scores
         Logic: OPTIMIZER.md diagnosis guide
         Output: revised prompt string

    → [HTTP Request: POST ComfyUI — regenerate single shot]
         Same as Workflow 2 but single shot, batch_size 3

    → [Wait: poll until complete]
    → [Execute Workflow 4 — Judge: single shot only]
    → [Function: Compare before/after scores]
         If improved → PATCH NocoDB shot with new image + scores
         If not improved → increment optimizer_cycles counter
         If cycles ≥ 5 → route to human-review
```

---

## WORKFLOW 6 — Expander Loop

**Purpose**: Improve Shot Energy and Composition via NB Pro
reference image expansion.

```
[Execute Workflow Trigger]
    → [HTTP Request: GET NocoDB — fetch failing shot + image path]
    → [Function: Base64 encode existing shot image]
    → [Function: Build expansion prompt — 4 variations]
         Uses EXPANDER.md variation templates

    → [HTTP Request: POST NB Pro API via ComfyUI]
         Reference input: base64 existing image
         Character references: if available
         Prompt: expansion prompt with 4 variations
         Output: 4 image files

    → [For each of 4 variants:]
         → [Execute Judge: per-image only, Axes 5+6]
         → [Log variant scores]

    → [Function: Select best variant]
         Highest composite on composition + shot_energy
         While maintaining other axes ≥ 4.0

    → [If best variant improves over original:]
         → [PATCH NocoDB shot: new image_path, updated scores,
            expander_used: true, expansion_type]
         → [Re-run Workflow 3 grid assembly with updated shot]
         → [Re-run Workflow 4 sequence evaluation]

    → [If no improvement after 2 rounds:]
         → [PATCH NocoDB shot: routing = human-review]
         → [Send notification]
```

---

## WORKFLOW 7 — Training Set Export

**Purpose**: Periodic export of approved high-scoring images
to the LoRA training set.

**Trigger**: Manual or weekly schedule

```
[Schedule / Manual Trigger]
    → [HTTP Request: GET NocoDB Shots]
         Filter: training_set_eligible = true
         AND has not been exported yet
         (add exported_to_training_set checkbox field)

    → [For each eligible shot:]
         → [Execute Command: copy image to /training-set/]
              cp {image_path} /training-set/{shot_id}.jpg

    → [HTTP Request: GET NocoDB Shots]
         Filter: pivot_archive_eligible = true

    → [For each eligible pivot shot:]
         → [Execute Command: copy to /training-set/pivots/]

    → [Function: Generate training manifest]
         JSON file listing all images with their captions
         (treatment_id, prompt, axes scores, shot type)
         Save as /training-set/manifest.json

    → [Log: count of images exported this run]
```

---

## CREDENTIALS NEEDED IN n8n

Set these up in n8n Settings → Credentials:

```
NOCODB_SWAGGER_URL   → https://nocodb.v1su4.dev/api/v3/meta/bases/pp23qqevp2igvcy/swagger
NOCODB_MCP_ENDPOINT  → https://nocodb.v1su4.dev/mcp/nc6qdr2naw76ymg1
NOCODB_MCP_TOKEN     → MCP header auth: "xc-mcp-token: {token}"
ANTHROPIC_API_KEY    → HTTP Header Auth: "x-api-key: {key}"
COMFYUI_BASE_URL     → http://localhost:8188 (or your ComfyUI host)
OLLAMA_BASE_URL      → http://localhost:11434
NB_PRO_API_KEY       → For direct Nano Banana Pro calls if not via ComfyUI
```

---

## FIRST RUN CHECKLIST

Before running the pipeline end-to-end:

```
[ ] NocoDB tables created (Treatments, Shots, Sequences)
[ ] Base ID confirmed as pp23qqevp2igvcy
[ ] Project MCP token created and stored locally
[ ] n8n HTTP calls mapped from the approved base Swagger
[ ] ComfyUI running with NB Pro node installed
[ ] Ollama running with qwen2-vl pulled
[ ] /scripts/assemble_grid.py created (Pillow installed)
[ ] /outputs/shots/ and /outputs/grids/ directories exist
[ ] /training-set/pivots/ directory exists
[ ] Reference library: /reference-library/ populated (optional but recommended)
[ ] Anthropic API key stored in n8n for sequence evaluation
[ ] Test: POST a single treatment via Workflow 1 trigger
```

---

## NOTES ON COMFYUI API

ComfyUI's API accepts workflow JSON. For NB Pro calls, the
workflow JSON is the ComfyUI graph with the NB Pro Partner Node.

**Get your ComfyUI workflow JSON**:
1. Build the NB Pro workflow in ComfyUI UI
2. Click Save (API format) — this exports the workflow as JSON
3. This JSON becomes the template that n8n injects prompts into

**Key fields to inject per generation**:
- Prompt text: find the text node ID in the workflow JSON
- Negative prompt: find its node ID
- Batch size: find the seed/batch node
- Reference images: find the image input node IDs

The workflow JSON is large but the injection points are consistent.
Build one canonical NB Pro workflow in ComfyUI, export it,
and use it as a template in all n8n generation calls.
