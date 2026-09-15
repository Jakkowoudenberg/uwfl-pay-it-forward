# UWFL design preview

This is a separate, interactive design preview requested by Jakko on 15 September 2026. The production `index.html`, Netlify functions and configuration are unchanged. Do not replace the live app with this folder until the design has been reviewed and production integration is completed.

## Included

- A new homepage using the existing UWFL logo, existing generational illustration and the existing slogan.
- A four-step participant registration preview, including local photo selection, required-field validation, review and a clearly labelled simulated confirmation.
- A sponsor introduction, an initial private-contact preview and the existing separate sponsor/organisation profile concept.
- Public participant browsing, country filtering, sponsor and organisation cards, and the panel gallery. These use only the existing public read endpoints and do not create a second participant database.
- An upload-flow preview with explicitly labelled sample details and local-only photographs.
- The existing project information in six languages and the existing technical drawing, with SVG download and print support.
- An eight-question panel-idea helper that composes a prompt locally. This preview does not call the existing AI chat service.
- Mobile navigation, accessible input labels, keyboard focus styles, responsive layouts and reduced-motion support.

## Preview isolation

All form submissions are deliberately simulated. No form performs a POST, PUT, PATCH or DELETE. The only network data access is GET to the public participants, sponsors, organisations and panels endpoints. There is no service-worker registration, admin UI, credential or serverless function in this folder. `noindex,nofollow` is applied in HTML, response headers and `robots.txt`.

The separate Netlify draft preview is not password protected; its URL is an unindexed review link. Deployment uses `draft: true` and verifies that the published production deployment remains unchanged. The responsive QA page is `_qa.html`; it is separate from the app navigation.

## Preserved content

`assets/content.js` contains the existing `LANG`, `JOIN_TEXTS`, `BACKPANEL` and drawing definitions extracted from production commit `630b12f336cbd793d96b2cda9c0a7005602197ab`. The reader changes markup presentation and internal navigation, not the underlying project texts. The drawing label parser is corrected to split actual newlines; the existing double-escaped split displayed undefined labels. Dimensions and label text are unchanged. New interface copy is in `assets/translations.js`.

The generic headline/diagram copy and the sponsor introduction are design proposals. Preserve the movement's inclusivity, the promise to help three people, equal recognition of sponsors and the artwork's eventual donation. Sponsors are not divided into payment tiers.

## Production handover, after design approval

1. Connect the participant, panel, sponsor and organisation forms to the existing reviewed server endpoints, with their actual validation and moderation response states.
2. Map country codes, participant roles, photo uploads and form fields explicitly to the current schema. Do not change or migrate production records as a side effect of the visual redesign.
3. Implement the initial sponsor enquiry as a private contact message, separate from any public sponsor profile. Confirm delivery handling before enabling it.
4. Integrate the existing AI assistant into the new interface, then test its real error and loading states.
5. Verify the real submission and moderation flows in a suitable test environment. An end-to-end preview flow is not evidence that production persistence works.
6. Reconcile the current project dates/content and image credits before release. Keep the current app available until Jakko approves the replacement.

## Validation performed

- JavaScript syntax and coverage of all new UI labels across six languages.
- Production source unchanged; preview files contain no API credentials or mutation requests.
- Desktop, tablet and narrow/mobile viewport checks using the actual draft app.
- Participant route with example details, back navigation, missing-photo feedback, local test image, review and simulated completion.
- Sponsor enquiry with sample content and simulated confirmation.

This folder can be served by any static web server. It needs no package installation or build step.
