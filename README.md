# ABC Tutoring

Marketing + booking site for Dana's tutoring business. Static (HTML/CSS/JS),
hosted on GitHub Pages. No backend required.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — pitch, how it works, shared availability calendar. |
| `tutors.html` | Tutor list with subjects, grade levels, availability, contact, and a subject filter. |
| `book.html` | Booking form. Pre-selects a tutor via `?tutor=<id>`, and only offers times that match that tutor's availability for the chosen date. |
| `booking-confirmed.html` | Request summary + "add to calendar" links. |
| `progress.html` | Dana-only view of how students' grades have moved. Footer link, not in the menu. |
| `404.html` | Friendly not-found page. |

## What happens on a booking

The form collects parent name & email, student first name & email, requested
subject, tutor, date, time, and optional notes. On submit it posts to
`formEndpoint` (`data/config.json`), which emails Dana **all of those fields**.
The confirmation page then offers one-click **Add to Google Calendar** / `.ics`
so the session lands on the shared ABC Tutoring calendar and the slot shows as
busy on the home page. See `docs/SETUP.md` for the optional Apps Script that does
the calendar step automatically.

## Configure & deploy

Everything editable is in `data/`. Full instructions: **`docs/SETUP.md`**.

## Analytics

PostHog (`js/analytics.js`), US Cloud by default.
