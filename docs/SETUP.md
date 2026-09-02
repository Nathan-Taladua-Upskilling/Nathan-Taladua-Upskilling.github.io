# ABC Tutoring — setup & deploy

The site is plain HTML/CSS/JS. No build step. Everything configurable lives in
**`data/`**.

---

## 1. Preview locally

`fetch()` needs a real web server (opening the files directly will not load the
JSON). From the project folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 2. Fill in `data/config.json`

| key | what to put |
| --- | --- |
| `danaEmail` | Dana's real email (used for the "email us" fallback link). |
| `formEndpoint` | Where booking requests are sent — see step 3. |
| `sessionLengthMinutes` | Default session length for calendar events (60). |
| `googleCalendarEmbedSrc` | Embed URL of the shared calendar — see step 4. Leave `""` to hide the calendar section. |
| `googleCalendarShareLink` | Optional public link to the same calendar. |

---

## 3. Booking notifications — pick ONE

### Option A — FormSubmit (no account, fastest)

1. Set `formEndpoint` to `https://formsubmit.co/ajax/DANA_EMAIL` (use Dana's
   address).
2. Submit the booking form once. FormSubmit emails Dana a one-time confirmation
   link; she clicks it. After that, every booking is emailed to her with all
   fields: parent name & email, student first name & email, requested subject,
   tutor, date, time, and notes.
3. Getting the session onto the calendar: on the confirmation page, Dana (or the
   parent) clicks **Add to Google Calendar** and picks the shared ABC Tutoring
   calendar. That is what blocks the slot.

### Option B — Google Apps Script (auto calendar + email)

Use `docs/apps-script.gs`. It creates the calendar event automatically (no
manual click) and emails Dana. Follow the instructions at the top of that file,
then set `formEndpoint` to the deployed `/exec` URL.

---

## 4. Shared calendar

1. In Google Calendar, create a calendar named **ABC Tutoring**.
2. Settings for that calendar → **Make available to public** (view-only is fine).
3. Under *Integrate calendar*, copy the **Embed code**'s `src="..."` value into
   `googleCalendarEmbedSrc`.
4. For Option B above, also copy the **Calendar ID** into `docs/apps-script.gs`.

---

## 5. Tutors

Edit `data/tutors.json`. Each tutor needs `id` (url-safe), `name`, `color`,
`gradeLevels`, `subjects[]`, `email`, `phone`, `blurb`, and `availability[]`
(`day` must be a full weekday name; `slots` are display strings like `"4:00 PM"`).
The current emails/phones are placeholders.

---

## 6. Student progress (`progress.html`)

- Reached only from the footer link; not in the main menu.
- Edit `data/progress.json`. Use initials or a code per student.
- If real student data goes in here, **keep the GitHub repo private**, or move
  the data to a private Google Sheet.

---

## 7. Analytics

PostHog is wired in `js/analytics.js` with the project key. It assumes **US
Cloud**. If the PostHog project is on EU Cloud, change `api_host` to
`https://eu.i.posthog.com` and `ui_host` to `https://eu.posthog.com`.

---

## 8. Deploy (GitHub Pages)

```bash
git add .
git commit -m "Build ABC Tutoring site"
git push -u origin main
```

Repo name is `Nathan-Taladua-Upskilling.github.io`, so GitHub Pages serves it at
the root domain automatically. Confirm under **Settings → Pages** that the source
is `main` / root. First publish can take a minute.
