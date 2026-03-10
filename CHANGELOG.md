# TabTimer Changelog

---

## v2.8.14 — March 2026

### New Features
- **Notes in right-click dialog** — Pro users can now paste entry instructions or reminders directly into the Schedule dialog when right-clicking any page. Free users see the Notes field locked with a "Notes are available with the Pro Version" message.
- **Notes on Add New form** — Pro users see a full Notes textarea on the Add New Schedule management page form. Free users see it locked with an Upgrade to Pro link.

### Bug Fixes
- **Fixed Specific Dates not showing in Edit modal** — The Edit modal was missing the Specific Dates option in the Repeat Type dropdown entirely, and had no field to display saved dates. Both are now present and pre-populate correctly when editing an existing schedule.

---

## v2.8.11 — March 2026

### Bug Fixes
- **Fixed premium license reset on backup import** — Importing a backup no longer overwrites a valid Premium license key. The extension now checks for an existing validated license before restoring any license data from the backup.
- **Fixed "No current window" error** — Scheduled tabs now open correctly even when Chrome is minimized or has no active window. TabTimer now finds or creates a window automatically before opening any tab.

---

## v2.8.2 — February 2026

### New Features
- **Version number in header** — The management page header now shows the actual installed version number (e.g. v2.8.2) automatically pulled from the manifest. It will always be correct with every future update — no more hardcoded version text

### Bug Fixes
- **Fixed Quick Schedule from right-click not working** — "Quick: Tomorrow 7:00 AM" and "Quick: 1 hour from now" were failing silently on many websites because `sendMessage` threw an uncaught error on restricted pages (Facebook, Instagram, etc.) before the schedule could be confirmed. Both functions now wrap in try/catch and the sendMessage error is safely ignored — the schedule is always created regardless of what page you're on
- **Improved Quick Schedule notifications** — notifications now show at higher priority, include a ✅ checkmark in the title, and "1 hour from now" now shows the actual target time (e.g. "Scheduled: 1 hour from now at 3:45 PM")

---

## v2.8.1 — February 2026

### Bug Fixes
- Fixed Content Security Policy (CSP) violations — moved inline script from welcome.html into external welcome.js file
- Removed onmouseover/onmouseout inline event handlers from options.html and replaced with CSS hover rules

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
