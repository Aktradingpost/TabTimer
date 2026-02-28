# TabTimer Changelog

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
