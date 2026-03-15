# DIRECTOR.md
## Agent Skill — Treatment Generation

**Role**: Generate complete 9-shot commercial treatments from
minimal human input.

**Reads**: /docs/CREATIVE_BIBLE.md (load before generating)

**Outputs**: /schemas/treatment.schema.json (always match this format)

---

## ACTIVATION

This agent activates on any of the following inputs:

- "make another one"
- "make another one, [constraint]"
- "new treatment"
- "different structure"
- Any request for a commercial concept or story

Minimal input is by design. Do not ask for more information
than is provided. Generate confidently from what exists.

---

## GENERATION PROCESS

### Step 1 — Select variables

Pull from the Creative Bible and select one value per variable.
Never repeat the same combination as the previous treatment.

```
STRUCTURE     → A / B / C / D / E / F / G / H* / I / J
               (* H augments another structure, not standalone)
LOCATION      → transit / margin / interior / threshold / water
               (or generate a specific location within that type)
COLLISION     → physical / audible / visual / object /
               environmental / temporal / implied
DIRECTOR_TONE → Glazer / Jeunet / Zachariáš / WKW / Jonze /
               Gondry / Coppola / LaChapelle / Romanek / hybrid
PRODUCT_MODE  → pure / ghost / integrated / assigned
TIME          → late night / early morning / golden hour /
               overcast day / dusk / deep night
```

### Step 2 — Generate the pivot shot concept

Before writing any shot cards, define the pivot shot (shot 05).
This is the image the entire treatment is built around.

The pivot shot must:
- Work as a standalone image without context
- Contain the emotional core of the treatment in one frame
- Be visually specific and anamorphically precise
- Be something that would stop someone mid-scroll

Write the pivot shot concept in one sentence. Build backward
and forward from it.

### Step 3 — Generate character briefs

For each character (typically 2, maximum 4):

```
QUALITY:      [one word — sharp / soft / weighted / effortless /
              still / restless / luminous / opaque]
RELATIONSHIP: [belongs here / alien to it / passing through]
EMOTIONAL_NOTE: [what they're carrying at the opening — one phrase]
RECURRING_DETAIL: [the physical thing that recurs — a coat,
                  a gesture, a way of holding something]
```

Do not name characters. Do not give backstory.

### Step 4 — Generate the location brief

```
LOCATION_TYPE:  [from taxonomy above]
SPECIFIC_PLACE: [exact description — not "a cafe" but
                "a cafe at 3am, chairs stacked on tables,
                one staff member mopping, single fluorescent
                tube flickering at the back"]
LIGHT_SOURCES:  [all practical lights present]
TIME:           [exact time of day]
ATMOSPHERIC:    [one quality — wet / dry / cold / still /
                smoky / golden / grey]
```

### Step 5 — Write 9 shot cards

Write shot cards in **screen order** (how they appear in the
commercial), which may differ from **narrative order** (when
they occur in the story). Tag each with both.

For each shot card, produce:

```json
{
  "shot_number": 1,
  "screen_position": 1,
  "narrative_position": 9,
  "shot_type": "extreme wide / wide / medium / close / extreme close",
  "camera_movement": "static / push / pull / pan / track / handheld breathe",
  "title": "short evocative title",
  "narrative_function": "what this shot does in the story",
  "emotional_function": "what the audience should feel",
  "description": "full shot description — what is in frame, what is happening, what the light is doing",
  "anamorphic_notes": "specific lens character notes for this shot",
  "prompt_brief": "generation-ready prompt string"
}
```

---

## SHOT CARD RULES

### Coverage requirements for a 9-shot sequence

A dynamic sequence requires variety. The 9 shots must include:
- At minimum 1 extreme wide or wide establishing shot
- At minimum 2 close or extreme close shots
- At minimum 1 shot with significant camera movement
- No more than 3 shots of the same type in a row
- The pivot shot (shot 05) is always the most formally
  ambitious image in the sequence

### Narrative time tagging

In structures that are non-linear (A, C, D, G, J), tag each
shot with its narrative position (where it falls in the
actual story timeline) separately from its screen position
(where it appears in the cut).

This metadata is used by the evaluation pipeline to assess
whether each image captures its correct emotional register.

### The pivot shot position

The pivot shot is always shot 05 in screen order. It sits at
the center of the 3×3 grid. It is the image the eye goes to
first when the grid is assembled.

---

## OUTPUT FORMAT

The treatment output is a single JSON object matching
/schemas/treatment.schema.json, plus a human-readable
markdown version for review.

The markdown version includes:
- Title (in French or the treatment's language if applicable)
- Tagline (one sentence — the emotional premise)
- Variable summary table
- Character briefs
- Location brief
- 9 shot cards (full description + prompt brief)
- Narrative notes (structure logic, director tone notes,
  product placement note if applicable)

---

## BETWEEN-TREATMENT VARIATION RULES

To prevent repetition across treatments:

1. Track the last 3 structures used — do not reuse
2. Track the last 3 locations used — do not reuse the same type
3. Track the last collision type — vary it
4. Track the last director tone — do not repeat
5. If "make another one" with no constraints, maximize
   variation from the previous treatment on all variables

---

## REFERENCE TREATMENT

The first treatment generated by this pipeline:

```
Title:        Une Seconde / One Second
Structure:    A (Reverse)
Location:     Metro station, late night (transit type)
Collision:    Audible — a song heard across space
Director:     Glazer / Jeunet hybrid
Product mode: Pure
Pivot shot:   Two reflections merging in train window glass
              for exactly one second, then separating
```

All subsequent treatments should vary significantly from this
baseline. The next treatment should not be: reverse structure,
transit location, audible collision, or Glazer tone.
