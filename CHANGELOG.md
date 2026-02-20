# TabTimer Changelog

---

## v2.7.5 — February 2026

### New Features
- **Auto-close in right-click dialog** — the "Auto-close tab after opening" option is now available when scheduling via right-click on any page, matching what was already available in the Add New form and Edit modal. All three entry points are now consistent
- **Advance notification reminder** — get a notification X seconds before a scheduled tab opens (default 10 seconds). Set to 0 in Settings to disable. Only one notification fires per tab open — if the reminder was sent, the tab-open notification is suppressed
- **Notification reminder in seconds** — the reminder setting changed from minutes to seconds for finer control (e.g. 10 seconds, 30 seconds, 2 minutes = 120)

### Bug Fixes
- Fixed advance reminder notification never firing — `notifMinutes` variable was still referenced after being renamed to `notifSeconds`, causing the condition to always be false
- Fixed tabs not opening after being edited — saving an edit now resets `opened = false` and `reminderSent = false` so the schedule fires fresh
- Fixed edit modal showing wrong time — `toISOString()` returns UTC which showed the wrong local time in the edit form. Now correctly converts to local timezone before populating the field
- Fixed edit modal showing a past time for recurring schedules — the edit form now auto-advances to the next future occurrence so users always see an upcoming time
- Fixed Every X Hours and Every X Minutes saving wrong values — interval values now read directly from the visible input at save time instead of from hidden fields that could be stale
- Fixed duplicate notifications — removed the second "Opened" notification that fired immediately when a tab opened if a reminder had already been sent for that occurrence
- Fixed notification default changed from 5 minutes to 10 seconds

### Improvements
- Schedule list now shows **⏱️ Auto-close: X min** badge for any schedule with auto-close enabled
- Notification reminder setting label simplified to just "Notification reminder" with "seconds before tab opens" inline label
- Helper text added under notification reminder: "Set to 0 to disable"

---

## v2.7.4 — February 2026

### New Features
- **Never Lock is now the default** — all new schedules open pages like normal tabs with no lock overlay
- **Premium repeat types** — Weekdays, Weekends, and all Other options are now Premium-only with a PRO badge and trial prompt for free users
- **Trial expiry downgrade assistant** — one-click conversion of Premium repeat schedules to nearest free option when trial expires
- **Custom categories in right-click dialog** — categories created in management page appear in the right-click dialog automatically
- **All repeat options in right-click dialog** — Other dropdown now includes Every X Minutes, Every X Hours, Custom Days, and Specific Dates
- **Weekends** added to repeat options in right-click dialog
- **How TabTimer Works notice** — info banner on schedules page explaining Chrome profile requirement, with Hide for now / Don't show again dismiss options
- **Management page auto-refreshes** when a schedule is created from another tab
- **getLicense message handler** in service worker for real-time premium status in right-click dialog

### Bug Fixes
- Fixed schedule dialog not appearing on Facebook, Instagram, and similar sites
- Fixed management page opening unexpectedly when right-clicking on some sites
- Fixed Excel/CSV import importing example template rows
- Fixed Excel time values displaying as decimals instead of HH:MM:SS
- Fixed Excel date values displaying as serial numbers instead of YYYY-MM-DD
- Fixed Schedule/Cancel buttons becoming unresponsive after dialog was built (innerHTML replacement was destroying event listeners)
- Fixed right-click dialog defaulting to 5-minute lock instead of Never
- Fixed Every X Hours saving 6 hours instead of the user's chosen value — `hourlyInterval`, `minuteInterval`, `customDays`, and `specificDates` were not being saved to storage in `createLock`
- Fixed `saveLocks` bulk handler added to service worker for batch operations

### Improvements
- Import template downloads completely blank with no example rows
- Default lock changed to Never across all entry points
- Premium repeat options grouped under ⭐ Premium optgroup in Add New form

---

## v2.7.3 — February 2026

### New Features
- CSV/Excel bulk import
- Clickable Notes badge
- Temporary unlock options
- Advanced Search
- Shift+Click selection
- Sound notifications
- 1-hour grace period for missed tabs
- Staggered opening for multiple missed tabs

---

## v2.0.0 — March 2025

### Major Release
- Complete UI redesign with sidebar navigation
- Premium licensing with 7-day free trial
- Bulk import from text, CSV/Excel, and bookmarks
- Custom categories with color coding
- Advanced search with date range filters
- Keyboard shortcuts
- Dark/Light theme
- Backup and restore
- Desktop notifications
- Lock overlay with countdown and temporary unlock
