# Training Center — Offline Web App (HTML + CSS + Vanilla JS)

A complete, offline-first training center management system built with **only HTML5, CSS3, and vanilla
JavaScript** — no React, no build tools, no backend, no server, no PHP/Node/ASP.NET, no database server, no
API, no login, and no internet connection required.

All data is stored permanently in your browser using **IndexedDB**. Close the browser, restart your computer,
come back next week — everything is still there.

## How to run it

There is nothing to install or build. Just open **`index.html`** directly in a modern desktop browser
(Chrome, Edge, or Firefox all work well) — double-click the file, or drag it into an open browser window.

That's it. The whole app — dashboard, students, courses, schedule, attendance, payments, finance, reports,
materials, notes, tasks, settings — runs from that one file plus its `style.css` and `js/` folder, entirely
offline.

> **Tip:** for the smoothest experience (especially opening uploaded PDFs/images/videos in new tabs), keep the
> `index.html`, `style.css`, and `js/` folder together in the same folder — don't separate them.

## Project structure

```
training-center-vanilla/
├─ index.html          # App shell: sidebar, header, content area, modal, toasts
├─ style.css            # All styling: glassmorphism cards, dark/light themes, RTL, responsive layout
└─ js/
   ├─ db.js              # IndexedDB wrapper (generic CRUD over all data stores)
   ├─ i18n.js              # English & Arabic dictionaries + language/RTL switching
   ├─ utils.js              # Toasts, modals, formatting, CSV export, print-to-PDF, file helpers
   ├─ charts.js              # Small dependency-free SVG bar & pie chart renderer
   ├─ dashboard.js            # Dashboard page
   ├─ courses.js               # Courses page
   ├─ students.js                # Students page
   ├─ schedule.js                 # Weekly schedule page
   ├─ attendance.js                # Attendance page
   ├─ payments.js                    # Payments page
   ├─ finance.js                      # Finance page
   ├─ reports.js                       # Reports page
   ├─ materials.js                      # Course materials page
   ├─ notes.js                           # Notes page
   ├─ tasks.js                            # Tasks page
   ├─ settings.js                          # Settings page
   └─ app.js                                # Bootstraps everything: nav, theme, router
```

Each page is its own self-contained module (an IIFE) with a `render()` function, so you can open any single
file and understand that one feature without reading the rest of the app.

## Where your data lives

Everything is stored in your browser's **IndexedDB**, in a database called `training_center_db`, scoped to
wherever you're opening the file from. Uploaded course material files (PDF, images, videos, ZIP, PowerPoint,
Word, source code) are stored as binary Blobs directly inside IndexedDB too — no separate file management
needed, and no size surprises since browsers typically allow IndexedDB to grow into the hundreds of MB or more
(you'll get a native permission prompt if a browser wants to ask before allocating more storage).

**Important:** browser data is tied to the browser profile and the exact file location you open it from.
Don't move `index.html` to a different folder/drive expecting old data to follow it there automatically — use
the backup/restore feature below when you need to migrate.

## Backup & Restore

Go to **Settings → Backup Data** to download a single `.json` file containing every student, course, class,
attendance record, payment, finance entry, note, task — and yes, your uploaded course material files too
(embedded as base64 inside the JSON). Keep that file anywhere: a USB drive, cloud-synced folder, email to
yourself — it's just a plain file.

Use **Settings → Restore Data** to load a previously saved backup. This is also how you'd move your data to a
new computer or browser: back up on the old one, copy the `.json` file over, restore on the new one.

## Language & RTL

Click the language button in the top bar (or go to Settings) to switch instantly between **English (LTR)** and
**Arabic (RTL)** — the whole layout mirrors itself (sidebar, forms, tables, spacing) using native CSS logical
properties, not a bolted-on RTL hack. All UI text is translated via `js/i18n.js`; add more languages there if
you ever want to.

## Dark / Light Mode

Toggle instantly from the top bar or Settings. Your preference is remembered for next time.

## About PDF & Excel export (a transparency note)

Real `.pdf` and `.xlsx` file formats are binary formats that aren't practical to hand-roll in a few lines of
vanilla JavaScript without pulling in a library — and you asked specifically for **zero dependencies and
frameworks**. So, to keep this project 100% pure HTML/CSS/JS with nothing to download or vendor:

- **"Export PDF"** opens a clean, print-formatted report in a new tab and triggers your browser's native print
  dialog — choose **"Save as PDF"** as the destination (built into every modern browser, works fully offline).
- **"Export Excel"** downloads a `.csv` file, which Excel opens natively with one double-click.

Both are zero-dependency, 100% offline, and require nothing beyond what your browser already has.

## Charts

The dashboard and finance charts (income vs. expenses, expenses by category) are drawn with a small custom SVG
renderer in `js/charts.js` — no charting library, ~80 lines of vanilla JS.

## Browser storage note

A small number of browsers, under very strict privacy settings, can block `localStorage` (used only for your
theme/language *preference*, not your actual data) when a page is opened via `file://`. The app detects this
and falls back gracefully to an in-memory default for that session — your actual data (students, payments,
etc.) always uses IndexedDB, which works reliably under `file://` in Chrome, Edge, and Firefox.

## Everything included

- **Dashboard** — total students, total courses, today's classes, monthly income/expenses/profit, income vs.
  expense chart, recent activity feed
- **Students** — add/edit/delete, search, photo upload, phone, parent phone, age, course, enrollment date,
  notes, payment status
- **Courses** — add/edit/delete, price, duration, sessions, description, color tag
- **Weekly Schedule** — Saturday → Friday board, add/edit/delete classes with time, classroom, course, notes
- **Attendance** — mark present/absent per day, full history, per-student attendance percentage
- **Payments** — record payments, live remaining-balance, payment history, paid/partial/unpaid status
- **Finance** — income & expenses, categorized expenses, pie chart, automatic monthly profit
- **Reports** — daily/weekly/monthly/yearly views, export to PDF (print) and Excel (CSV)
- **Course Materials** — upload & organize PDFs, PowerPoint, Word, images, videos, ZIP, and source-code files
  per course, stored locally, open in a new tab
- **Notes** — daily notes, student notes, general reminders
- **Tasks** — to-do list with due dates and priority
- **Settings** — dark/light mode, English/Arabic with instant RTL switch, backup & restore

Everything runs 100% offline, in your browser, forever — no accounts, no installs, no internet required.
