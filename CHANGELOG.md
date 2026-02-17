# TabTimer Changelog

All notable changes to TabTimer will be documented in this file.

---

## [2.7.1] - 2026-02-17

### Fixed
- CSV/Excel import category dropdown now properly populates with all categories

---

## [2.7.0] - 2026-02-17

### Added
- **CSV/Excel Import** (Premium) - Import schedules from .csv, .xlsx, and .xls files
  - Drag & drop file upload
  - Preview imported data before confirming
  - Download template CSV
  - Supports columns: url, name, category, time, date, recurring, repeat, notes
  - Smart defaults for missing values

---

## [2.6.3] - 2026-02-17

### Fixed
- **Snooze/Temporary Unlock** - Now correctly unlocks page temporarily instead of delaying the lock
  - "Unlock temporarily for 15 min" now lets you access the page for 15 minutes
  - Lock automatically re-engages after the snooze period
  - Changed label from "Snooze for" to "Unlock temporarily for" for clarity

---

## [2.6.2] - 2026-02-17

### Fixed
- Notes modal "Edit" button now properly opens the Edit modal

---

## [2.6.1] - 2026-02-17

### Added
- **Clickable Notes Badge** - Click the 📝 Notes badge to view notes without opening Edit modal
  - Notes viewer shows schedule name, URL, and full notes content
  - "Edit" button to modify notes directly from viewer

---

## [2.6.0] - 2026-02-17

### Added
- **Advanced Search Improvements**
  - "Search By" dropdown: Scheduled Time, Expiration Date (in name), or Either
  - Search by expiration dates in schedule names (YYYY-MM-DD format)
  - Fixed timezone issues in date filtering

---

## [2.5.2] - 2026-02-17

### Fixed
- Import backup now correctly marks future schedules as Active (not Opened)
- Past recurring schedules automatically reschedule to next occurrence on import

---

## [2.5.1] - 2026-02-17

### Changed
- Notes badge now shows bright yellow background for better visibility

---

## [2.5.0] - 2026-02-17

### Added
- **Shift+Click Range Selection** - Select multiple schedules by clicking first and shift-clicking last
- **Ctrl+Click Multi-Selection** - Add/remove individual items from selection
- **Click anywhere on row** to select (not just checkbox)
- **Notes Field** (Premium) - Add notes to any schedule
  - 📝 badge appears when schedule has notes
  - Hover to preview, click Edit to modify
- **Play Sound in Edit Modal** - Toggle sound when editing schedules
- **Bottom Padding** - Last schedule no longer hidden by bulk actions bar

### Changed
- Selection shortcuts added to keyboard shortcuts modal

---

## [2.4.0] - 2026-02-17

### Fixed
- **Sound Notifications** - Now uses Offscreen API for reliable audio playback
  - Sounds play correctly when tabs open from bulk import
  - Works regardless of which page is being opened

### Added
- offscreen.html and offscreen.js for audio handling
- "offscreen" permission in manifest

---

## [2.3.0] - 2026-02-17

### Added
- **Staggered Missed Tab Opening** - When Chrome opens late, tabs open sequentially
  - Default 15 seconds between each tab
  - Configurable stagger interval in Settings
- **1-Hour Grace Period** - Default changed from 2 minutes to 1 hour
- **0-Minute Auto Re-lock** - Can now set default to "Never" (0 minutes)

---

## [2.2.0] - 2026-02-17

### Added
- **Schedule Health Check** - Comprehensive check on startup
  - Fixes stuck recurring schedules
  - Removes duplicates
  - Clears orphaned alarms
  - Manual trigger in Backup/Sync
- **Cloud Sync** (Premium) - Export/import for cross-device sync
- **Drag & Drop Reordering** - Custom sort order for schedules
- **Advanced Search** - Date filters, status filters, saved filter presets

---

## [2.1.0] - 2026-02-17

### Added
- Snooze button on lock overlay (5/15/30/60 minutes)
- Sound notifications using Web Audio API
- Pause/Resume all schedules toggle
- Enhanced keyboard shortcuts (Ctrl+P pause, Esc deselect)

---

## [2.0.0] - 2026-02-17

### Added
- Premium licensing system ($10 lifetime)
- 7-day free trial
- Bulk import from text and bookmarks
- Custom colors for schedules
- Custom categories
- Bulk reschedule with conflict detection
- Shift time for multiple schedules

---

## [1.0.0] - 2026-01-29

### Initial Release
- Schedule URLs to open at specific times
- Recurring schedules (daily, weekly, monthly, yearly, custom)
- Categories for organization
- Lock overlay with countdown
- Desktop notifications
- Dark/Light theme
- Backup & restore
- Keyboard shortcuts

---

*For detailed documentation, see [USERGUIDE.md](USERGUIDE.md)*
