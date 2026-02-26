# TabTimer Changelog

---

## v2.8.0 — February 2026

### Critical Bug Fix
- **Fixed recurring schedules only firing once** — Every X Minutes, Every X Hours, Daily, and all other recurring schedules were getting permanently stuck after firing the first time. Root cause: the reschedule logic depended on `autoRelockAt` being set, but Never Lock schedules (`lockMinutes = 0`) never set `autoRelockAt`, so the schedule sat with `opened = true` forever and never fired again. Fix: recurring Never Lock schedules now reschedule themselves immediately when the tab opens, without needing the relock path
- **Improved health check** — Repair Stuck Schedules now also catches the `opened = true + Never Lock + recurring` pattern and fixes it automatically on startup, so any previously stuck schedules repair themselves when Chrome restarts

### New Features
- **Auto-close in right-click dialog** — the "Auto-close tab after opening" option is now available when scheduling via right-click on any page, matching what was already in Add New and Edit. All three entry points are now consistent
- **Advance notification reminder** — get notified X seconds before a tab opens (default 10 seconds). Set to 0 in Settings to disable. Only one notification fires per tab open — the reminder suppresses the tab-open notification so you never get doubled up
- **Notification reminder in seconds** — changed from minutes to seconds for finer control (10 sec, 30 sec, 2 min = 120, etc.)

### Bug Fixes
- Fixed advance reminder notification never firing — `notifMinutes` variable was still referenced after being renamed to `notifSeconds`
- Fixed tabs not opening after being edited — saving an edit now resets `opened = false` and `reminderSent = false`
- Fixed edit modal showing wrong time — was using UTC instead of local timezone
- Fixed edit modal showing a past time for recurring schedules — now auto-advances to the next upcoming occurrence
- Fixed Every X Hours and Every X Minutes saving wrong interval values — now reads directly from the visible input at save time
- Fixed duplicate notifications — "Opened" notification is now suppressed when a reminder already fired for that occurrence
- Fixed notification default changed from 5 minutes to 10 seconds

### Improvements
- Schedule list shows **⏱️ Auto-close: X min** badge for any schedule with auto-close enabled
- Notification reminder label simplified to "Notification reminder" with "seconds before tab opens" inline
- Helper text: "Set to 0 to disable advance reminders"
- `reminderSent` flag now resets whenever a schedule reschedules itself

---

## v2.7.4 — February 2026

### New Features
- **Never Lock is now the default** — all new schedules open like normal tabs, no overlay
- **Premium repeat gating** — Weekdays, Weekends, and all advanced repeats are Premium-only with PRO badge and trial prompt for free users
- **Trial expiry downgrade assistant** — one-click conversion of Premium repeat schedules to nearest free option when trial expires
- **Custom categories in right-click dialog** — categories created in management appear in the right-click dialog automatically
- **How TabTimer Works notice** — info banner explaining Chrome profile requirement, with "Hide for now" / "Don't show again" dismiss options (re-enable in Settings)
- **Management page auto-refreshes** when a schedule is created from another tab

### Bug Fixes
- Fixed schedule dialog not appearing on Facebook, Instagram, and similar sites
- Fixed management page opening unexpectedly on some sites
- Fixed Excel/CSV import pulling in example template rows
- Fixed Excel time decimals and date serial number values
- Fixed Schedule/Cancel buttons becoming unresponsive after dialog was rebuilt
- Fixed right-click dialog defaulting to 5-minute lock instead of Never
- Fixed Every X Hours saving 6 hours instead of user's chosen value — `hourlyInterval`, `minuteInterval`, `customDays`, `specificDates` were not being saved in `createLock`

---

## v2.7.3 — February 2026
- CSV/Excel bulk import
- Clickable Notes badge
- Temporary unlock options
- Advanced search
- Shift+Click selection
- Sound notifications
- 1-hour grace period for missed tabs
- Staggered opening for multiple missed tabs

---

## v2.0.0 — March 2025
- Complete UI redesign with sidebar navigation
- Premium licensing with 7-day free trial
- Bulk import, custom categories, advanced search
- Keyboard shortcuts, dark/light theme
- Backup and restore, desktop notifications
- Lock overlay with countdown and temporary unlock
