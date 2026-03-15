# EXPANDER.md
## Agent Skill — Shot Expansion via NB Pro Reference Image

**Role**: Take a generated image that passes technically but
scores low on Shot Energy or Composition, feed it back into
Nano Banana Pro as a reference image, and return 4 more
dynamic variations of the same moment.

**Trigger**: Judge scores Shot Energy < 3.5 OR Composition < 3.5
on an otherwise passing shot (all other axes ≥ 4.0).

**Input**: Single image file + its shot card + its score JSON

**Output**: 4 new image variants → re-score → best replaces
original in the grid

---

## WHEN TO USE

The Expander is specifically for the **Shot Energy** and
**Composition** failure modes — not for anamorphic fidelity,
lighting, or grade failures (those go to the Optimizer with
revised text prompts).

The distinction matters:
- Anamorphic fidelity / lighting / grade failures → **Optimizer**
  (fix the prompt language, regenerate from scratch)
- Shot Energy / Composition failures → **Expander**
  (the image is technically good, it's just not alive —
  show NB Pro what you have and ask for more dynamic versions)

The Expander works because NB Pro can take an existing image
as a reference and generate variations that maintain the
scene's core elements while shifting the energy, framing,
or motion evidence. This is more effective than trying to
describe "make it more dynamic" in text alone.

---

## THE EXPANSION PROMPT PATTERN

Send NB Pro:
1. The existing generated image as reference input
2. The character reference images (if available)
3. The expansion prompt below

### Expansion prompt template

```
Reference image provided — this is the moment and the scene.
Maintain: [character description], [location], [lighting direction],
[color grade: teal shadows warm amber highlights desaturated].

Generate 4 variations of this same moment that are more
cinematically alive. Each variation should differ in:

VARIATION 1 — More dynamic framing
  Shift the composition — stronger diagonal, more aggressive
  off-center placement, foreground element added or emphasized.
  Same moment, different angle or distance.

VARIATION 2 — Motion evidence added
  Introduce implied motion or actual motion blur to one or
  more elements. Options: [select from shot card context —
  mid-step / coat hem swinging / hair caught mid-movement /
  environmental motion: rain / steam / passing blur].
  Subject should feel caught mid-action, not posed.

VARIATION 3 — Through something
  The camera is now seeing this through an element —
  through glass / through a doorway / through crowd /
  reflected in a surface. Same moment, new depth layer.

VARIATION 4 — More compressed / more intimate
  Push closer or find a more extreme angle. The anamorphic
  lens compression should be more aggressive. The depth
  of field more extreme.

All 4 variations must maintain:
- Anamorphic 2.39:1 letterbox
- Oval elliptical bokeh
- [grade string from treatment]
- Film grain
- The emotional register of the shot card: [paste emotional_function]
```

---

## VARIATION 3 — "THROUGH SOMETHING"

This is the most powerful variation type and deserves
specific attention. It addresses both Shot Energy and
Composition simultaneously by adding a foreground depth
layer that creates tension.

Options by location type:

**Transit (metro, station)**:
- Through the train window glass (reflections visible)
- Through a turnstile bar
- Through a crowd of blurred commuters
- Reflected in the wet platform floor

**Margin (late-night street)**:
- Through a rain-streaked window
- Through a chain-link fence
- Reflected in a puddle or wet pavement
- Through a doorway or archway

**Interior**:
- Through a doorway with foreground door frame
- Reflected in a mirror
- Through hanging fabric or a curtain edge
- Through a glass partition

**Water / threshold**:
- Through falling rain
- Reflected in moving water
- Through mist or steam

The "through something" variation almost always produces
higher Shot Energy scores because the foreground element
creates immediate depth tension and the frame has to
work harder.

---

## RE-SCORING PROTOCOL

After generating 4 variants:

1. Run all 4 through the Judge per-image evaluation
   (Axes 1–6 only — sequence evaluation waits for the
   final grid)

2. Select the variant with the highest composite score
   on Axes 5 (Composition) and 6 (Shot Energy) while
   maintaining ≥ 4.0 on Axes 1–4

3. If no variant improves over the original on Shot Energy:
   - Try one more expansion round with a different
     variation emphasis (change the "through something"
     element, or change the motion type)
   - If still no improvement after 2 rounds: flag for
     human review — this shot may need a complete rewrite
     from the Director

4. Replace the original shot in the grid with the winning
   variant

5. Re-run the full sequence evaluation (Axes 7–11) on
   the updated grid

---

## EXPANSION LOG FORMAT

```json
{
  "treatment_id": "string",
  "shot_number": 5,
  "expansion_trigger": "shot_energy_2.5_composition_3.0",
  "expansion_round": 1,
  "original_scores": {
    "anamorphic_fidelity": 4.5,
    "lighting_quality": 4.0,
    "color_grade": 4.0,
    "subject_sharpness": 4.0,
    "composition": 3.0,
    "shot_energy": 2.5
  },
  "variants_generated": 4,
  "variant_scores": [
    { "variant": 1, "type": "dynamic_framing", "composition": 4.0, "shot_energy": 3.5 },
    { "variant": 2, "type": "motion_evidence", "composition": 3.0, "shot_energy": 4.0 },
    { "variant": 3, "type": "through_something", "composition": 4.5, "shot_energy": 4.5 },
    { "variant": 4, "type": "compressed_intimate", "composition": 3.5, "shot_energy": 3.5 }
  ],
  "selected_variant": 3,
  "selected_variant_type": "through_something",
  "final_scores": {
    "composition": 4.5,
    "shot_energy": 4.5
  },
  "result": "pass — replaced in grid"
}
```

---

## NOTES FOR VIDEO TRANSLATION

The "through something" and "implied motion" variation types
produce images that translate best to video generation in
LTX-2.3 and Wan 2.2. The video model has more to work with
when there's already a depth layer and implied direction
of movement in the source image.

When curating images for the LoRA training set, prefer
Expander variants over original generations — they carry
more cinematic information for the model to learn from.
