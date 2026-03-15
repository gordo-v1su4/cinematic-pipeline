# REFERENCE_CURATOR.md
## Agent Skill — Anamorphic Reference Library Curation

**Role**: One-time and periodic curation of anamorphic film
stills from ShotDeck and Shot.cafe into the pipeline's
reference library. Provides the visual ground truth that
the Judge uses for comparison scoring.

**Trigger**: Manual only — not part of the generation loop.
Run once to build the library, then periodically to refresh
or expand specific categories.

**Output**: /reference-library/ (organized image files + caption JSON)

---

## WHY THIS EXISTS

The Judge agent scores anamorphic fidelity, lighting quality,
and color grade against a text rubric. Text rubrics are
weaker than visual references for VLM evaluation. A Judge
that can compare a generated image against 3 ground-truth
examples scores more accurately and more consistently than
one working from description alone.

This agent builds that ground truth library.

---

## SOURCE TOOLS

### Primary — ShotDeck (shotdeck.com)
**Your subscription** — use existing access.

ShotDeck's filter system does most of the work:

**Lens filter**: `Anamorphic` — filters to anamorphic shots only

**Aspect ratio filters**:
- `2.39:1` — primary target
- `2.35:1` — acceptable
- `2.4:1` — acceptable
- Anything wider than 2.35 qualifies

**Additional filters to combine**:
- Director name (Glazer, Jeunet, Deakins, Lubezki, Doyle, etc.)
- Lighting: `Night`, `Low Key`, `Practical Lighting`
- Setting: `Urban`, `Interior`, `Station`, `Street`
- Color: `Teal`, `Amber`, `Desaturated`

**How to use**:
Apply anamorphic + 2.39:1 as base filters, then layer
additional filters to target specific reference categories.
Select 5–10 strong examples per category. Download at
highest available resolution.

### Secondary — Shot.cafe (shot.cafe)
**Free** — no subscription required.

Use for:
- Color grade reference — Shot.cafe provides RGB parade
  per image, making it useful for precisely documenting
  the teal-amber grade target
- Cross-reference with ShotDeck selections
- Additional coverage for lighting and composition categories

### Tertiary — FilmGrab (film-grab.com)
**Free** — large database of film stills.
Use for gap-filling when ShotDeck doesn't have coverage
on a specific film or director.

---

## CURATION SESSION WORKFLOW

### Step 1 — Open ShotDeck, apply base filters
```
Filters applied:
  ✓ Lens: Anamorphic
  ✓ Aspect Ratio: 2.39:1 (also check 2.35:1)
```
This is your baseline. Everything you pull should meet
both criteria.

### Step 2 — Work through categories

For each reference category below, add additional filters,
select 5–10 strong examples, download to the correct folder.

Do not download mediocre examples — the library should
represent the 5/5 standard, not the average. If you can't
find 5 strong examples in a category, stop at 3. Quality
over quantity.

### Step 3 — Caption each image

For every downloaded image, create a companion JSON file
with the same filename:

```json
{
  "filename": "deakins_blade_runner_001.jpg",
  "source": "ShotDeck",
  "film": "Blade Runner 2049",
  "year": 2017,
  "dp": "Roger Deakins",
  "director": "Denis Villeneuve",
  "qualities_demonstrated": [
    "oval_bokeh",
    "high_contrast",
    "motivated_single_source",
    "teal_amber"
  ],
  "motion_evidence": "none",
  "motion_evidence_type": null,
  "score_anchor": 5,
  "notes": "Strong oval bokeh on background practical lights, single motivated key from right, teal in shadows, amber in highlights, skin protected"
}
```

`score_anchor` is your judgment: 5 = this is what we're
aiming for, 3 = acceptable but not pipeline-ready.
Both are useful — the Judge needs to see the difference.

### Step 4 — Organize into folders

Place images in the correct subfolder. One image can
appear in multiple categories if it demonstrates multiple
qualities — copy it, don't symlink.

---

## REFERENCE LIBRARY STRUCTURE

```
/reference-library
  /anamorphic-qualities
    /oval-bokeh
      [images demonstrating clear oval/elliptical bokeh]
      [target: 8–10 images, mix of score=5 and score=3]

    /lens-flare-horizontal
      [horizontal streak flares only — no starburst, no circular]
      [target: 5–8 images]

    /chromatic-aberration
      [color fringing at edges, high-contrast boundaries]
      [target: 5 images — this is subtle, hard to find examples]

    /shallow-dof-anamorphic
      [extreme shallow depth, subject sharp, world dissolved]
      [target: 8–10 images]

    /wide-with-compression
      [anamorphic wide shots demonstrating depth compression]
      [target: 5–8 images]

  /motion-evidence
    /subject-motion-blur
      [moving body parts — hair, coat, hands — blurred against
       sharper background or environment]
      [target: 6–8 images]

    /camera-motion-blur
      [background streaks from camera movement, subject sharp]
      [target: 5–8 images]

    /environmental-motion
      [rain streaks / steam / passing vehicle blur / crowd blur
       while subject is relatively still]
      [target: 8–10 images — most common type]

    /implied-motion
      [subject frozen mid-action — mid-step, mid-gesture,
       caught between positions — no actual blur but clear motion]
      [target: 8–10 images — this is the primary target type]
      [note: this is what we want in most generated images —
       the Cartier-Bresson decisive moment applied to film]

  /lighting-quality
    /motivated-single-source
      [one dominant practical light, rest falls off]
      [target: 8–10 images]

    /high-contrast-retained
      [deep shadows but shadow detail visible, highlights controlled]
      [target: 8–10 images]

    /night-practical
      [neon, streetlight, screen, candle, train window —
       practical sources creating the image without fill]
      [target: 8–10 images]

    /score-3-lighting
      [flat, unmotivated, or generic lighting — negative examples]
      [target: 4–5 images — the Judge needs to see the failure]

  /grade-reference
    /teal-amber-5
      [score=5 examples of the target grade]
      [RGB parade data from Shot.cafe preferred for these]
      [target: 8–10 images]

    /teal-amber-3
      [score=3 — grade present but inconsistent or slightly off]
      [target: 4–5 images]

    /desaturated-with-pop
      [muted overall with one saturated element]
      [target: 5 images]

  /shot-energy
    /diagonal-composition
      [strong diagonal lines — architectural, light shafts,
       shadow edges — cutting across the 2.39:1 frame]
      [target: 6–8 images]

    /foreground-tension
      [strong foreground element in tension with background,
       anamorphic compression working]
      [target: 6–8 images]

    /off-balance-framing
      [subject placed against the gravitational pull of the frame —
       the frame wants to move away from them]
      [target: 5–8 images]

    /score-1-energy
      [dead images — centered subject, nothing happening,
       no tension or implied movement — negative examples]
      [target: 3–5 images — what to avoid]

  /director-tone
    /glazer
      [Glazer commercial and film work — dread and beauty,
       bodies in motion, primal undercurrent]
      [target: 8–10 images]

    /jeunet
      [Jeunet work — romantic inevitability, city as machine,
       slightly too beautiful to be real]
      [target: 8–10 images]

    /wkw
      [Wong Kar-wai — time, longing, color as emotion,
       every frame already a photograph]
      [target: 8–10 images]

    /deakins
      [Roger Deakins — precision, motivated light, no excess]
      [target: 8–10 images]

    /lubezki
      [Emmanuel Lubezki — natural light, long takes,
       environmental immersion]
      [target: 8–10 images]
```

---

## SHOTDECK SEARCH STRATEGIES

### For anamorphic bokeh specifically
```
Filters: Anamorphic + 2.39:1
Keywords: "bokeh", "shallow focus", "out of focus background"
Best sources: any Deakins, Lubezki, Doyle, Storaro film
```

### For horizontal lens flare
```
Filters: Anamorphic
Keywords: "lens flare", "backlight", "contre-jour"
Note: flares are most visible in backlit scenes — filter
by lighting "Backlight" or "Rim Light"
```

### For implied motion (most important category)
```
Filters: Anamorphic + 2.39:1
Keywords: "walking", "running", "dance", "movement"
Look for: mid-step figures, hair caught in motion,
coat tails mid-swing — not blur, frozen action
Best sources: action sequences, dance scenes, street scenes
```

### For night practical lighting
```
Filters: Anamorphic + Night + Practical Lighting
Settings: Urban, Street, Interior-bar, Station
Best sources: Blade Runner 2049, Heat, Collateral,
In the Mood for Love, Drive, Nightcrawler
```

### For director-specific tone
```
Jonathan Glazer:
  ShotDeck search: "Jonathan Glazer" or "Sexy Beast" /
  "Birth" / "Under the Skin"
  Note: his commercial work may not be in ShotDeck —
  supplement with manual frame grabs

Jean-Pierre Jeunet:
  Search: "Jeunet" or "Amelie" / "City of Lost Children"
  Note: these are often spherical lens — use for tone
  reference, not anamorphic quality reference

Wong Kar-wai:
  Search: "Wong Kar-wai" or "In the Mood for Love" /
  "Chungking Express" / "2046"
  Christopher Doyle is the DP — search his name too
```

---

## HOW THE JUDGE USES THIS LIBRARY

When the Judge evaluates a generated image, it loads
reference images from the relevant categories and includes
them in the VLM evaluation prompt:

```
Example Judge prompt for Axis 1 — Anamorphic Fidelity:

"Compare the generated image (attached) against these
reference examples of excellent anamorphic quality (attached:
3 images from /oval-bokeh/ with score_anchor=5) and these
examples of acceptable but imperfect anamorphic quality
(attached: 2 images from /oval-bokeh/ with score_anchor=3).

Score the generated image 1–5 on anamorphic fidelity using
these references as your anchor. Does the oval bokeh match
the quality of the score=5 examples? Is the lens character
as convincing?"
```

This comparison-based scoring is significantly more accurate
than rubric-text-only scoring. Build the library first,
then the Judge gains a visual anchor.

---

## MAINTENANCE

### When to refresh the library
- When the pipeline's aesthetic target shifts
- When a new director tone is added to the Creative Bible
- When the Judge consistently scores differently than your
  manual assessment (calibration drift)
- Seasonally — new films release with reference-quality
  anamorphic work regularly

### How to refresh
Run a new ShotDeck session targeting the specific categories
that need updating. Add new images, don't replace existing
ones unless they're genuinely subpar. The library should grow.

### Library size targets
- Minimum viable: 3–5 images per category, all score=5
- Healthy: 8–10 images per category, mix of 5 and 3
- Do not exceed 20 images per category — too many references
  confuse the VLM comparison

---

## SESSION CHECKLIST

Before starting a curation session:

```
[ ] ShotDeck subscription active
[ ] /reference-library/ folder structure created
[ ] JSON caption template ready to fill
[ ] Target categories for this session identified
[ ] Time budget: ~2 hours for a full initial build
    ~30 minutes for a category refresh
```

During session:
```
[ ] Base filters applied: Anamorphic + 2.39:1
[ ] Only downloading examples I would call score=5
[ ] At least 3–4 score=3 examples captured per
    major category (Judge needs to see the difference)
[ ] Each image captioned before moving to next category
[ ] quality_demonstrated tags are specific, not vague
```

After session:
```
[ ] All images have companion JSON files
[ ] Folder counts match targets
[ ] Update JUDGE.md reference_library_version date
[ ] Note any categories that are thin — schedule next session
```
