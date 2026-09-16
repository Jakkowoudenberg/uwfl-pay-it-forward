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
