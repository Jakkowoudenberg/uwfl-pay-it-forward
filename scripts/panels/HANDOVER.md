# Maker story and materials — preview and data contract

The four-step upload preview collects details, panel/photos/materials, the
maker's story, and a final review. Every text and image remains subject to
Jakko's approval. The extra personal prompts are optional; an existing story
and the required panel photo are not replaced by new mandatory personal answers.

| Preview field | Public panel field | Meaning |
| --- | --- | --- |
| `artwork-name` | `artwork_name` | Panel title, required |
| `panel-story` | `story` | Existing maker story, required; preserve verbatim |
| `panel-why` | `why` | Personal motivation, optional |
| `panel-meaning` | `meaning` | Meaning of the design, optional |
| `wood-species` | `wood_species` | Wood species, required for new submissions |
| `pattern` | `pattern` | Pattern or technique, optional |
| `panel-materials` | `materials` | Other materials and finish, optional |
| `panel-photos` | `photos` | At least one photo, approval required |
| `shipping-country` | Private `shipping_country` | Current origin for regional mail |

`UWFL_PANEL.fromDraft` is the explicit content mapping used by review.
`sections` and `craft` present the same fields in the gallery. Missing optional
fields do not create empty headings. Existing `story` text, including line
breaks, remains unchanged; user text is escaped before HTML rendering.

## Still required before enabling real submissions

- Add nullable `why`, `meaning`, `materials` and private `shipping_country`
  columns to the panel schema after checking the current database schema.
  No schema migration has run in this revision.
- Validate these strings and lengths server-side (story 4000; why, meaning and
  materials 2000 each; wood species and pattern 300). Validate/normalise the
  origin country; never replace `country_made` with a shipping origin.
- Extend `panel-submit` to persist these fields in a **pending** record, with
  existing participant authentication and image checks. The current endpoint
  does not yet accept/persist these additional fields.
- Include why/meaning/materials in Jakko's authenticated panel review. Include
  them in the approved-only public panel projection after approval. Keep email,
  origin country and private shipping data out of that public response.
- Later edits to text or photos must also wait for approval; do not overwrite
  approved public content with an unreviewed change. Preserve legacy stories
  and do not manufacture explanations for existing makers.
- Approval automatically starts the regional mail; see `../mail/HANDOVER.md`.
  The existing participation/content rules remain unchanged. The public Expo
  explanation is limited to the available space for 32–36 panels.

The preview stores drafts only in page memory and does not submit or publish
anything. Offline tests use fictional panels to verify new and legacy display,
text escaping, required photos, retained draft fields, and review before public
visibility. They do not prove backend persistence or live email delivery.
