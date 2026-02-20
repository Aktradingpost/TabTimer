# TabTimer User Guide
**Version 2.7.5**

---

## Table of Contents
1. [How TabTimer Works](#how-tabtimer-works)
2. [Getting Started](#getting-started)
3. [Adding a Schedule](#adding-a-schedule)
4. [The Schedule Dialog](#the-schedule-dialog)
5. [Never Lock vs Lock Overlay](#never-lock-vs-lock-overlay)
6. [Auto-Close Tab](#auto-close-tab)
7. [Notification Reminder](#notification-reminder)
8. [Managing Schedules](#managing-schedules)
9. [Repeat Options — Free vs Premium](#repeat-options)
10. [Bulk Import (Premium)](#bulk-import)
11. [CSV / Excel Import](#csv--excel-import)
12. [Custom Categories (Premium)](#custom-categories)
13. [Settings](#settings)
14. [Backup & Sync](#backup--sync)
15. [What Happens When Trial Expires](#what-happens-when-trial-expires)
16. [Keyboard Shortcuts](#keyboard-shortcuts)
17. [Troubleshooting](#troubleshooting)

---

## How TabTimer Works

Understanding this will save you a lot of confusion.

### TabTimer requires Chrome to be open

TabTimer is a Chrome extension. It uses Chrome's built-in alarm system to fire at scheduled times. **Chrome must be running for your schedules to open.**

If Chrome is closed at 8:30 AM when your schedule is set to fire, the tab will not open at 8:30 AM. TabTimer has a **grace period** (default 1 hour). When you open Chrome within that grace period, it catches up and opens any missed tabs automatically.

### TabTimer only works in the correct Chrome profile

Chrome supports multiple profiles. Each profile has its own set of extensions and its own TabTimer data. **If you are on a different Chrome profile, your schedules will not fire.**

| Situation at scheduled time | What happens |
|---|---|
| Chrome open, correct profile active | ✅ Tab opens on schedule |
| Chrome open, different profile active | ❌ Does not open |
| Chrome closed | ❌ Does not open |
| Firefox, Edge, or Safari open instead | ❌ Does not open |
| Return to correct profile within grace period | ⏰ Opens when you switch back |
| Return after grace period has passed | ⏰ Opens at next scheduled occurrence |

### Grace period

The grace period (default 1 hour, adjustable in Settings) is how long after the scheduled time TabTimer will still open a missed tab. Example with 1-hour grace period:

- Schedule at 8:30 AM, open Chrome at 9:15 AM → tab **will** open
- Schedule at 8:30 AM, open Chrome at 9:29 AM → tab **will** open
- Schedule at 8:30 AM, open Chrome at 9:31 AM → tab **will not** open (next occurrence fires instead)

### Tip for sweepstakes users

For time-sensitive contest entries, keep Chrome open and stay on your TabTimer profile. If you need to switch profiles, switch back before the grace period expires.

---

## Getting Started

After installing TabTimer from the Chrome Web Store:

1. Click the TabTimer icon in your toolbar
2. Click **Open TabTimer** to open the management page
3. Add your first schedule using any method below

---

## Adding a Schedule

### Method 1: Right-Click on Any Page
1. Navigate to the website you want to schedule
2. Right-click anywhere on the page
3. Select **TabTimer → Schedule this page**
4. Fill in the schedule dialog and click **Schedule**

### Method 2: Keyboard Shortcut (Alt+L)
Press **Alt+L** on any webpage to open the schedule dialog directly on the page.

### Method 3: Quick Schedule
Right-click any page and choose:
- **⚡ Quick: Tomorrow at 7 AM** — daily recurring
- **⚡ Quick: 1 hour from now** — one-time

### Method 4: Add New (Management Page)
1. Press **Alt+O** or click the toolbar icon
2. Click **Add New** in the left sidebar
3. Fill in the form and click **Create Schedule**

---

## The Schedule Dialog

Available via right-click, Alt+L, or the Add New form:

| Field | Description |
|---|---|
| **URL** | Pre-filled with the current page address |
| **Category** | Choose from your categories — custom ones appear here too |
| **Name** | Label for the schedule. Names starting with YYYY-MM-DD auto-delete after that date |
| **Open at** | Smart time suggestions or enter a custom date and time |
| **Repeat Schedule** | How often the page opens. Free: None, Daily, Weekly, Monthly, Yearly. Premium options show a PRO badge |
| **Auto re-lock** | How long before the page re-locks after unlocking. Default is Never |
| **Auto-close tab** | Automatically close the tab after X minutes |
| **Play sound** | Audio alert when the tab opens |

---

## Never Lock vs Lock Overlay

### Never Lock (Default)
By default, TabTimer opens pages like any normal browser tab — no overlay, no countdown.

### Lock Overlay
The lock overlay is optional. It shows a countdown and prevents accidental interaction before you are ready.

**To add a lock to a single schedule:**
Choose a time under **Auto re-lock after unlocking** in the schedule dialog.

**To set the default for all new schedules:**
Settings → Default auto re-lock after unlocking → Never → Save Settings.

**When the lock overlay shows:**
- **Unlock Now** — access the page immediately
- **5 / 15 / 30 / 60 min** — temporary access, auto-relocks after that time
- **Hide Overlay** — dismiss without unlocking

---

## Auto-Close Tab

Available in the right-click dialog, Add New form, and Edit modal.

Check **⏱️ Auto-close tab after opening** and enter the number of minutes. The tab closes automatically after that time.

Useful for contest entries where you want the tab to open, you do your entry, and it closes itself.

The schedule list shows **⏱️ Auto-close: X min** on any schedule that has this enabled.

---

## Notification Reminder

TabTimer can alert you X seconds before a tab is about to open so you are ready at your screen.

**To set it up:**
Settings → Notification reminder → enter number of seconds (default 10) → Save Settings.

- Set to **0** to disable advance reminders entirely
- Set to **10** for a 10-second heads-up
- Set to **60** for a 1-minute warning
- Set to **300** for a 5-minute warning

**Important:** When a reminder fires, the tab-open notification is automatically suppressed. You will only ever get **one** notification per scheduled tab open — either the reminder or the open notification, never both.

If you set the reminder to 0 (disabled), you will still get a notification when the tab actually opens.

---

## Managing Schedules

- **Search** — filter by name or URL
- **Filter** — sidebar: Active, Not Active, Today, Daily, Weekly, etc.
- **Sort** — Custom Order, Time, or Name
- **Edit** — ✏️ pencil icon
- **Delete** — 🗑️ trash icon
- **Select** — checkbox, or Ctrl+A for all

### What the schedule list shows for each item

- ⏰ Opens / ✅ Opened — next or last open time
- 🔓 Re-lock — Never or minutes
- ⏱️ Auto-close — only shown if enabled, shows minutes
- 📊 Nx — how many times it has opened
- 🔄 Next — next occurrence date and repeat type
- 🔊 — sound is enabled
- 📝 Notes — click to view

### Bulk Actions
Select schedules to see the bulk bar:
- **Open All** — opens selected URLs now
- **Reschedule** — set new time with stagger (Premium)
- **Shift Time** — move schedules forward or backward (Premium)
- **Duplicate** — copy selected
- **Delete** — remove selected

---

## Repeat Options

### Free
| Option | Description |
|---|---|
| No Repeat | One-time only |
| Daily | Every day |
| Weekly | Same day each week |
| Monthly | Same date each month |
| Yearly | Same date each year |

### Premium ⭐
| Option | Description |
|---|---|
| Weekdays | Monday–Friday only |
| Weekends | Saturday–Sunday only |
| Every 2 Weeks | Biweekly |
| Every 3 Weeks | Every 3 weeks |
| Every 2 Months | Bimonthly |
| Quarterly | Every 3 months |
| Every 6 Months | Twice a year |
| Leap Year | Every 4 years |
| Every X Minutes | Enter any minute interval |
| Every X Hours | Enter any hour interval |
| Custom Days | Every X days |
| Specific Dates | Comma-separated list of exact dates |

---

## Bulk Import

### From Text (Premium)
Paste URLs one per line, set options, click Import.

### From Bookmarks (Premium)
Pick a bookmark folder, set options, click Import from Folder.

---

## CSV / Excel Import

Go to **Bulk Import → From CSV/Excel**. Supported: `.csv`, `.xlsx`, `.xls`

| Column | Required | Notes |
|---|---|---|
| `url` | ✅ | Website address |
| `name` | No | Schedule label |
| `category` | No | Category name |
| `time` | No | HH:MM:SS — Excel decimals auto-converted |
| `date` | No | YYYY-MM-DD — Excel serials auto-converted |
| `recurring` | No | true or false |
| `repeat` | No | daily, weekly, monthly, etc. |
| `notes` | No | Notes text |

Click **Download template CSV** for a blank file with correct headers.

---

## Custom Categories

1. Categories in sidebar → + Add Category
2. Give it a name, emoji, and color
3. Assign when creating or editing schedules

Custom categories appear automatically in the right-click schedule dialog.

---

## Settings

| Setting | Description |
|---|---|
| Enable notifications | Desktop popup when a tab opens |
| **Notification reminder** | Seconds before a tab opens to send advance alert. Default 10. Set to 0 to disable |
| Auto-delete expired | Remove schedules after date in name passes |
| Open tabs in background | New tabs open without stealing focus |
| **Grace period** | How long after schedule time tabs still open if Chrome was closed. Default 1 hour |
| Stagger interval | Delay between missed tabs opening. Default 15 seconds |
| Default category | Pre-selected for new schedules |
| **Default auto re-lock** | Lock setting for all new schedules. Never = no overlay |
| Timezone | Your local timezone |
| Show How TabTimer Works notice | Re-enable the info banner if you dismissed it with Don't show again |

---

## Backup & Sync

- **Export All** — downloads JSON file with all schedules
- **Import Backup** — restores from JSON file
- **Auto-backup** — daily, weekly, or monthly with configurable retention
- **Cloud Sync (Premium)** — export/import across devices
- **Health Check** — fixes stuck schedules, duplicates, orphaned alarms. Also runs on startup

---

## What Happens When Trial Expires

When your 7-day trial ends and you choose not to purchase:

1. A yellow banner lists schedules using Premium repeat types
2. Click **Convert to Nearest Free Option** to update all at once:
   - Weekdays → Daily
   - Weekends → Weekly
   - Every 2 Weeks → Weekly
   - Quarterly → Monthly
   - Every 6 Months → Monthly
   - Every X Minutes/Hours → Daily
   - Custom Days → Daily
   - Specific Dates → No Repeat
3. Or Dismiss to handle them manually

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+L` | Schedule current page |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management |
| `Ctrl+A` | Select all |
| `Shift+Click` | Select range |
| `Ctrl+Click` | Add/remove from selection |
| `Del` | Delete selected |
| `Ctrl+D` | Duplicate selected |
| `Ctrl+N` | New schedule |
| `Ctrl+F` | Focus search |
| `Ctrl+T` | Toggle theme |
| `Ctrl+P` | Pause/Resume all |
| `Esc` | Deselect / Close modal |
| `?` | Show shortcuts help |

---

## Troubleshooting

**Schedule didn't open at the right time**
Was Chrome open? Were you on the correct Chrome profile? Check grace period in Settings. Run Health Check.

**Tabs opened when I switched back to my profile**
Expected — TabTimer caught up on missed schedules within the grace period. Reduce grace period in Settings if you don't want catch-up opens.

**I switched profiles and my schedules disappeared**
They are still there. Switch back to the original Chrome profile.

**Wrong time showing in the Edit form**
Fixed in v2.7.5. Edit form now shows your local time. Recurring schedules auto-advance to next upcoming time.

**Pages locking when I don't want them to**
Settings → Default auto re-lock → Never → Save Settings. Delete and re-add schedules created before this change.

**Getting two notifications for one tab**
Fixed in v2.7.5. If a reminder is set, the tab-open notification is now suppressed.

**Every X Hours saving the wrong number**
Fixed in v2.7.5. Delete and recreate any schedules affected by this.

**Import showing wrong data**
Make sure first column header is exactly `url` (lowercase). Use the Download Template button.

**Premium repeat option blocked**
Click the PRO badge to start your free 7-day trial — no credit card needed.

**Trial expired and schedules stopped working**
Open TabTimer management — banner lists affected schedules. Click Convert to Nearest Free Option.

---

## Support

📧 **Email:** TabTimerPro@gmail.com
🐛 **Bug reports:** Open a GitHub issue
💡 **Feature requests:** Open a GitHub issue with "Feature:" in the title

---

*TabTimer v2.7.5 — Made with ❤️ for the sweepstakes and productivity community*
