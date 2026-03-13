# TabTimer Changelog

---

## v2.8.20 — March 2026

### Bug Fixes
- **Category emoji updates instantly** — editing a category emoji now refreshes the sidebar and Manage Categories list immediately without requiring a page reload

---

## v2.8.19 — March 2026

### New Features
- **Mon–Sat repeat type (PRO)** — new repeat option that fires every day except Sunday, perfect for mail-in sweepstakes postmark dates
- **Custom category emojis in sidebar** — user-created categories (Mail, Phone, Unlimited, etc.) now show their chosen emoji in the left sidebar
- **Edit categories** — all categories now have an ✏️ Edit button to change the emoji, name, or color at any time; default categories (Daily, Weekly, etc.) can be edited but not deleted
- **Missing categories auto-restored on import** — when importing a backup, any category names used in schedule entries are automatically created as category objects if they are missing, so Mail, Phone, and Unlimited always appear in Manage Categories after a restore

### Bug Fixes
- **Categories page refreshes after import** — Manage Categories now updates immediately after a backup import without requiring a manual page reload

---

## v2.8.18 — March 2026

### Bug Fixes
- **Right-click Schedule dialog fully restored** — resolved a JavaScript syntax error that caused the entire content script to fail silently, breaking all right-click scheduling on every website
- **Notes field in right-click dialog (PRO)** — paste entry instructions or reminders directly when scheduling from any page

---

## v2.8.15 — March 2026

### Bug Fixes
- **Fixed stuck Every X Minutes and Every X Hours schedules** — the health check repair system now correctly resets minutes and hourly recurring schedules instead of getting stuck in an infinite loop

---

## v2.8.14 — March 2026

### New Features
- **Notes field on Add New form (PRO)** — add notes when creating a schedule from the main dashboard
- **Specific Dates in Edit modal** — editing a schedule with the Specific Dates repeat type now correctly loads and saves the date list

### Bug Fixes
- **Notes preserved on edit** — notes are now shown and saved correctly when editing an existing schedule

---

## v2.8.11 — March 2026

### Bug Fixes
- **Import backup no longer overwrites premium license** — restoring a backup now preserves your active premium license key; only trial info is restored if no paid license is present

---

## v2.8.8 — March 2026

### Bug Fixes
- **Fixed "No current window" error** — schedules no longer fail to open tabs when all Chrome windows are minimized; TabTimer now restores or creates a window automatically before opening the tab

---

## v2.8.2 — February 2026

### New Features
- **Version number in header** — the management page header now shows the actual installed version number pulled from the manifest automatically

### Bug Fixes
- **Fixed Quick Schedule from right-click not working** — Quick: Tomorrow 7:00 AM and Quick: 1 hour from now were failing silently on restricted pages (Facebook, Instagram, etc.); both now work reliably regardless of what page you are on
- **Improved Quick Schedule notifications** — notifications now show at higher priority with a checkmark in the title; 1 hour from now shows the actual target time

---

## v2.8.1 — February 2026

### Bug Fixes
- Fixed Content Security Policy (CSP) violations — moved inline script from welcome.html into external welcome.js file
- Removed inline event handlers from options.html and replaced with CSS hover rules

---

## v2.8.0 — February 2026

### Critical Bug Fix
- Fixed recurring schedules only firing once — recurring Never Lock schedules now reschedule themselves immediately when the tab opens

### New Features
- Auto-close in right-click dialog
- Advance notification reminder (seconds before tab opens)
- Notification reminder in seconds for finer control

### Bug Fixes
- Fixed advance reminder notification never firing
- Fixed tabs not opening after being edited
- Fixed edit modal showing wrong time (UTC vs local timezone)
- Fixed edit modal showing past time for recurring schedules
- Fixed Every X Hours and Every X Minutes saving wrong interval values
- Fixed duplicate notifications

---

## v2.7.4 — February 2026
- Never Lock is now the default for all new schedules
- Premium repeat gating with PRO badge
- Trial expiry downgrade assistant
- Custom categories in right-click dialog
- How TabTimer Works notice banner
- Management page auto-refreshes on new schedule

---

## v2.7.3 — February 2026
- CSV/Excel bulk import
- Clickable Notes badge
- Temporary unlock options
- Advanced search, Shift+Click selection
- Sound notifications
- 1-hour grace period, staggered opening

---

## v2.0.0 — March 2025
- Complete UI redesign with sidebar navigation
- Premium licensing with 7-day free trial
- Bulk import, custom categories, advanced search
- Keyboard shortcuts, dark/light theme
- Backup and restore, desktop notifications
