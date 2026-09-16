# Automatic regional approval mail — prepared, not connected to production

Jakko clarified the workflow: **one panel approval automatically sends the maker
one email with the shipping details for their region**. There is no separate
shipment-release approval. Expo selection is distinct because the NWFA booth
has room for 32–36 panels; it must not block the automatic approval email.

## Ready to review

- `approval-mail.cjs` formats the complete approval email in six languages.
  `buildApprovalMail(approvedPanel, privateDestinations)` selects the regional
  destination immediately. Pending/rejected panels return no approval email.
  It never sends mail or changes a record.
- The private configuration has `eu` and `americas` destinations, each with a
  matching `region`, `name`, `address` and `instructions`. Include the actual
  contact and packing/delivery details in `instructions`. No addresses are
  stored in this repository or the public preview.
- `privateDestinations.countries` can supply an agreed destination by ISO
  country code for other countries. There is no worldwide default destination.
  Without a route the approval still generates an automatic status email,
  explaining that the maker should wait for delivery instructions.
- The actual shipping country takes precedence over `country_made`. For legacy
  records without that new field, `country_made` retains the current fallback.
  Nationality and registration country do not override the shipping country.
  An unrecognised explicit origin does not silently fall back to an old country.
- `expo_selected` only affects the selection information included for an
  Americas maker. False or missing selection never prevents the regional mail
  or implies that an approved panel has a guaranteed place on the Expo stand.
- Shared country policy lives in `preview/assets/shipping-policy.js`. EU means
  its 27 member states. It recognises those and Americas names in six languages,
  ISO country codes and common aliases. Other European countries follow the
  other-regions route until a country-specific arrangement is configured.
- `_mail-review.html` contains fictional examples, switching between pending
  and approved. Approval immediately shows the regional instructions; no second
  approval control exists. `check-regional.cjs` verifies this without sending.

## Existing production sender

`netlify/functions/panel-approve.js` already patches panel status and calls an
external Google Apps Script with `type: panel_approved`. Its old country mapping
is incomplete. The actual email templates and delivery code are outside this
repository and have not been inspected or changed. Its demonstrated payload
contains metadata, not a supported `subject`/`text` template contract.

No POST to that service has been made. The production app and sender are
unchanged; formatter tests do not prove email receipt or live approval behavior.

## Integration after design review

Approval and logistics are tasks for authorised UWFL team members and may be
delegated. Do not tie the review workflow or mail text to the initiator’s name.
Keep existing authentication; this copy revision grants no new access.

1. Persist `shipping_country` with the submitted panel. Display it in the
   authenticated review alongside photos, story, why, meaning and materials.
   Missing route configuration is visible to the administrator, not solved by
   inventing an address or introducing another maker approval step.
2. Keep the existing administrator authentication. After successful database
   approval, automatically queue exactly one regional approval email using
   the saved panel, verified recipient and private destination configuration.
   Do not trust status, destination, selection or recipient overrides from
   an unauthenticated browser. A failed database update must not send a mail.
3. Keep addresses and contacts in private server configuration/storage. The
   public panel endpoint must not expose them, `shipping_country`, recipient
   email, queue details or other private delivery metadata.
4. Integrate the formatter with the existing private Google script once its
   source and deployment access are available, or an explicitly authorised
   sender. Do not assume it accepts a new payload. Preserve the intended sender
   and recipient. No test messages to real participants.
5. Test automatic dispatch, successful delivery to an authorised test mailbox,
   retries without duplicate sends, and visible failure status in staging.
   Changing Expo selection is not a second panel approval and must not send
   another approval mail. A later route update is a distinct logistics update.
6. Connect production only after the new app and mail behavior are reviewed.
   This revision makes no migration, outbound send or production deployment.
