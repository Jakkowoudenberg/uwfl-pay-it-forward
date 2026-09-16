# Regional mail handover — not connected to production

Jakko asked for regional collection and shipping instructions to remain private,
with different messages for the Americas, the EU and other countries. The
approved development approach remains: prepare and review first, activate later.

## Ready to review

- `approval-mail.cjs` builds six-language approval/status emails and separately
  released delivery instructions. It never sends mail or changes a record.
- `preview/assets/shipping-policy.js` is shared by the upload preview and this
  renderer. EU means the 27 EU member states. European countries outside the EU
  follow the other-regions route until Jakko makes an arrangement for them.
  ISO codes, country names in the six app languages and common aliases are
  handled. Unknown countries safely receive a status update without an address.
- `build-preview-mail.cjs` exports the reviewed regional wording and generates
  strictly fictional examples at `preview/_mail-review.html`. No live recipient,
  address book or provider credential is used.
- The upload preview asks explicitly where the panel will be shipped from.
  That choice takes precedence over nationality, the maker's registration
  country and the country where the panel was originally made.
- `check-regional.cjs` tests country mapping, languages, regional boundaries,
  pending panels, separate Expo selection, origin/panel mismatches, missing
  decisions and private-address release. It makes no external requests.

## Current system observed in the repository

`netlify/functions/panel-approve.js` patches a panel's status, then calls an
external Google Apps Script with `type: panel_approved`, a language and a region.
The region is derived from `country_made`, with a limited list of country names.
It treats several non-EU European countries as EU and misses ISO codes and
some translations. The actual mail templates and recipient-side delivery are
outside this repository and have not been inspected or changed.

Do not assume the Google script accepts a new `subject`, `text` or shipping
decision field: its current contract only demonstrates the existing payload.
No POST to that script was made. The old backend and live mail behavior are
unchanged by this preview.

## Before activating the reviewed version

1. Store a panel's explicit shipping country, separately from `country_made`.
   Validate it on the server and show it in Jakko's authenticated panel review.
   A legacy `country_made` value may choose a status message, but must not
   release a shipping address without confirmation of the current origin.
2. Keep project approval, Expo selection and shipment release separate. Build
   the mail only from trusted server-side approval and review records. The
   renderer is a formatter, not an authentication or authorisation boundary.
3. Keep destinations and contacts in private server configuration/storage, never
   in the public bundle, repository examples, public API or downloadable kit.
   A released destination must match the panel, its verified current origin and
   the region. EU releases are collection instructions. An Americas Expo release
   additionally requires explicit selection for that Expo. No route is inferred
   for other countries.
4. Integrate the reviewed subject/body into the existing private Google script
   after its source and deployment access are available, or into a separately
   authorised sender. Preserve the current sender and recipients unless Jakko
   authorises a change. Do not send test emails to real participants.
5. In a test environment, verify authenticated approval, persisted decisions,
   the provider response, retries without duplicate sends and receipt at an
   authorised test mailbox. A failed database approval must not produce an
   approval mail. A failed send must remain visible for follow-up.
6. Only after Jakko approves the new app and mail behavior should production be
   connected. No migration, outbound mail or live deployment is part of this
   design-preview revision.
