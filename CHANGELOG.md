# TabTimer Changelog

---

## v2.8.26 — March 2026

### Bug Fixes
- **Fixed "Leave a Review" link** — corrected extension ID in the sidebar review link, Settings page review card, and uninstall page so all review links now point to the correct Chrome Web Store listing
- **Fixed uninstall feedback form** — replaced broken mailto link with Web3Forms so feedback is delivered directly to TabTimerPro@gmail.com without requiring a default email app

---

## v2.8.25 — March 2026

### Bug Fixes
- **Fixed Google Drive History duplicating rows on every sync** — export now reads existing URLs directly from the sheet to detect duplicates instead of relying on `gdriveHistoryIds` in local storage which was wiped on reinstall; schedules are deduplicated by URL+Name so no row is ever added twice
- **Fixed expired schedules being written to Notes column instead of Status column** — expired schedule detection was incorrectly writing "Expired" to column L (Notes) instead of column K (Status); fixed in both manual export and auto-sync
- **Expired schedules now stay in History forever** — rows are never deleted from the History tab; when a schedule expires or is deleted from TabTimer it is marked "Expired" in the Status column and highlighted in light pink so it is easy to see at a glance
- **Expired rows turn light pink automatically** — when a schedule is marked Expired in the History sheet its entire row is colored light pink/red so expired entries stand out visually without any manual formatting

---

## v2.8.24 — March 2026

### New Features
- **Import from Drive (PRO)** — new button in Backup/Sync reads your TabTimer History sheet from Google Drive and imports all Active schedules back into TabTimer; skips expired rows and deduplicates both against existing schedules and within the import list itself; shows a preview modal with count of what will be imported before confirming

### Improvements
- **Import reads from History tab** — import correctly reads the permanent History tab (not Active Schedules tab) so it works even on a fresh install with no schedules yet
- **Within-batch deduplication** — if the same URL appears multiple times in the History sheet, only the first occurrence is imported

---

## v2.8.23 — March 2026

### Improvements
- **Extension ID locked** — manifest now includes the public key so Load Unpacked always uses the same extension ID (`doldjjkenhkdgibacbenanejmfjoifoj`) as the Chrome Web Store version; only one OAuth Client ID needed forever
- **License key persists across reinstalls** — your PRO license key is now saved to `chrome.storage.sync` (tied to your Google account) so it is automatically restored after uninstalling and reinstalling — you never have to re-enter your license key again
- **Trial abuse prevention improved** — trial status also stored in sync storage; users who have used their free trial cannot get another one by reinstalling

---

## v2.8.22 — March 2026

### Bug Fixes
- **Google Drive connection fixed for Chrome Web Store users** — updated OAuth Client ID to match the published Chrome Web Store extension ID; Google Drive History now connects correctly for all users who installed from the Chrome Web Store

---

## v2.8.21 — March 2026

### New Features
- **Google Drive History (FREE + PRO)** — export your full schedule history to a Google Sheet in your own Google Drive; keeps a permanent record of all schedules including expired and deleted ones so you can look back and see how many times you visited any site
- **History tab in Google Sheet** — every schedule ever created is logged permanently; expired or deleted schedules are marked "Expired" rather than removed
- **Active Schedules tab in Google Sheet** — a live snapshot of everything currently scheduled, refreshed every sync
- **Manual Export to Drive (FREE)** — connect your Google account and export with one click at any time
- **Auto-sync to Google Drive (PRO)** — syncs immediately whenever a schedule is added, edited, or deleted, plus a full daily refresh as a safety net
- **Reset & Recreate Sheet button** — deletes and recreates your TabTimer History sheet from inside TabTimer without needing to go to Google Drive manually
- **Pastel header row** — Google Sheet headers use a soft pastel blue with frozen first column and frozen header row for easy scrolling
- **Expire Time field** — new optional date/time field on Add New, Edit, Right-click, and Bulk Import that silently deletes a schedule at an exact date and time, independent of the date-in-name system
- **Bookmark import expire time popup** — when importing a bookmark folder, any bookmark with a date in the name shows a popup asking for a specific expire time on that date
- **Text URL import pipe format** — text URL import now supports `https://example.com | 2026-03-31 09:00` format for individual expire times per URL
- **Take focus when opening (🎯)** — new per-schedule checkbox in Add New and Edit that overrides the global background setting so a specific tab comes to the front when it opens
- **Device Transfer section** — renamed and relabeled Cloud Sync to "Device Transfer" with clearer honest description explaining it is a manual file transfer, not automatic syncing
- **⭐ Leave a Review** — review link added to sidebar, Settings page card, and uninstall page (shown after 4–5 star feedback)
- **Auto health check on page open** — stuck schedules are silently repaired every time the management page opens; a toast shows only if something was actually fixed
- **Trial abuse prevention** — trial usage is now stored in `chrome.storage.sync` which persists across uninstalls and reinstalls for Chrome Web Store users

### Bug Fixes
- **Schedules no longer open a day early** — Health Check now correctly leaves schedules with future start dates untouched instead of advancing them forward
- **Expire Time loop fix** — expireTime deletions no longer corrupt the main schedule loop; expired schedules are collected first, deleted together, then the loop exits cleanly
- **Test Notification fixed** — now uses a unique ID each time and shows a toast confirming success or explaining failure
- **Unlimited/Every X Minutes schedules no longer interrupted** — fixed a bug where inline deletions during the check loop affected recurring schedules
- **Auto-sync PRO check fixed** — now correctly reads the license object instead of checking wrong storage keys, so PRO users can enable auto-sync without being incorrectly blocked
- **Backup filenames now use local date** — manual backup, device transfer export, and auto-backup downloads all use your computer's local date instead of UTC, fixing the "tomorrow's date" bug for Alaska and other UTC-offset timezones
- **Welcome page review button removed** — the Leave a Review button on the welcome page has been removed as it linked to an incorrect page



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
