# UWFL design preview

This is a separate, interactive design preview requested by Jakko on 15 September 2026. The production `index.html`, Netlify functions and configuration are unchanged. Do not replace the live app with this folder until the design has been reviewed and production integration is completed.

The confirmed requirements in [REQUIREMENTS.md](REQUIREMENTS.md) govern this
revision: Jakko's approval before publication, mandatory participant photos and
partner logos, shuffled public profiles, and a visible place for the initiator
and his reason for starting UWFL.

## Included

- A homepage with six clear entrances: makers, contributors, sponsors, organisations, visitors and media. Jakko's portrait, credited to Bram Belloni, an exact quote from his original story and a link to that story introduce the initiator.
- The concrete project purpose comes before the entrances: make wooden panels into one artwork, learn and pass on craft, help three people, then travel and eventually donate. An ordered journey explains how showing the art in the craft, involving people and encouraging help remain central while travelling.
- The visitor page explains the potential of the whole worldwide wood flooring industry working together, including manufacturers, suppliers, schools, associations and trade media. It describes ambitions rather than claiming that the whole industry already participates or inventing measured impact.
- Separate visitor, help-without-a-panel and about pages. Each participant role can enter registration directly, while changing role remains possible.
- Persistent audience navigation, including a bottom bar on mobile; a participant hub brings together the drawing, submission, guidelines, ideas and delivery information.
- The information index searches complete article text as well as titles and common synonyms, with result snippets and links to frequently needed topics.
- A four-step participant registration preview, including local photo selection, required-field validation, review and a clearly labelled simulated confirmation.
- Sponsors see four practical ways to help and three steps to discuss a contribution. Organisations get their own school/group route. Private enquiries have separate drafts from public profiles.
- Public participants, sponsors, organisations and panels use the existing approved-only read endpoints. Every list is shuffled once per page visit, then remains stable during reading, filtering and navigation. Cards and logo areas receive equal presentation; there are no contribution tiers.
- An upload-flow preview with explicitly labelled sample details and local-only photographs.
- The existing project information in six languages and the existing technical drawing, with SVG download and print support.
- An eight-question panel-idea helper that composes a prompt locally. This preview does not call the existing AI chat service.
- Mobile navigation, accessible input labels, keyboard focus styles, responsive layouts and reduced-motion support.
- Required participant photos and partner logos, matching 5 MB image limits, and clear moderation explanations before and after simulated submissions. An approved participant's panel still needs its own approval.
- A working press kit with the logo, Jakko's portrait, credits and project information in six languages. The portrait is explicitly identified as Jakko with The Nightwatch in Wood, a separate artwork.

## Preview isolation

All form submissions are deliberately simulated. No form performs a POST, PUT, PATCH or DELETE. The only network data access is GET to the public participants, sponsors, organisations and panels endpoints. There is no service-worker registration, admin UI, credential or serverless function in this folder. `noindex,nofollow` is applied in HTML, response headers and `robots.txt`.

The separate Netlify draft preview is not password protected; its URL is an unindexed review link. Deployment uses `draft: true` and verifies that the published production deployment remains unchanged. The responsive QA page is `_qa.html`; it is separate from the app navigation.

## Preserved content

`assets/content.js` contains the existing `LANG`, `JOIN_TEXTS`, `BACKPANEL` and drawing definitions extracted from production commit `630b12f336cbd793d96b2cda9c0a7005602197ab`. That file and the original project stories remain unchanged. The reader adjusts markup and internal navigation. The privacy page has targeted rendering updates to reflect mandatory photos, explain moderation and distinguish private participant contact details from optional public partner fields. The drawing label parser splits actual newlines; dimensions and labels remain unchanged. Interface copy is in `assets/translations.js`, `assets/experience.js` and `assets/purpose.js`.

The generic headline/diagram copy and the sponsor introduction are design proposals. Preserve the movement's inclusivity, the promise to help three people, equal recognition of sponsors and the artwork's eventual donation. Sponsors are not divided into payment tiers.

## Production handover, after design approval

1. Connect the participant, panel, sponsor and organisation forms to the existing reviewed server endpoints, with their actual validation and moderation response states.
2. Map country codes, participant roles, photo uploads and form fields explicitly to the current schema. Do not change or migrate production records as a side effect of the visual redesign.
3. Implement the initial sponsor enquiry as a private contact message, separate from any public sponsor profile. Confirm delivery handling before enabling it.
4. Integrate the existing AI assistant into the new interface, then test its real error and loading states.
5. Enforce required images and moderation on the server, including later uploads and public-profile changes. Verify submission, Jakko's approval and subsequent public visibility in a suitable test environment. Preview tests are not evidence that production persistence or current admin access has been verified. Existing approved records are not automatically hidden, changed or deleted.
6. Reconcile the current project dates/content and image credits before release. Keep the current app available until Jakko approves the replacement.

## Validation performed

- JavaScript syntax and coverage of all new UI labels across six languages.
- Production source unchanged; preview files contain no API credentials or mutation requests.
- Desktop, tablet and narrow/mobile viewport checks using the actual draft app.
- Participant route with example details, back navigation, missing-photo feedback, local test image, review and simulated completion.
- Sponsor enquiry with sample content and simulated confirmation.

The 16 September revision additionally passes 210 offline route/language renders, seven full-content search checks, required-photo checks for all four participant roles, three partner-logo flows, the panel upload flow, private-enquiry isolation and visit-stable shuffle checks. Mocked server-function tests verify the four public queries request approved records. All preview network writes are blocked by the test harness; simulated submissions do not append public cards.

Run `JSDOM_PATH=/path/to/jsdom node scripts/check-preview.cjs` from the repository root. The optional QA dependency is kept outside the repository and is not needed to serve the preview. Regenerate the nine-file press archive with `node scripts/build-preview-press.cjs`; this uses Node and Python's standard ZIP library.

This folder can be served by any static web server. It needs no package installation or build step.

## Navigation revision after feedback

Jakko found the first design too long and hard to navigate. The homepage now introduces the project immediately and offers six audience entrances. Sponsors and organisations have separate pages; media gets prominent press-contact and gallery actions. A compact footer and expandable related topics replace long menus and the horizontally scrolling article navigation. These are preview-only interface changes, not backend changes.

The draft has been reviewed at 320px, 390px, 768px and a desktop viewport. The six audience routes remain available in a fixed mobile bar, with extra room for long organisation labels. Public totals load from the existing read endpoint, without hardcoded fallback counts. The homepage prioritises the project explanation and entrances, followed by the initiator on mobile. The press ZIP has been downloaded and checked against its source archive. The production deployment remains unchanged.

## Purpose revision after Jakko's clarification

Jakko asked for the strength of the entire worldwide wood flooring industry to be clear alongside the practical purpose. The start now uses four visible points rather than relying on visitors opening articles. The audience entrances sit together below them, and retain their fixed mobile navigation. Jakko's founder feature remains on the start page.

The journey order is explicit: make together, travel/show/involve people, and eventually donate after travelling. Makers may also lay the floor at the recipient location or locations. The work is never sold. Learning from each other, passing skills to younger generations and presenting the craft as art are reflected in the visitor, maker, organisation, sponsor and about pages, and in all six press sheets. The information search includes a direct result for the project purpose. These changes use Jakko's clarified intent; the original long-form stories have not been rewritten.

## Contributors without a panel

Contributors now have their own entrance next to makers, with the same prominence in the homepage grid and persistent navigation. They can support the project with time, knowledge, transport, communication, photography, translation or other skills without making a panel. Their promise to help three people and ask them to pass the help on is explicit on the homepage, contributor page, registration role card and all six press sheets. The existing `contributor` role is reused; no schema change is needed.

The contributor page links directly to the correct registration role. It also retains the participant and student options. Required photos and review before publication continue to apply. Mobile navigation uses two rows of three links to keep every audience readable and reachable. The repeated “art floor: One Artfloor” wording has been removed from the short introduction in all six languages. Original long-form source content is unchanged.

## Countries and contributions

The worldwide summary now separates makers, sponsors, organisations, contributors/helpers and media partners. Its country selector filters the group totals and follows through into the combined directory. The worldwide country total covers the union of approved participant, sponsor and organisation records. ISO codes and country names in all six supported languages are normalised before counting and filtering, so Nederland, Netherlands and NL are one country.

Makers are counted only when the existing registration type says Maker, case-insensitively. Other personal registrations appear under contributors/helpers, retaining their original role label: Contributor, Participant, Student or Initiator. Jakko is not silently reclassified as a maker. Organisations include trade bodies, associations and education; existing records are not assigned invented subtypes. People and organisations are shown in one shuffled list that stays stable while filtering and returning during the visit.

There is no separate approved public media endpoint or structured media category in the current reads. The media tile therefore shows a dash and explains that media are not yet counted separately. It opens an explanatory empty state and a media-profile registration simulation, requiring a logo and Jakko's approval. Private press enquiries remain separate from that draft. Production integration must add an explicit media category/public read and reviewed submission handling before enabling this flow; no existing organisation is guessed to be a media partner from its name or free text.

Failed reads remain unknown rather than becoming zero. The overview warns if results are partial, and available categories still work. Regression checks cover country aliases, combined totals, group/country links, stable order through filters, partial reads and media-draft isolation, in addition to the existing approval, image and no-write checks.
