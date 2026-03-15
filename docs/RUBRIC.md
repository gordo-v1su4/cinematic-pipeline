# EVALUATION RUBRIC
## Cinematic Commercial Pipeline — Scoring Reference

**Benchmark image**: Gas station 3×3 grid (benchmark_gas_station_3x3.png)
**Composite benchmark score**: ~4.7
**Pass threshold**: 4.0 all axes
**Training set threshold**: 4.5 all axes

---

## SCORE SCALE

| Score | Meaning |
|---|---|
| 5.0 | Exceptional — benchmark level or better |
| 4.5 | Strong — training set eligible |
| 4.0 | Pass — approved for sequence |
| 3.5 | Marginal — route to Optimizer or Expander |
| 3.0 | Fail — regenerate required |
| 2.0 | Hard fail — prompt failure |
| 1.0 | Complete failure — human review |

Half-points allowed (3.5, 4.5 etc). Score each axis independently — do not average to pass.

---

## PER-IMAGE AXES
### Scored individually on each of the 9 cells

---

### AXIS 1 — Anamorphic Fidelity
**What to look for**: Oval/elliptical bokeh, horizontal lens flare, chromatic aberration at frame edges, shallow depth of field that reads as anamorphic — not just shallow, specifically anamorphic.

| Score | Anchor |
|---|---|
| 5 | Oval bokeh clearly visible, horizontal flare present, chromatic aberration at edges, feels undeniably shot on anamorphic glass |
| 4 | Oval bokeh present, lens character convincing, minor gaps |
| 3 | Some anamorphic quality but mixed — partially circular bokeh or inconsistent character |
| 2 | Minimal — could be any lens |
| 1 | No anamorphic quality — circular bokeh, no lens character |

**Benchmark**: Gas station grid scores 4.5 — strong oval bokeh on background columns, chromatic aberration on the extreme close (top-right eye cell), horizontal flare from canopy fixtures.

**Hard override**: Any shot scoring < 3.0 → regenerate the full sequence regardless of other axes.

**Automatic cap at 2.0**: Circular bokeh present, no depth of field, digital-looking sharpness throughout.

---

### AXIS 2 — Lighting Quality
**What to look for**: Is the light motivated by a real-world source? Is there drama in the contrast ratio? Do shadows retain detail while highlights stay controlled?

| Score | Anchor |
|---|---|
| 5 | Clearly motivated practical source, high contrast ratio, deep shadows with retained detail, highlights controlled — a DP lit this |
| 4 | Motivated lighting, good contrast, minor issues with shadow detail or highlight roll-off |
| 3 | Acceptable but flat or partially unmotivated |
| 2 | Generic soft lighting — no apparent intent |
| 1 | Flat, unmotivated, over or underexposed |

**Benchmark**: Scores 5.0 — the green BP canopy fluorescents are the single motivated source for every shot. Cold, institutional, slightly wrong. Every cell uses the same source differently.

---

### AXIS 3 — Color Grade
**What to look for**: Teal-amber split, lifted (not crushed) blacks, desaturated overall, protected skin tones. Does it feel like a DI grade or like a raw/ungraded image?

| Score | Anchor |
|---|---|
| 5 | Intentional teal-amber grade, lifted blacks, protected skin, desaturated — DI grade quality |
| 4 | Grade present and intentional, minor inconsistencies |
| 3 | Some grade but inconsistent or slightly off-palette |
| 2 | Ungraded or wrong-palette |
| 1 | No grade, or grade actively wrong for the treatment |

**Benchmark**: Scores 4.5 — heavy teal push throughout, consistent across all 9 cells, the green canopy feeds the grade naturally.

**Default grade for all treatments**: `teal shadows, warm amber highlights, desaturated overall, lifted blacks, medium film grain`

---

### AXIS 4 — Subject Sharpness / Image Quality
**What to look for**: Does the subject look real and photographic? Is texture resolved? No AI over-smoothing, no broken anatomy, no artifacts. Film grain is correct — not an artifact.

| Score | Anchor |
|---|---|
| 5 | Subject crisply sharp, texture resolved, skin reads as skin, no artifacts, no over-smoothing |
| 4 | Good sharpness, minor texture issues or slight AI tell |
| 3 | Artifacts visible, or texture unconvincing |
| 2 | Subject soft or clearly AI-generated aesthetic |
| 1 | Face doesn't read as a face, significant artifacts, broken anatomy |

**Benchmark**: Scores 4.5 — the extreme close eye cell is pore-level sharp and exceptional. Tattoo detail crisp across character shots.

**Note**: Score N/A for non-character shots (establishing, architectural, environmental). Do not penalize for absence of subject.

---

### AXIS 5 — Composition
**What to look for**: Does the framing demonstrate intent? Is the 2.39:1 ratio used as an asset — subjects placed with awareness of the wide frame — or just applied to a centered subject?

| Score | Anchor |
|---|---|
| 5 | Compositionally sophisticated — frame used deliberately, foreground/midground/background all active, could be a film frame |
| 4 | Clear compositional intent, good frame use, minor issues |
| 3 | Acceptable but generic — centered subject, standard angle |
| 2 | Framing unconsidered or technically incorrect |
| 1 | No compositional intent — subject arbitrarily placed |

**Benchmark**: Scores 4.5 — off-center placement throughout, the architectural canopy ceiling shot (middle-right) boldly breaks the character-forward pattern.

**Rule of thirds is the floor, not the ceiling.** Score 5 requires going beyond the obvious composition.

---

### AXIS 6 — Shot Energy / Dynamicism
**What to look for**: Is the image alive? Does it have internal energy — tension, implied motion, directionality, imminence? A static camera can score 5. A posed subject in an empty frame scores 1.

**Motion evidence types (at least one required per shot, unless flagged as intentional stillness):**

| Type | Description |
|---|---|
| Implied motion | Mid-step, mid-gesture, hair caught between positions — no blur needed, body position tells the story |
| Subject motion blur | Moving coat edge, hair, arms — slight blur on moving elements |
| Camera motion blur | Background streaks from camera movement, subject relatively sharp |
| Environmental motion | Rain, steam, smoke, passing blur, crowd motion |
| Intentional stillness | Explicitly called for in shot card — e.g. empty establishing shot. Must be flagged. |

| Score | Anchor |
|---|---|
| 5 | Motion evidence present, lines and shapes pull against each other, sense of imminence or aftermath — the image has force |
| 4 | Good energy, motion evidence present, one element slightly inert |
| 3 | Some energy but mostly static in feeling |
| 2 | Subject posed, no motion evidence, no internal tension — the stock photo |
| 1 | Posed subject, empty frame, nothing happening |

**Benchmark**: Scores 5.0 — breath/smoke mid-exhale (bottom-left), tattooed hand raised mid-gesture (bottom-center), head tilted back looking up (middle-left), cracked glass pivot with light refraction energy (bottom-center).

**Automatic cap at 2.0**: Subject is clearly posed for camera with no implied motion and no environmental movement.

**Routing rule**: Shot energy < 3.5 with other axes passing → Expander (not Optimizer). Text prompts don't fix energy failures. Visual reference expansion does.

---

## SEQUENCE AXES
### Scored on the assembled 3×3 grid as a whole

---

### AXIS 7 — Sequence Dynamicism
**What to look for**: Does the grid read as a dynamic, alive selection of shots? Shot sizes should vary — wide to close, static to moving, loose to tight. The pivot (center cell) must read as visually distinct from its 8 neighbors.

**Minimum coverage requirements** (automatic sequence fail if not met):
- At least 1 extreme wide or wide establishing shot
- At least 2 close or extreme close shots
- At least 1 non-character shot (architectural, environmental, abstract)
- No more than 3 consecutive cells of the same shot type
- Center cell (pivot) is visually distinct from all surrounding cells

| Score | Anchor |
|---|---|
| 5 | Perfect rhythm — shot sizes vary deliberately, energy modulates, no two adjacent cells feel the same, pivot is unmistakably the center of gravity |
| 4 | Strong variety with minor repetition |
| 3 | Some variety but dead zones — a run of similar shots |
| 2 | Most shots feel similar |
| 1 | All 9 shots feel like variations on one image |

**Benchmark**: Scores 5.0 — extreme wide (top-left), medium full (top-center), extreme close (top-right), profile close (middle-left), insert hand (middle-center?), architectural (middle-right), medium environmental (bottom-left), abstract pivot (bottom-center), three-quarter (bottom-right). No two adjacent cells the same.

---

### AXIS 8 — Anamorphic Consistency
**What to look for**: Does the anamorphic character feel unified across all 9 shots? Same lens vocabulary, same bokeh shape, same grade philosophy. The sequence should feel like it was shot on one lens by one DP.

| Score | Anchor |
|---|---|
| 5 | All 9 cells share unmistakable anamorphic DNA — oval bokeh consistent, lens character present throughout, grade unified |
| 4 | Mostly consistent, one or two cells slightly off |
| 3 | Anamorphic quality present but inconsistent — some cells feel spherical |
| 2 | Sequence looks like multiple lenses |
| 1 | No anamorphic consistency |

**Benchmark**: Scores 5.0 — one location, one light source, teal grade consistent throughout. The green canopy is the unifying element.

---

### AXIS 9 — Character Consistency
**Priority: lower.** Reference images handle most of this. Flag only significant failures.

| Score | Anchor |
|---|---|
| 5 | Character completely consistent across all shots |
| 4 | Mostly consistent, minor face/clothing variation |
| 3 | Recognizably same character but notable drift |
| 2 | Feels like different people |
| 1 | No consistency |

**Benchmark**: Scores 4.5 — same bald tattooed male, same black hoodie, consistent across all character cells.

**Routing rule**: Score < 3.0 → human review, not regenerate. Reference image quality issue, not a prompt failure.

**Score N/A** for sequences with no character.

---

### AXIS 10 — World Continuity
**What to look for**: Does the lighting, color temperature, atmosphere, and time-of-day feel unified across all 9 cells? Combines what were previously separate Lighting Continuity and Color Continuity axes — they fail and pass together.

| Score | Anchor |
|---|---|
| 5 | One world completely — light source, color temperature, grade, atmosphere unified throughout |
| 4 | Mostly unified, one cell slightly off |
| 3 | World present but inconsistent — temperature drift, grade shift in multiple cells |
| 2 | Sequence feels like multiple locations or times |
| 1 | No world continuity |

**Benchmark**: Scores 5.0 — single location, single light source, single time of night. Impossible to feel like anything other than one world.

**Design principle**: Use one location with one practical light source whenever possible. It is the single most powerful tool for world continuity.

---

### AXIS 11 — Narrative Flow
**What to look for**: Does the sequence read as a story? Does the eye move through the 9 cells with a sense of emotional movement? Does the pivot (center cell) land as the emotional center of gravity?

| Score | Anchor |
|---|---|
| 5 | The grid tells a story — each cell leads to the next, the pivot is unmistakably the emotional center, there is a beginning, middle, and end |
| 4 | Mostly coherent, one or two cells feel disconnected |
| 3 | Some narrative logic but assembled rather than designed |
| 2 | Shared location and character but cells feel unrelated |
| 1 | No narrative connection |

**Benchmark**: Scores 4.5 — the cracked glass pivot is unmistakably the emotional center. The sequence moves from empty world → character arrives → intimacy → abstraction → environment → character again.

---

## ROUTING DECISION TREE

```
Any axis < 2.0
    → Human review — do not regenerate automatically

Any axis < 3.0 (except character consistency)
    → Regenerate full sequence

Anamorphic fidelity < 3.0 on any shot
    → Regenerate (hard override — regardless of other axes)

Minimum coverage not met
    → Regenerate (hard override)

Shot energy < 3.5, all other axes ≥ 4.0
    → Expander (4 NB Pro variants using image as reference)
    → Do NOT route to Optimizer — text prompts don't fix energy

Composition < 3.5, all other axes ≥ 4.0
    → Expander (Variation 1: dynamic framing, Variation 3: through something)

Anamorphic / lighting / grade / sharpness 3.0–3.9
    → Optimizer (text prompt revision, one axis at a time)

Character consistency < 3.0
    → Human review (reference image quality issue)

All per-image axes ≥ 4.0 AND all sequence axes ≥ 4.0
    → Approved — log to NocoDB

All axes ≥ 4.5
    → Training set eligible + pivot archive eligible
```

---

## OPTIMIZER AXIS PRIORITY ORDER

When multiple axes fail, target in this order:
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
11. (Sequence) Character Consistency — lowest priority

**Never change two axes at once.** One revision, one regeneration, one re-score.

---

## BENCHMARK CELL REFERENCE

| Cell | Position | Shot type | Key qualities |
|---|---|---|---|
| 01 | Top-left | Extreme wide, no character | Empty world, wet floor reflection, oval bokeh on signal lights |
| 02 | Top-center | Medium full, character | Station light, full body, implied weight and stance |
| 03 | Top-right | Extreme close, eye | Pore-level sharpness, chromatic aberration, intense gaze |
| 04 | Middle-left | Close profile, head tilted | Head tilted back mid-movement, neck tattoos, oval bokeh on columns |
| 05 | **Center — PIVOT** | Insert abstract, cracked glass | "Through something" — glass fragments, light refraction, face behind glass |
| 06 | Middle-right | Wide, no character, architectural | Canopy ceiling, lights, geometry — the non-character breathing shot |
| 07 | Bottom-left | Medium, environmental motion | Breath/smoke mid-exhale, environmental motion evidence, character facing up |
| 08 | Bottom-center | Insert, hand mid-gesture | Tattooed hand raised mid-gesture — implied motion, texture detail |
| 09 | Bottom-right | Medium three-quarter | Character and station, three-quarter angle, consistent world |

**The benchmark rule**: if your generated grid reads like a lesser version of this image, it hasn't passed yet.

---

*Version 1.0 — March 2026*
*Referenced by: JUDGE.md, EXPANDER.md, OPTIMIZER.md*
*Benchmark image: benchmark_gas_station_3x3.png*
