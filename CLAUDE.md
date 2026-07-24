# Briefing — UWFL Pay It Forward

**If you are an AI assistant working on this repository, read this file first.**
It explains what this project is and how to work on it safely.

---

## The project

United Wood Floor Layers — "Pay It Forward" is a worldwide collective art project.
Wood floor layers and others each make a wooden panel within a shared frame, and
promise to help three people, who then pass it forward.

- **Live app:** app.unitedwoodfloorlayers.com
- **Repository:** Jakkowoudenberg/uwfl-pay-it-forward
- **Hosting:** Netlify. The site redeploys automatically when `main` changes.
- **Initiator:** Jakko Woudenberg (Dutch Wood Artist®), Netherlands
- **Kickoff:** NWFA Expo, Texas, 27–29 April 2027

## What it is about

Reading the code tells you what the app says. It does not tell you why. So:

- **Not a product, not a business.** Nobody pays, nobody earns. It exists to
  connect craftspeople and to pass kindness on.
- **Everyone is welcome:** masters, hobbyists, students, schools, families,
  first-timers. Never write in a way that makes professionals sound more
  welcome than beginners.
- **Every maker builds at least 1 m²** within a shared frame, and promises to
  help three people.
- **Apolitical and non-religious.** If a text drifts that way, steer it back to
  craftsmanship and human connection.
- **Tone:** warm, direct, human. Never corporate, never marketing language,
  never inflated claims.
- **Participant data is sensitive.** Emails and phone numbers are never shown
  publicly. Never write anything that would expose them, and never put real
  participant data into a chat.

> If a change would alter what the project *means* rather than how it *works*,
> say so and let Jakko decide. Wording is yours to propose; intent is his.

## How the code is organised

- Almost everything lives in one large file: `index.html` (~740 KB).
- Serverless functions are in `netlify/functions/`.
- Six languages: **EN, NL, ES, FR, DE, IT**. Each has its own block inside the
  `LANG` object, containing `ql` labels (the quick-link buttons) and `cards`
  (the info panels).
- Beyond those six, the app machine-translates the interface on demand.
- The admin panel (key button) is the moderation queue for new sign-ups. It
  authenticates against a shared `ADMIN_KEY` environment variable.

## How to submit changes

`main` is protected and requires review. **Never push to `main` directly** —
it will be rejected. Always:

1. Create a new branch with a short, descriptive name.
2. Commit the change to that branch.
3. Open a pull request against `main`, with a clear title and a description of
   what changed and why.
4. Give the pull request link to the person you are working with, so Jakko can
   review and approve it.

Jakko is the repository owner and pushes to `main` directly; everyone else goes
through a pull request.

## Technical notes

- `index.html` is over 700 KB, so the GitHub **Contents API returns empty
  content** for it. Use the **Git Data API** (blobs / trees / commits) instead.
- Before editing, fetch the current file and confirm that the exact text you
  intend to replace actually appears in it.
- **When changing something per language, match each language block
  separately.** Searching forward from a single index lands every insertion in
  the first block — a mistake that has already been made once.
- Validate the JavaScript before submitting.
- The file is large, so you will read parts of it rather than all of it. Do not
  assume you have seen the whole picture. When in doubt, look before changing.
- Refresh the file SHA immediately before pushing; a stale SHA causes a 409.

## Working style

The people directing this work are not programmers. Explain in plain English,
not in code. Do the work yourself rather than handing steps back.

---

*Keep this file up to date. If something here is no longer true, fixing it is
part of the change.*
