# JUDGE.md
## Agent Skill — Image Evaluation

**Role**: Score generated images against the anamorphic
cinematic rubric. Produce structured score JSON for the
optimization and logging pipeline.

**Reads**: /docs/CREATIVE_BIBLE.md (load before evaluating)

**Input**: image file(s) + shot card JSON for context

**Output**: /schemas/score.schema.json

**Models**: Qwen2-VL (local, per-image) / Claude Vision (sequence grid)

---

## ACTIVATION

This agent activates when:
- 9 images have been generated and need evaluation
- A 3×3 grid PNG is ready for sequence evaluation
- The Optimizer needs failure analysis for a specific shot

## REFERENCE LIBRARY

**Before scoring any image**, check whether the reference
library exists at /reference-library/. If it does, load
2–3 reference images per axis from the relevant category
and include them in the VLM evaluation prompt as visual
anchors. Comparison-based scoring is significantly more
accurate than rubric-text-only scoring.

If the library doesn't exist yet, score from rubric text
alone and note `"reference_library": false` in output.

**Reference library version**: not yet built — run
REFERENCE_CURATOR.md first session before production use.

**How to load references per axis**:
```
Axis 1 (Anamorphic Fidelity) → /reference-library/anamorphic-qualities/oval-bokeh/
Axis 2 (Lighting Quality)    → /reference-library/lighting-quality/motivated-single-source/
Axis 3 (Color Grade)         → /reference-library/grade-reference/teal-amber-5/
Axis 4 (Subject Sharpness)   → no reference images — rubric text only
Axis 5 (Composition)         → /reference-library/shot-energy/diagonal-composition/
Axis 6 (Shot Energy)         → /reference-library/shot-energy/ + /motion-evidence/implied-motion/
```

Load score=5 AND score=3 examples where available.
The Judge needs to see both ends of the scale.

---

## TWO EVALUATION MODES

### Mode 1 — Per-Image Evaluation
**Model**: Qwen2-VL via Ollama (local, RTX 4090)
**Input**: Individual shot image + its shot card
**Scores**: 6 per-image axes (1–5 scale)

### Mode 2 — Sequence Evaluation
**Model**: Claude Vision
**Input**: 3×3 grid PNG + full treatment JSON
**Scores**: 5 sequence axes (1–5 scale)

Run both modes. A treatment only passes if all axes
in both modes meet threshold.

---

## PER-IMAGE SCORING RUBRIC

Score each axis 1–5. Half-points allowed (e.g. 3.5).
Use the anchor descriptions. Do not average — score each
axis independently.

### Axis 1 — Anamorphic Fidelity

**What to look for**: Does this image look like it was shot
on an anamorphic lens? Not just wide — specifically anamorphic.

| Score | Anchor |
|---|---|
| 5 | Oval/elliptical bokeh clearly visible, horizontal lens character present, chromatic aberration at edges, feels undeniably anamorphic |
| 4 | Oval bokeh present, lens character convincing, minor technical gaps |
| 3 | Some anamorphic qualities but mixed — bokeh partially circular, or character inconsistent |
| 2 | Minimal anamorphic quality — could be any lens |
| 1 | No anamorphic quality — circular bokeh, no lens character |

**Automatic fail** (score capped at 2): circular bokeh,
no depth of field, digital-looking sharpness throughout

---

### Axis 2 — Lighting Quality

**What to look for**: Is the light motivated, dramatic,
and intentional?

| Score | Anchor |
|---|---|
| 5 | Clearly motivated light source, high contrast ratio, deep shadows with retained detail, highlights controlled — feels like a DP lit this |
| 4 | Motivated lighting, good contrast, minor issues with shadow detail or highlight roll-off |
| 3 | Acceptable lighting but flat or unmotivated in places |
| 2 | Generic soft lighting — no apparent intent |
| 1 | Flat, unmotivated, overexposed or underexposed beyond recovery |

---

### Axis 3 — Color Grade

**What to look for**: Does the grade feel intentional?
Teal-amber split present and consistent?

| Score | Anchor |
|---|---|
| 5 | Intentional grade — teal shadows, warm highlights, lifted blacks, protected skin tones, feels like a DI grade |
| 4 | Grade present and intentional, minor inconsistencies |
| 3 | Some grade present but inconsistent or slightly off-palette |
| 2 | Minimal grade — looks ungraded or wrong-palette |
| 1 | No apparent grade, or grade actively wrong for the treatment |

---

### Axis 4 — Subject Sharpness / Image Quality

**What to look for**: Does the subject look real? Sharp where
it should be sharp? Does it read as photographic?

| Score | Anchor |
|---|---|
| 5 | Subject is crisply sharp, textures are resolved, skin reads as skin, no AI artifacts, no over-smoothing |
| 4 | Good sharpness, minor texture issues or slight AI tell |
| 3 | Subject sharp but artifacts visible, or texture unconvincing |
| 2 | Subject soft or clearly AI-generated aesthetic |
| 1 | Face doesn't read as a face, significant artifacts, broken anatomy |

**Note**: Film grain is not an artifact — it's correct.
Score sharpness on subject, not grain presence.

---

### Axis 5 — Composition

**What to look for**: Does the framing demonstrate intent?
Is the subject placed with purpose? Does the 2.39:1 ratio
feel used rather than just applied?

| Score | Anchor |
|---|---|
| 5 | Compositionally sophisticated — subject placement uses the wide ratio deliberately, foreground/midground/background all active, could be a frame-grab from a film |
| 4 | Clear compositional intent, good use of the frame, minor issues |
| 3 | Acceptable framing but generic — centered subject, standard angles |
| 2 | Framing appears unconsidered or technically incorrect |
| 1 | No compositional intent — subject placed arbitrarily, wasted frame |

**Note**: Rule of thirds is a floor, not a ceiling. Score 5
requires going beyond the obvious. The 2.39:1 ratio should
feel like an asset, not a crop.

---

### Axis 6 — Shot Energy / Dynamicism

**What to look for**: Is the image alive? Does it have
internal energy — tension between elements, directional
movement implied, a sense that something is happening or
about to happen? This is distinct from composition (where
things are placed) — this is about whether the image has force.

A static camera shot can score 5 here. A shot with camera
movement can score 1. Energy is not movement — it is tension.

**Motion evidence** is a primary sub-criterion of this axis.
Most shots should show at least one of these:

| Motion Type | Description | Score contribution |
|---|---|---|
| **Implied motion** | Subject frozen mid-action — mid-step, mid-gesture, hair caught between positions. The Cartier-Bresson decisive moment. No blur needed — the body position tells the story. | Primary target |
| **Subject motion blur** | Moving elements — coat edge, hair, swinging arms — slightly blurred against a sharper subject core or background | Strong positive |
| **Camera motion blur** | Background streaks from camera movement, subject relatively sharp | Strong positive |
| **Environmental motion** | Rain streaks, steam, passing train blur, crowd motion in background while subject is still | Positive |
| **Stillness by design** | Explicitly called for by the shot card (e.g. the empty platform in shot 01 — stillness IS the emotion). Must be flagged as intentional. | Neutral — not penalized |
| **Static without intent** | Centered posed subject, nothing moving, no implied motion, no tension — the stock photo tell | Heavy negative |

**Automatic score cap at 2**: subject is clearly posed for
the camera with no implied motion and no environmental
movement. This is the primary failure mode to detect and
avoid.

| Score | Anchor |
|---|---|
| 5 | The image has force — motion evidence present, lines and shapes pull against each other, the eye moves through the frame actively, there is a sense of imminence or aftermath |
| 4 | Good energy, motion evidence present, one element slightly inert |
| 3 | Some energy but the image is mostly static in feeling — technically correct but not alive |
| 2 | Flat — subject is present but posed, no motion evidence, no internal tension |
| 1 | Dead — a posed subject in an empty frame, nothing happening, the stock photo |

**What creates shot energy**:
- Implied movement — a figure mid-step, hair caught in motion,
  coat mid-swing, liquid mid-pour, a door half-open
- Diagonal lines — architecture, light shafts, shadow edges
  cutting across the frame at angles
- Depth tension — strong foreground element in tension with
  background, the eye pulled between layers
- Off-balance framing — the subject placed where the frame
  wants to pull away from them
- Environmental contrast — stillness against evidence of
  recent or imminent motion

**What kills shot energy**:
- Centered subject, symmetrical frame, nothing moving
- Subject looking directly at camera in a neutral pose
- Empty backgrounds with no depth
- All elements in the same focal plane
- Safe, predictable light with no shadow drama
- Posed stillness when the shot card calls for movement

---

## SEQUENCE SCORING RUBRIC

Evaluate the 3×3 grid as a whole. Sequence axes are numbered
7–11. Character consistency (Axis 9) is lower priority than
technical and dynamic axes — reference images largely handle
consistency; the pipeline prioritizes anamorphic quality and
sequence energy.

### Axis 7 — Sequence Dynamicism

**What to look for**: Does the grid as a whole read as a
dynamic, alive selection? Wide to close, tight to loose,
stillness to motion, exterior to interior? Not just variety
for its own sake — the rhythm should feel like a sequence
a DP and editor would be proud of.

| Score | Anchor |
|---|---|
| 5 | The grid is a masterclass in rhythm — shot sizes vary deliberately, energy levels modulate, the eye moves across all 9 images with genuine interest, no two adjacent cells feel the same |
| 4 | Strong variety and rhythm, one or two shots feeling slightly repetitive |
| 3 | Some variety but the sequence has dead zones — a run of similar shots that stall the rhythm |
| 2 | Most shots feel similar in size, energy, or angle |
| 1 | All 9 shots feel like variations on the same image |

**Minimum coverage requirements** (automatic fail if not met):
- At least 1 extreme wide or wide establishing shot
- At least 2 close or extreme close shots
- No more than 3 consecutive shots of the same type
- The pivot (center cell) must read as visually distinct
  from the 8 surrounding shots

---

### Axis 8 — Anamorphic Consistency

**What to look for**: Does the anamorphic character feel
unified across all 9 shots? Same lens vocabulary, same
bokeh shape, same grade philosophy?

| Score | Anchor |
|---|---|
| 5 | All 9 shots share unmistakable anamorphic DNA — oval bokeh consistent, lens character present throughout, grade unified |
| 4 | Mostly consistent, one or two shots slightly off the lens character |
| 3 | Anamorphic quality present but inconsistent — some shots feel spherical or digital |
| 2 | Significant inconsistency — the sequence looks like it was shot on multiple lenses |
| 1 | No apparent anamorphic consistency across the set |

---

### Axis 9 — Character Consistency
**Priority: lower** — reference images handle most of this.
Flag only significant failures.

**What to look for**: Does the same person look roughly like
the same person? This is not a pixel-match requirement —
it is a believability requirement.

| Score | Anchor |
|---|---|
| 5 | Character completely consistent across all shots |
| 4 | Mostly consistent, minor variation in face or clothing |
| 3 | Recognizably the same character but notable drift |
| 2 | Feels like different people despite same description |
| 1 | No consistency — different person in each shot |

**N/A**: Score N/A for shots with no character present.
If reference images were provided, a score below 3 should
trigger a note about reference image quality, not prompt failure.

---

### Axis 10 — World Continuity

**What to look for**: Does the lighting, color, atmosphere,
and time-of-day feel unified? Does the sequence exist in one
coherent world?

This combines what were previously separate Lighting
Continuity and Color Continuity axes — they fail and pass
together. A sequence with perfect grade but wrong light
temperature in two shots still fails this axis.

| Score | Anchor |
|---|---|
| 5 | The sequence inhabits one world completely — light source, color temperature, grade, atmosphere unified throughout |
| 4 | Mostly unified, one shot slightly off the world |
| 3 | World present but inconsistent — temperature drift, grade shift, or atmospheric inconsistency in multiple shots |
| 2 | Sequence feels like multiple locations or times despite description |
| 1 | No apparent world continuity |

---

### Axis 11 — Narrative Flow

**What to look for**: Does the sequence read as a story?
Does the eye move through the 9 shots with a sense of
movement through time and emotion? Does the pivot shot
land as the center of gravity?

| Score | Anchor |
|---|---|
| 5 | The grid tells a story — each shot leads to the next, the pivot is unmistakably the emotional center, the sequence has a beginning, middle, and end even without words |
| 4 | Mostly coherent narrative, one or two shots feel disconnected |
| 3 | Some narrative logic but the sequence feels assembled rather than designed |
| 2 | Images share a location and characters but feel unrelated |
| 1 | No narrative connection between shots |

---

## SCORE OUTPUT FORMAT

```json
{
  "treatment_id": "string",
  "evaluated_at": "ISO timestamp",
  "evaluation_model_per_image": "qwen2-vl-7b",
  "evaluation_model_sequence": "claude-sonnet-4-5",
  "per_image": [
    {
      "shot_number": 1,
      "is_pivot_shot": false,
      "anamorphic_fidelity": 4.5,
      "lighting_quality": 4.0,
      "color_grade": 3.5,
      "subject_sharpness": 4.0,
      "composition": 4.0,
      "shot_energy": 3.5,
      "pivot_shot_score": null,
      "per_image_average": 4.0,
      "failure_axes": ["color_grade", "shot_energy"],
      "notes": "strong oval bokeh, grade slightly cool, image static — centered subject with no implied movement"
    }
  ],
  "sequence": {
    "sequence_dynamicism": 4.0,
    "anamorphic_consistency": 4.5,
    "character_consistency": 3.5,
    "world_continuity": 4.0,
    "narrative_flow": 3.5,
    "sequence_average": 3.9,
    "minimum_coverage_met": true,
    "notes": ""
  },
  "overall": {
    "pass": false,
    "blocking_axes": ["color_grade", "shot_energy", "narrative_flow"],
    "top_failure": "shot_energy",
    "recommended_action": "optimizer",
    "training_set_eligible": false,
    "pivot_shot_eligible": false
  }
}
```

---

## ROUTING LOGIC

After scoring, the Judge outputs a routing recommendation.

**Hard thresholds** — these override everything:
- Anamorphic Fidelity < 3.0 on any shot → `regenerate`
  regardless of other scores. This is the non-negotiable axis.
- Minimum coverage not met → `regenerate`. A sequence without
  shot variety cannot be fixed by the Optimizer.

**Standard routing**:

| Condition | Action |
|---|---|
| All axes ≥ 4.5 | `training_set_eligible: true`, `pivot_shot_eligible: true` |
| All axes ≥ 4.0 | `pass: true`, log to NocoDB |
| Any axis 3.0–3.9 | `recommended_action: optimizer` |
| Any axis < 3.0 | `recommended_action: regenerate` |
| Any axis < 2.0 | `recommended_action: human_review` |

**Character consistency exception**: Character consistency
scoring < 3.0 routes to `human_review` rather than `regenerate`
— this indicates a reference image quality issue, not a
prompt failure. Flag for manual reference image improvement.

**Priority weighting for Optimizer routing** — when multiple
axes fail, the Optimizer targets in this order:
1. Anamorphic Fidelity
2. Shot Energy / Dynamicism
3. Lighting Quality
4. Subject Sharpness
5. Color Grade
6. Composition
7. (Sequence) Anamorphic Consistency
8. (Sequence) World Continuity
9. (Sequence) Sequence Dynamicism
10. (Sequence) Narrative Flow
11. (Sequence) Character Consistency

---

## JUDGE SYSTEM PROMPT (for VLM calls)

When calling Qwen2-VL or Claude Vision, use this system prompt:

```
You are evaluating AI-generated images for a cinematic anamorphic
commercial pipeline. Your evaluations must be precise, consistent,
and calibrated to the rubric. Score each axis independently.
Do not average — a high score on one axis does not compensate
for a low score on another. Be honest: a score of 5 should be
rare and genuinely exceptional. A score of 3 is acceptable but
not pipeline-ready. Output only valid JSON matching the schema.
Do not add explanatory text outside the JSON.
```

---

## PIVOT SHOT SPECIAL EVALUATION

When evaluating shot 05 (the pivot shot), add one additional
question to the evaluation prompt:

```
PIVOT SHOT TEST: Would this image stop someone mid-scroll?
Score 1 (no — it is visually generic) to 5 (yes — it is
visually arresting and specific). This score does not affect
the routing threshold but is logged separately for training
set curation.
```

Pivot shot score is logged as `pivot_shot_score` in the output.
Any pivot shot with `pivot_shot_score` ≥ 4.5 AND all per-image
axes ≥ 4.0 is added to the pivot shot archive regardless of
sequence scores.
