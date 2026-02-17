# TabTimer User Guide

Complete guide to using TabTimer - Smart Website Scheduler (v2.7.1)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Schedules](#creating-schedules)
3. [Managing Schedules](#managing-schedules)
4. [Selection & Bulk Actions](#selection--bulk-actions)
5. [Repeat Options](#repeat-options)
6. [Lock Overlay & Temporary Unlock](#lock-overlay--temporary-unlock)
7. [Notes Feature](#notes-feature)
8. [Settings](#settings)
9. [Backup & Sync](#backup--sync)
10. [Advanced Search](#advanced-search)
11. [CSV/Excel Import](#csvexcel-import)
12. [Premium Features](#premium-features)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)

---

## Getting Started

### First Launch

1. **Install TabTimer** from the Chrome Web Store or load it manually
2. **Pin the extension** - Click the puzzle piece icon in Chrome, then pin TabTimer
3. **Open the management page** - Click the TabTimer icon → "Open TabTimer" (or press `Alt+O`)

### Interface Overview

The management page has several sections:

- **Header** - Shows status (Active/Paused), theme toggle, shortcuts, and license
- **Sidebar** - Navigation, quick filters, and category filters
- **Main Area** - Schedule list, add new, bulk import, settings, etc.
- **Bulk Actions Bar** - Appears when schedules are selected

---

## Creating Schedules

### Method 1: Right-Click on Any Page

1. Navigate to the website you want to schedule
2. Right-click anywhere on the page
3. Select **🕐 TabTimer → 📅 Schedule this page**
4. A dialog appears with options:
   - **Category** - Organize your schedule
   - **Name** - Give it a descriptive name
   - **Open at** - Choose from smart suggestions or set custom time
   - **Repeat** - One-time or recurring
   - **Auto re-lock** - How long before page re-locks after manual unlock
   - **Play sound** - Audio notification when tab opens
5. Click **Schedule**

### Method 2: Keyboard Shortcut

1. On any webpage, press **Alt+L**
2. The same scheduling dialog appears
3. Fill in details and click Schedule

### Method 3: Add New (Management Page)

1. Open TabTimer management (`Alt+O`)
2. Click **+ Add New** in the sidebar
3. Enter the URL manually
4. Fill in all schedule details
5. Click **Create Schedule**

### Method 4: Bulk Import (Premium)

See [CSV/Excel Import](#csvexcel-import) section for detailed instructions.

---

## Managing Schedules

### Viewing Schedules

The main schedule list shows:
- **Color bar** - Category or custom color
- **Checkbox** - For selection
- **Name** - Schedule name (double-click to edit)
- **Badges** - Recurring, category, 🔊 sound, 📝 notes
- **URL** - The scheduled website
- **Status** - Opens time, re-lock setting, open count
- **Action buttons** - Resolve URL, Duplicate, Edit, Delete

### Quick Filters

Use sidebar filters to find schedules:
- **Active** - Schedules waiting to open
- **Not Active** - Already opened/unlocked
- **Today** - Scheduled for today
- **Daily/Weekly/Monthly/Once/Other** - By category

### Searching

1. Use the search box at the top of the schedule list
2. Searches name, URL, and resolved URLs
3. Click **🔍** for Advanced Search

### Sorting

Use the sort dropdown to order schedules:
- **Custom Order** - Drag and drop (Premium)
- **Time (Soon-Late)** - Nearest first
- **Time (Late-Soon)** - Furthest first
- **Name (A-Z / Z-A)**
- **URL (A-Z / Z-A)**

### Editing a Schedule

1. Click the **✏️ Edit** button on any schedule
2. Modify any field in the Edit modal
3. Click **Save Changes**

**Quick Edit:** Double-click a schedule name to edit it inline.

---

## Selection & Bulk Actions

### Selecting Schedules

| Method | How |
|--------|-----|
| Single | Click the checkbox |
| Range | Click first, then **Shift+Click** last |
| Multiple | **Ctrl+Click** (or **Cmd+Click** on Mac) individual items |
| All | Press **Ctrl+A** or click "Select All" |
| Deselect | Press **Esc** |

**Tip:** You can Shift+Click or Ctrl+Click anywhere on the schedule row, not just the checkbox.

### Bulk Actions Bar

When schedules are selected, a bar appears at the bottom with:

- **Resolve URLs** - Capture final URLs after redirects
- **Open All Selected** - Open all selected tabs now
- **Reschedule** (Premium) - Set new time for all selected
- **Shift Time** (Premium) - Move times forward/backward
- **Duplicate** - Copy all selected
- **Delete** - Remove all selected
- **Clear** - Deselect all

---

## Repeat Options

### Available Repeat Types

| Type | Description |
|------|-------------|
| No Repeat | Opens once at scheduled time |
| Daily | Every day at the same time |
| Weekdays | Monday through Friday |
| Weekends | Saturday and Sunday |
| Weekly | Same day each week |
| Biweekly | Every 2 weeks |
| Every 3 Weeks | Every 3 weeks |
| Monthly | Same day each month |
| Bimonthly | Every 2 months |
| Quarterly | Every 3 months |
| Every 6 Months | Twice a year |
| Yearly | Annual |
| Leap Year | Every 4 years (Feb 29) |
| Every X Minutes | Custom minute interval |
| Every X Hours | Custom hour interval |
| Custom Days | Every X days |

### How Recurring Works

1. Schedule opens at the set time
2. After auto re-lock time, it reschedules to next occurrence
3. Original times are preserved for future occurrences

---

## Lock Overlay & Temporary Unlock

### Lock Overlay

When you visit a scheduled page before its time:
- A floating overlay appears showing countdown
- Page is still visible but overlay reminds you to wait

### Overlay Options

- **🔓 Unlock Now** - Permanently unlock (uses auto re-lock setting)
- **👁️ Hide Overlay** - Hide the overlay temporarily
- **🔓 Unlock temporarily for:** - Access page for a set time:
  - 5 minutes
  - 15 minutes
  - 30 minutes
  - 1 hour
- **⏰ Lock for 24 More Hours** - Extend the lock

### Temporary Unlock (Snooze)

The "Unlock temporarily" buttons let you access the page NOW for the selected duration. After the time expires, the lock automatically re-engages. This is perfect for:
- Quick checks without permanently unlocking
- Taking a short break to view the content
- Accessing the page when you need it early

---

## Notes Feature

### Adding Notes (Premium)

1. Click **✏️ Edit** on any schedule
2. Scroll down to the **📝 Notes** field
3. Enter your notes (reminders, instructions, etc.)
4. Click **Save Changes**

### Viewing Notes

When a schedule has notes:
- A bright yellow **📝 Notes** badge appears in the schedule list
- **Click the badge** to open the Notes viewer
- The Notes modal shows:
  - Schedule name
  - URL
  - Full notes content (scrollable)
- Click **Close** to dismiss
- Click **✏️ Edit** to modify the notes

---

## Settings

Access from the sidebar → **⚙️ Settings**

### Notifications

- **Enable notifications** - Desktop alerts when tabs open
- **Notification reminder** - Minutes before scheduled time

### Schedule Behavior

- **Auto-delete after expiration** - Remove schedules with past dates in name
- **Open tabs in background** - New tabs don't steal focus
- **Grace period** - How long to still open missed tabs (default: 1 hour)
- **Stagger interval** - Delay between opening multiple missed tabs (default: 15 seconds)

### Defaults

- **Default category** - For new schedules
- **Default auto re-lock** - Minutes (0 = Never)
- **Timezone** - Your local timezone

---

## Backup & Sync

### Cloud Sync (Premium)

1. Go to **Backup/Sync** in the sidebar
2. Click **⬆️ Export for Sync**
3. Save the JSON file to cloud storage (Google Drive, Dropbox, etc.)
4. On another device, click **⬇️ Import from Sync**
5. Select the file - schedules merge without duplicates

### Health Check

Automatically runs on startup, or manually:
1. Go to **Backup/Sync**
2. Click **🔍 Run Health Check**
3. Fixes: stuck schedules, duplicates, orphaned alarms, missing fields

### Auto-Backup

1. Enable "Auto-Backup" in Backup/Sync
2. Choose frequency (daily/weekly/monthly)
3. Set how many backups to keep

---

## Advanced Search

### Opening Advanced Search

1. Click the **🔍** button next to the sort dropdown
2. The advanced search panel expands

### Search Options

**Search By:**
- **Scheduled Time** - Filter by when tabs are set to open
- **Expiration Date (in name)** - Filter by YYYY-MM-DD dates in schedule names
- **Either Date** - Match if either date is in range

**Date Range:**
- **Date From** - Show schedules on or after this date
- **Date To** - Show schedules on or before this date
- Use the calendar picker to select dates

**Status Filter:**
- All
- Active Only
- Opened/Unlocked
- Recurring Only
- One-time Only

### Saving Filters (Premium)

1. Set up your desired filters
2. Click **💾 Save Filter**
3. Enter a name
4. Filter appears as a clickable pill
5. Click the pill to instantly apply that filter

---

## CSV/Excel Import

### Supported File Formats
- **CSV** (.csv) - Comma-separated values
- **Excel** (.xlsx, .xls) - Microsoft Excel files

### How to Import

1. Go to **Bulk Import** in the sidebar
2. Click the **"From CSV/Excel"** tab
3. Drag & drop a file or click to browse
4. Preview shows the first 5 rows
5. Set default options for rows without values
6. Click **"Import from File"**

### File Columns

**Required:**
- `url` - The website URL (must start with http:// or https://)

**Optional:**
- `name` - Schedule name
- `category` - Category (Daily, Weekly, Monthly, Once, Other)
- `time` - Time in HH:MM or HH:MM:SS format
- `date` - Date in YYYY-MM-DD format
- `recurring` - true/false (or yes/no, 1/0)
- `repeat` - daily, weekdays, weekly, monthly, yearly, etc.
- `notes` - Notes for the schedule

### Example CSV

```csv
url,name,category,time,recurring,repeat,notes
https://example.com/daily,Morning Check,Daily,08:30:00,true,daily,Check every morning
https://contest.com/enter,Contest Entry,Once,09:00:00,false,,Ends March 1st
https://news.com,News Site,Daily,07:00:00,true,weekdays,Weekday mornings only
```

### Template Download

Click **"📥 Download template CSV"** in the import page to get a sample file with the correct format.

### Default Values

If a column is missing or empty for a row:
- **Category** - Uses the "Default Category" you select
- **Time** - Uses the "Default Start Time" you set
- **Recurring** - Uses the "Make recurring" checkbox
- **Repeat** - Uses the "Default Repeat type" dropdown

---

## Premium Features

### What's Included ($10 Lifetime)

| Feature | Description |
|---------|-------------|
| Bulk Import (Text) | Paste multiple URLs at once |
| Bulk Import (CSV/Excel) | Import from spreadsheet files |
| Bulk Import (Bookmarks) | Import entire bookmark folders |
| Custom Colors | Color-code individual schedules |
| Custom Categories | Create your own categories |
| Cloud Sync | Sync between devices |
| Notes | Add notes to any schedule |
| Advanced Search | Date filters, saved filters |
| Drag & Drop | Custom sort order |
| Bulk Reschedule | Change time for multiple schedules |
| Shift Time | Move times forward/backward |

### Activating Premium

1. Purchase a license key from the payment page
2. Click **✨ Try Premium** in the header
3. Enter your license key (format: TTXX-XXXX-XXXX-XXXX)
4. Click **Activate License**

### Free Trial

- 7-day trial with all Premium features
- Click **Start Free Trial** in the license modal
- No credit card required

---

## Keyboard Shortcuts

### Global (Any Page)

| Shortcut | Action |
|----------|--------|
| `Alt+L` | Schedule current page |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management |

### Management Page

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all visible schedules |
| `Shift+Click` | Select range |
| `Ctrl+Click` | Add/remove from selection |
| `Del` | Delete selected |
| `Ctrl+D` | Duplicate selected |
| `Ctrl+N` | New schedule |
| `Ctrl+F` | Focus search box |
| `Ctrl+T` | Toggle dark/light theme |
| `Ctrl+P` | Pause/Resume all schedules |
| `Esc` | Deselect all / Close modal |
| `?` | Show keyboard shortcuts |

---

## Troubleshooting

### Schedules Not Opening

1. **Was Chrome open?** - TabTimer only works when Chrome is running
2. **Check grace period** - Default is 1 hour; tabs open if Chrome starts within this window
3. **Check pause status** - Header shows "⏸️ Paused" if paused
4. **Run health check** - Fixes stuck schedules
5. **Check the time** - Verify schedule time and timezone

### All Tabs Open at Once

- Increase "Stagger interval" in Settings (default: 15 seconds)
- Tabs open one at a time with this delay between each

### Sound Not Playing

1. Verify "Play sound" is checked for the schedule
2. Check system volume isn't muted
3. Extension uses offscreen audio for reliability

### CSV Import Not Working

1. Make sure file has a `url` column header
2. URLs must start with `http://` or `https://`
3. Check the preview to ensure data is parsed correctly
4. Try downloading the template and using that format

### Notes Badge Not Clickable

- Click directly on the yellow **📝 Notes** badge
- The badge opens a viewer; click **✏️ Edit** to modify

---

## FAQ

**Q: Does TabTimer work when Chrome is closed?**
A: No, Chrome must be running. However, if you open Chrome within the grace period (default 1 hour), missed tabs will still open with staggered timing.

**Q: Can I schedule the same URL multiple times?**
A: Yes! You can have multiple schedules for the same URL at different times.

**Q: What happens to recurring schedules when I'm away?**
A: If you miss the schedule and the grace period passes, it automatically moves to the next occurrence at the original time.

**Q: Is my data sent anywhere?**
A: No, all data is stored locally in Chrome. Cloud sync only works by exporting/importing files you control.

**Q: Can I use TabTimer on multiple computers?**
A: Yes! Use Cloud Sync (Premium) to export from one device and import on another.

**Q: What's the "date in name" feature?**
A: If your schedule name starts with a date (e.g., "2025-12-31 New Year Event"), it auto-deletes after that date. You can also search by this date using Advanced Search.

**Q: How do I completely reset TabTimer?**
A: Go to `chrome://extensions/`, find TabTimer, click Details → Clear site data.

**Q: Can I schedule pages that require login?**
A: Yes, but you must be logged in when the tab opens. TabTimer just opens the URL.

**Q: What's the difference between "Unlock Now" and "Unlock temporarily"?**
A: "Unlock Now" uses your auto re-lock setting (default 5 min). "Unlock temporarily" lets you choose exactly how long (5/15/30/60 min) before the lock re-engages.

**Q: Can I import from Google Sheets?**
A: Yes! Export your Google Sheet as CSV, then import using the CSV/Excel import feature.

---

## Support

- **GitHub Issues** - Report bugs or request features
- **Email** - TabTimerPro@gmail.com

---

*Thank you for using TabTimer! Version 2.7.1*
