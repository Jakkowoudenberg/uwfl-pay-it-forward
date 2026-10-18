# UWFL pattern library — first review stage

The agreed first stage is ten black-and-white examples for review, before expanding
to 100 and connecting reservations. This branch publishes `patterns-preview.html`
only in a Netlify deploy preview. It does not change the live gallery or routes.

The invitation gives pattern floors and free designs equal standing, shows the
breadth of parquet craft and encourages cooperation with young makers without
making it compulsory. Each field is 90 × 90 cm inside the common 5 cm oak pinwheel
frame (100 × 100 cm overall). No additional outer borders are offered.

## Provenance and geometry

`docs/pattern-provenance.json` records the historic source number, scan
page, descriptive title and adaptation for every study. Source: Interior Hardwood
Co., *Book of Designs: Ornamental Parquet Floors and Borders*, 15th edition, 1892,
scans made available by Floor Borders. The original source pages were inspected.
The scans are not republished. These are geometric adaptations, not exact historical
reconstructions or dimensioned cutting plans. Some source details have intentionally
been simplified; the UI explains this alongside each design.

Regenerate the ten SVGs with `python scripts/build-pattern-studies.py`. This uses
no external dependencies, verifies full field coverage by polygon area and checks
841 interior sample points per design for gaps or overlapping pieces. SVGs remain
sharp at any display size. Two line weights clarify the hexagon study; they do
not introduce extra construction joints.

## Preview interactions

Read-only local catalogue load; search/filter; enlarged drawing with provenance;
maximum two example choices; removable selection; optional collaboration example.
Choices live only in memory and are never reservations. No identity, mail or
reservation endpoint is called. No user details are collected or persisted.

Check: build with `CONTEXT=deploy-preview npm run build`, then run
`JSDOM_PATH=<jsdom installation> node scripts/check-pattern-library.cjs`.
The existing release function suite also remains unchanged and passes.

## Remaining after the first ten are reviewed

1. Verify and deduplicate 100 actual historic designs, excluding border-only
   designs, mirrored/rotated duplicates and Escher. Refine each study with the
   craftsperson reviewing construction and fit.
2. Integrate equally weighted Pattern Floors and Free Designs in the artwork
   gallery; translate the approved copy into the site's existing languages.
3. Add verified participant identity using a short-lived, one-use personal email
   link. Never trust a checkbox, participant number or browser state as authority.
   The existing email connection is explicitly deferred by the user; do not
   reconnect or send messages as part of this preview.
4. Implement server-side maximum open choices, idempotent requests, admin
   confirmation, atomic prevention of competing confirmed reservations, a history
   of changes, release/expiry and separately recorded variants. An unconfirmed
   request must not block the catalogue. Apply RLS and owner/admin checks.
5. Add admin tools and then reminders/start confirmations. The proposed 30-day
   reminder is product behavior to review; no automation is currently scheduled.

Nothing in this preview claims that live reservations or 100 finished designs
already exist. No production participant record has been changed.

## Display decision

Jakko requested no public source attribution. Public cards, detail views, SVG
descriptions and the public catalogue therefore show no source names, dates,
catalogue references or source links. Research provenance is retained only in
`docs/pattern-provenance.json`, outside the published assets. This display change
does not assert any copyright or licensing status.


## Batch 2 — 20 additions (31 total)

P012–P031 add grouped herringbone, chevron at 45°/60°, straight and offset
strip bonds, ladder patterns, two-strip basket, single-strip weave, cubes
without inner edging, plain rhombi/hexagons/squares, diamond fields and stars.
These are new geometric studies of the described structures; they are not
claimed as exact historical transcriptions. Family references, where relevant,
remain internal. Public cards have Dutch/English names and descriptions.

Grouped herringbone uses equal individual stave proportions (6:1), changing
the group size rather than presenting simple rotations or different scales.
All 31 drawings keep the required clockwise outer frame. Coverage, overlap
sampling and unique inner geometry are checked before deployment.
