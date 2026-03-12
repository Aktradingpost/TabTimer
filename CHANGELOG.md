# TabTimer Changelog

---

## v2.8.15 — March 2026

### Bug Fixes
- **Fixed stuck "Every X Minutes" schedules not resuming correctly on startup** — When Chrome started and the health check repaired a stuck minutes-based schedule, it was jumping back to the original scheduled start time instead of resuming from right now. For example, a schedule set to run every 3 minutes originally at 9:49 AM would repair to 9:49 AM instead of "now + 3 minutes." The health check now correctly bases minutes and hourly intervals on the current time, matching the behavior already present in the rest of the extension.

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
- **Version number in header** — The management page header now shows the actual installed version number automatically pulled from the manifest.

### Bug Fixes
- **Fixed Quick Schedule from right-click not working** — "Quick: Tomorrow 7:00 AM" and "Quick: 1 hour from now" were failing silently on restricted pages. Both functions now wrap in try/catch so the schedule is always created.
- **Improved Quick Schedule notifications** — Higher priority, checkmark in title, and "1 hour from now" shows the actual target time.

---

## v2.8.1 — February 2026

### Bug Fixes
- Fixed Content Security Policy (CSP) violations — moved inline script from welcome.html into external welcome.js file
- Removed inline event handlers from options.html and replaced with CSS hover rules

---

## v2.8.0 — February 2026

### Critical Bug Fix
- Fixed recurring schedules only firing once

### New Features
- Auto-close in right-click dialog
- Advance notification reminder (seconds before tab opens)

### Bug Fixes
- Fixed advance reminder notification never firing
- Fixed tabs not opening after being edited
- Fixed edit modal showing wrong time (UTC vs local timezone)
- Fixed Every X Hours and Every X Minutes saving wrong interval values
- Fixed duplicate notifications

---

## v2.7.4 — February 2026
- Never Lock is now the default for all new schedules
- Premium repeat gating with PRO badge
- Trial expiry downgrade assistant
- Custom categories in right-click dialog

---

## v2.7.3 — February 2026
- CSV/Excel bulk import
- Sound notifications
- Advanced search, Shift+Click selection

---

## v2.0.0 — March 2025
- Complete UI redesign with sidebar navigation
- Premium licensing with 7-day free trial
- Bulk import, custom categories, advanced search
- Keyboard shortcuts, dark/light theme
- Backup and restore, desktop notifications
