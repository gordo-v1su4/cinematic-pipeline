# OPTIMIZER.md
## Agent Skill — Prompt Optimization

**Role**: Read score JSON from the Judge, identify the weakest
axis, propose a specific targeted prompt revision, and route
back to generation. Never change more than one axis per cycle.

**Reads**: /docs/CREATIVE_BIBLE.md, /agents/CINEMATOGRAPHER.md

**Input**: scores.json + prompts.json (the failing prompt)

**Output**: revised prompts.json (single shot revision)

---

## ACTIVATION

This agent activates when the Judge outputs:
`"recommended_action": "optimizer"`

Meaning: at least one axis scored 3.0–3.9. The image is not
a total failure — it's a targeted fix.

---

## THE RATCHET PRINCIPLE

The Optimizer works like Karpathy's autoresearch loop:

1. Identify the single lowest-scoring axis
2. Propose one specific change targeting that axis
3. Keep everything else identical
4. Regenerate
5. Judge scores the new image
6. If improved: keep the change, move to next axis
7. If not improved: rollback, try a different change on
   the same axis
8. Only move to the next axis when the current one passes

**Never change two things at once.** If anamorphic fidelity
and lighting both fail, fix anamorphic fidelity first.
The only exception: if two axes are failing because of the
same root cause (e.g. a bad lighting setup causing both
poor lighting AND poor grade), fix the root cause once.

---

## AXIS PRIORITY ORDER

When multiple axes fail, address in this order:

1. **Anamorphic Fidelity** — if the bokeh is wrong, nothing
   else matters
2. **Subject Sharpness** — if the subject doesn't read as real,
   the image fails at the most basic level
3. **Lighting Quality** — the most impactful axis for cinematic feel
4. **Color Grade** — affects everything but is fixable in generation
5. **Framing** — lowest priority; can sometimes be cropped in post

For sequence axes, address in this order:

1. **Character Consistency** — blocking issue for LoRA training
2. **Color Continuity** — affects the set as a whole
3. **Lighting Continuity** — similar to above
4. **Shot Variety** — structural issue, may require new shots
5. **Narrative Flow** — hardest to fix in generation

---

## DIAGNOSIS GUIDE

### Anamorphic Fidelity scoring low

**Symptom: circular bokeh**
→ Add to prompt: `oval elliptical bokeh, anamorphic oval highlight
  streaks, NOT circular bokeh`
→ Add to negative: `circular bokeh, spherical lens, standard lens`

**Symptom: no depth of field**
→ Add: `very shallow depth of field, f/1.4 equivalent,
  background completely dissolved into oval bokeh`

**Symptom: no lens character**
→ Add: `anamorphic lens character, horizontal lens flare,
  chromatic aberration at frame edges, anamorphic barrel distortion`

---

### Lighting Quality scoring low

**Symptom: flat / unmotivated**
→ Remove any ambient light references
→ Add: `single motivated key light from [specific direction],
  deep shadows, high contrast ratio, practical light source:
  [specific — neon sign / window / streetlight / screen]`

**Symptom: overexposed**
→ Add to negative: `overexposed, blown highlights, flat lighting`
→ Add: `controlled highlights, lifted blacks but not crushed shadows`

**Symptom: wrong color temperature**
→ Specify: `warm amber [2700K] key light` or
  `cool fluorescent [5600K] overhead fill`
  Never leave color temperature unspecified.

---

### Color Grade scoring low

**Symptom: no grade**
→ Add explicitly: `teal shadows, warm amber highlights,
  desaturated overall, lifted blacks, cinematic color grade,
  DI grade, teal-orange split`

**Symptom: oversaturated**
→ Add: `desaturated, muted colors, filmic color palette`
→ Add to negative: `oversaturated, vivid colors, HDR`

**Symptom: wrong palette**
→ Specify the exact grade deviation noted in the treatment's
  location brief. If none specified, apply default.

---

### Subject Sharpness scoring low

**Symptom: AI artifacts / broken anatomy**
→ Add to negative: `deformed, distorted, extra limbs, bad hands,
  broken anatomy, artifacts, AI generated look`
→ Add: `photorealistic, anatomically correct, natural pose`
→ Consider switching to Nano Banana Pro if using NB2

**Symptom: over-smoothed skin**
→ Add: `natural skin texture, pores visible, skin grain`
→ Add to negative: `smooth skin, airbrushed, beauty retouched`

**Symptom: subject soft**
→ Add: `sharp subject, tack sharp focus on [specific feature],
  foreground in focus, background soft`

---

### Character Consistency scoring low (sequence axis)

**Root cause**: character description drifting across shots.

**Fix**:
1. Pull the character description from shot 01
2. Paste verbatim into every subsequent shot
3. Ensure clothing is identically described — not paraphrased
4. Add character reference images to NB Pro if not already added
5. Do not rely on the model to "remember" — repeat explicitly

---

## CHANGE LOG PROTOCOL

Every optimization cycle must be logged:

```json
{
  "cycle": 1,
  "shot_number": 5,
  "axis_targeted": "anamorphic_fidelity",
  "score_before": 2.5,
  "change_made": "added oval bokeh specification, added negative circular bokeh",
  "prompt_before": "...",
  "prompt_after": "...",
  "score_after": null,
  "result": null
}
```

After regeneration and re-scoring:
```json
{
  "score_after": 4.0,
  "result": "keep — axis passes threshold"
}
```

This log is passed to NocoDB with the treatment record.

---

## STOPPING CONDITIONS

Stop the optimization loop when:

1. **All axes pass** — route to NocoDB logging
2. **5 cycles on the same axis without improvement** —
   flag for human review, do not continue
3. **Total cycles exceed 12** on a single shot —
   flag for human review, treat as prompt failure
4. **Score regresses below 2.0 on any previously
   passing axis** — rollback to last passing state
   and flag for human review

---

## WHAT THE OPTIMIZER NEVER DOES

- Changes the shot card description or treatment
- Changes the structure, location, or director tone
- Makes subjective creative choices not grounded in the rubric
- Attempts to fix sequence issues by rewriting the treatment
  (sequence issues that can't be fixed at the prompt level
  are escalated to the Director for a new treatment)
- Runs more than one cycle without re-scoring
