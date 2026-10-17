# Participant email sign-in — rollout pending
This branch replaces number/email knowledge and the old upload_without_email exception with a Supabase-verified email session for panel lookup, photo upload and submission. Nothing grants access based on user metadata or a browser assertion. Existing registrations and numbers stay intact.

## Required before merging
- Configure custom SMTP in Supabase. The built-in mail sender only reaches organization team addresses and is not production delivery.
- Keep email confirmation enabled. Set Site URL to https://unitedwoodfloorlayers.com and allow exactly https://unitedwoodfloorlayers.com/participant-login.html as a redirect. Retain other needed existing URLs.
- Set an appropriate JWT lifetime (initial target one hour). Only the access token is retained in sessionStorage for the tab; refresh tokens are discarded. Sign out clears this tab's token, not all provider sessions.
- Set PARTICIPANT_EMAIL_LOGIN_READY=true in Netlify Functions only after the sender and redirect settings are tested. This only enables requesting mail; the new authorization always rejects unauthenticated uploads.
- Complete a real mailbox flow and verify expired/reused links and a different participant's number. No automated real emails are sent by the offline test suite.
- Resolve onboarding for the 34 existing registrations without email. An administrator must establish identity before attaching an address; a visitor cannot claim a number. No participant email addresses have been invented, imported or changed by this branch.
- Add the chosen provider's domain verification and sending limits. Review Supabase Auth rate limits. Request route uses CAPTCHA and a per-instance IP throttle; it is not a distributed abuse limit.

## Behavior
The upload form requests a one-time email link. A matching registration is required for this route to ask Supabase to send mail. Unknown combinations return the same generic success notice and do not send mail. Provider errors are generic. Links go to a dedicated callback page without external scripts, are removed from browser history immediately, and require an explicit Continue action. A server call to Supabase Auth /user validates every protected operation, and the returned confirmed email must match the registration's current email.

The existing Google Apps Script notification sender is not used for authentication secrets. Supabase Auth owns one-time verification, expiry and signing; the application does not mint its own login tokens. No public database grants or RLS changes are required.

The design preview continues to use sample data; production assets contain the login UI. Do not merge this branch before setup: doing so would lock participants out of uploads until SMTP, email mapping and the readiness variable are completed.

## References
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
