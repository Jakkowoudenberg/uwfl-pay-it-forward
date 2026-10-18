# UWFL production release — 16 September 2026

Jakko approved publishing the reviewed app in this conversation. Production is
built from `preview/` with `node scripts/build-production.cjs`, served from
`dist/`, and uses the existing Netlify functions and administrator password.
The standalone design preview still simulates public writes. Only the build
loads `production.js` to activate the real, same-origin form handlers.

## Release behavior

- Registration stores the original story, required photo, role, language and
  participant number. A random request ID makes retries idempotent.
- New photographs and logos go to the private `uwfl-review` storage bucket.
  Only authenticated reviewers receive short-lived image links. Approval copies
  reviewed images to their existing public bucket before publishing the record.
- Panel stories include motivation, meaning, wood, technique and other
  materials. Shipping origin is private. The maker must be approved before a
  panel can be published. All submission handlers force pending status.
- Sponsors and organisations retain their reviewed flows. Media are an explicit
  organisation category, with a separate approved read and public count.
- Contact enquiries are saved privately and appear under Private messages in
  management. Marking one handled never publishes it.
- Decisions require the existing server password and POST. Conditional pending
  updates prevent duplicate or conflicting approvals. Database failures are
  reported as failures, not empty successful queues. The unused legacy
  name-based photo overwrite endpoint is retired.
- Existing approved records and their stories are not changed by the release.

## Mail boundary

The existing Google Apps Script remains the sender and owns the private shipping
addresses and mail templates. The new app sends its established registration,
panel, partner, contact and panel-approval payloads from the server. Actual
shipping origin selects EU, Americas or individually arranged regions using the
shared country policy. The separate formatter in `scripts/mail/` is still a
proposal; this release does not pretend that the external sender accepts its
subject/text interface.

Each dispatch is logged privately. An ambiguous response is shown in management
under Mail status and is not automatically retried, avoiding duplicate mail.
A service acknowledgment does not prove mailbox delivery. No real participant
emails are sent during QA. External template contents and delivery to a real
mailbox have not been verified in this release.

## Schema and verification

`supabase/migrations/20260916_live_app.sql` is additive and was applied to the
existing UWFL project. It adds optional panel fields, request IDs, the media
category, private contact/mail tables with RLS, and a private review bucket.
It does not rewrite or delete any existing participant records.

Checks:

- `node scripts/check-release.cjs`: all function contracts, fake database,
  storage and sender, approval visibility, retries and failure handling.
- `JSDOM_PATH=... node scripts/check-production-ui.cjs`: the built app's complete
  forms in six languages with fictional data and mocked networking.
- Existing preview, administrator and regional suites: navigation, translations,
  country rules, gallery stories, safe rendering, authentication and equality.
- Production build contains no QA pages, mail examples, original monolithic
  page or secrets. Administrator pages remain unindexed; public page is indexable.

For rollback, restore the previous Netlify production deploy recorded in the
release operation. The additive schema is compatible with the previous app and
can remain in place; do not delete new user submissions as part of a rollback.

## Artwork release — 17 October 2026

The root serves the reviewed four-destination layout. The complete existing
content and original registration/contact/partner flows remain at
`information.html`; inbound old routes redirect to the corresponding content.
The new artwork form verifies the existing participant-number/email pair and
requires truthful design, origin, dimensions, techniques and photo answers.

`artwork_dossiers` is additive, RLS enabled and unavailable to anon/authenticated
roles. Only the server may read/write it. Front/detail photos follow the existing
review/publication flow; rear-side images stay in private review storage. Makers
retrieve their dossiers through a credential-checked POST; management uses its
existing admin-key gate. Dossiers can be printed/saved as PDF. No customs
classification, EUDR exemption or Expo selection is claimed automatically.

Original maker and panel texts are retained in the database. The Steve display
separates his existing biography and rose story without deleting source text.
Existing approved artworks are not required to resubmit retrospectively.

Public delivery instructions now identify T&G (EU) and NWFA (Americas) with the
Expo arrival deadline of 25 March 2027 and ten rear-side identification fields.
The external Google mail service and its template contents remain external to
this repository; a successful dispatch still does not prove correct template
contents or delivery. No real mails or submissions were created during QA.

Validation: release function contracts, artwork intake UI with fake networking,
six-language admin suite, security checks and production build. Additive schema
is recorded in scripts/schema-artwork-dossiers.sql.

## Pattern library — 18 October 2026

The public `patterns.html` page now exposes the first eleven checked pattern
studies. The homepage, artwork overview, menu and footer link to it. Public
visitors can search, filter and enlarge drawings; the memory-only demo choices
remain limited to the deploy-preview review page. There are no reservation,
identity, mail or database writes from the public library. The agreed verified
reservation workflow is described as a future feature, not offered as live.

The page explains equal appreciation for pattern floors and free designs,
invites craftspeople to involve the next generation, and explains scaling
pieces to show repeats inside the mandatory 90 cm inner field. The library
supports Dutch and English, with English fallback for other interface languages.
The intended total is 100; the public count accurately reflects the current eleven. The first cube study is adapted from Wyrsch no. 71.
No additional historical designs are claimed before drawings are checked.


## Pattern batch 2 — 18 October 2026

The library grows from 11 to 31 drawings with 20 additional geometric studies.
Includes the requested simpler pattern families, grouped herringbone,
45°/60° chevron and cubes without internal edging. English names and
descriptions are stored with each new catalogue row; family filtering includes
Chevron. All frames stay clockwise. Public browsing remains read-only; no
reservation, account, database or email behavior changes.


## Pattern batch 3 — 18 October 2026

Twenty new geometric studies bring the library to51. The batch broadens the
weave and ornamental families while retaining quiet long-short, modular and
cross bonds. All new names/descriptions support Dutch and English; frames
remain clockwise and previous drawings remain unchanged. Public browsing is
still read-only. No participant data, reservations, accounts or mail changes.


## Pattern batch 4 — 18 October 2026

Twenty additions bring the public library to71 geometric studies. Adds new
weaving repeats, cassette and compass fields, English basket with keys,
quiet strip bonds and point variations. Previous51 SVGs are retained.
Names/descriptions support Dutch and English. All outer frames stay clockwise;
public browsing, participant data, accounts, reservations and mail boundaries
are unchanged.


### Pattern library:91 studies
Added P072–P091 with NL/EN names and descriptions. Preserved P001–P071, the
clockwise oak frame, browsing-only public library and mobile layout. Validated
geometry coverage, unique inner SVGs, search/filter/dialog and NL/EN fallback.


### Complete100-pattern catalogue
Added nine ornamental star studies P092–P100 with Dutch/English names and
descriptions. Preserved prior91 SVGs and clockwise frame. Updated growth copy
to100 available studies. Geometry, public/preview behaviour and language checks
pass; all nine drawings visually reviewed.


### Ten large medallions:110 studies
Added P101–P110, each with one large medallion inside the clockwise oak frame.
Added a Medaillons filter, NL/EN metadata and updated catalogue totals. Retained
the previous100 drawings. Geometry, public/preview and language checks pass.
