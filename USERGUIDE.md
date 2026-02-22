# TabTimer User Guide — v2.7.7

---

## Table of Contents
1. [How TabTimer Works](#1-how-tabtimer-works)
2. [Adding a Schedule](#2-adding-a-schedule)
3. [The Schedule Dialog](#3-the-schedule-dialog)
4. [Never Lock vs Lock Overlay](#4-never-lock-vs-lock-overlay)
5. [Auto-Close Tab](#5-auto-close-tab)
6. [Notification Reminder](#6-notification-reminder)
7. [Repeat Options](#7-repeat-options)
8. [Managing Schedules](#8-managing-schedules)
9. [Bulk Import (Premium)](#9-bulk-import-premium)
10. [Settings Reference](#10-settings-reference)
11. [Backup & Sync](#11-backup--sync)
12. [Trial Expiry](#12-what-happens-when-trial-expires)
13. [Keyboard Shortcuts](#13-keyboard-shortcuts)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. How TabTimer Works

### Chrome must be open

TabTimer runs entirely inside Chrome using Chrome's built-in alarm system. **Chrome must be running for your schedules to open on time.** There is no background server — everything runs in your browser.

### You must be on the correct Chrome profile

Chrome supports multiple user profiles. TabTimer is installed per profile. If you switch to a different profile, your TabTimer schedules will not fire.

| Situation at scheduled time | What happens |
|---|---|
| Chrome open, correct profile | ✅ Opens on time |
| Chrome open, wrong profile | ❌ Does not open |
| Chrome closed | ❌ Does not open |
| Firefox / Edge / Safari open | ❌ Does not open |
| Return to correct profile within grace period | ⏰ Opens when you switch back |
| Return after grace period | ⏰ Reschedules to next occurrence |

### Grace period

If Chrome was closed, TabTimer will still open missed tabs when you return — as long as you're back within the grace period (default 1 hour). Adjust this in Settings.

**Example (1 hour grace period):**
- Schedule fires 8:30 AM, you open Chrome at 9:15 AM → tab **will** open ✅
- Schedule fires 8:30 AM, you open Chrome at 9:35 AM → tab **will not** open, reschedules to next occurrence ❌

### Tip for sweepstakes users

Keep Chrome open on your TabTimer profile for time-sensitive contest entries. If you need to switch profiles briefly, switch back before the grace period expires.

---

## 2. Adding a Schedule

### Method 1 — Right-click any page
1. Go to the website you want to schedule
2. Right-click anywhere → **TabTimer → Schedule this page**
3. Fill in the dialog → **Schedule**

### Method 2 — Keyboard shortcut
Press **Alt+L** on any page to open the schedule dialog instantly.

### Method 3 — Quick Schedule
Right-click any page:
- **⚡ Quick: Tomorrow at 7 AM** — daily recurring
- **⚡ Quick: 1 hour from now** — one-time only

### Method 4 — Add New (Management Page)
Press **Alt+O** → **Add New** in the left sidebar → fill in the form → **Create Schedule**

---

## 3. The Schedule Dialog

| Field | Description |
|---|---|
| **URL** | Pre-filled with the current page. Edit if needed |
| **Category** | Choose from your categories. Custom categories appear here too |
| **Name** | Label for this schedule. Names starting with YYYY-MM-DD auto-delete after that date |
| **Open at** | Smart suggestions or enter a custom date and time |
| **Repeat Schedule** | Free: None, Daily, Weekly, Monthly, Yearly. Premium repeats show a PRO badge |
| **Auto re-lock** | How long before the page re-locks after unlocking. Default is Never |
| **Auto-close tab** | Automatically close the tab after X minutes |
| **Play sound** | Audio chime when the tab opens |

---

## 4. Never Lock vs Lock Overlay

### Never Lock (default)
By default TabTimer opens pages like any normal tab — no overlay, no lock, no countdown.

### Lock Overlay
The optional lock overlay shows a countdown and prevents early access. Useful for timed contests where you want to wait for the exact moment.

**Add a lock to one schedule:** choose a time under "Auto re-lock after unlocking" in the dialog.

**Change the default for all new schedules:** Settings → Default auto re-lock → Never → Save Settings.

**When the overlay shows you can:**
- **Unlock Now** — open immediately
- **5 / 15 / 30 / 60 min** — temporary access, auto-relocks after
- **Hide Overlay** — dismiss without unlocking

---

## 5. Auto-Close Tab

Available in: right-click dialog ✅ | Add New form ✅ | Edit modal ✅

Check **⏱️ Auto-close tab after opening** and enter the number of minutes. The tab closes itself automatically after that time — no action needed from you.

**Great for sweepstakes:** the tab opens, you do your entry, the tab closes itself.

The schedule list shows **⏱️ Auto-close: X min** on any schedule with this enabled.

---

## 6. Notification Reminder

Get a heads-up notification X seconds before a scheduled tab opens so you can be ready at your screen.

**Settings → Notification reminder → enter seconds → Save Settings**

| Value | Result |
|---|---|
| `0` | Disabled — you still get a notification when the tab actually opens |
| `10` | 10-second warning before tab opens (default) |
| `30` | 30-second warning |
| `60` | 1-minute warning |
| `300` | 5-minute warning |
| `3600` | 1-hour warning (max) |

**Important:** When a reminder fires, the tab-open notification is automatically suppressed. You will only ever get **one** notification per scheduled tab — never two.

---

## 7. Repeat Options

### Free
| Option | Fires |
|---|---|
| No Repeat | One time only |
| Daily | Every day at the same time |
| Weekly | Same day and time each week |
| Monthly | Same date each month |
| Yearly | Same date each year |

### Premium ⭐
| Option | Fires |
|---|---|
| Weekdays | Monday–Friday only |
| Weekends | Saturday–Sunday only |
| Every 2 Weeks | Biweekly |
| Every 3 Weeks | Every 3 weeks |
| Every 2 Months | Bimonthly |
| Quarterly | Every 3 months |
| Every 6 Months | Twice a year |
| Leap Year | Every 4 years |
| Every X Minutes | Any minute interval you set |
| Every X Hours | Any hour interval you set |
| Custom Days | Every X days |
| Specific Dates | Comma-separated list of dates |

---

## 8. Managing Schedules

### Schedule list badges
Each schedule in the list shows:

| Badge | Meaning |
|---|---|
| ⏰ Opens / ✅ Opened | Next or last open time |
| 🔓 Re-lock | Never or X minutes |
| ⏱️ Auto-close: X min | Only shown if auto-close is enabled |
| 📊 Nx | Number of times it has opened |
| 🔄 Next: [date] ([type]) | Next occurrence and repeat type |
| 🔊 | Sound is enabled |
| 📝 Notes | Click to view notes |

### Filters (left sidebar)
- **Active** — schedules not yet opened
- **Not Active** — schedules already opened (one-time)
- **Today** — opens today
- **Every X hours / Daily / Weekly** etc. — by repeat type

### Bulk actions
Select schedules (checkbox, Shift+Click, or Ctrl+A) to see the bulk bar:
- Open All, Duplicate, Delete
- Reschedule with stagger (Premium)
- Shift time forward/backward (Premium)

---

## 9. Bulk Import (Premium)

### From Text
Paste URLs one per line, set options, click Import.

### From Bookmarks
Pick a bookmark folder, set options, click Import from Folder.

### From CSV / Excel
Required column: `url`

Optional: `name`, `category`, `time` (HH:MM:SS), `date` (YYYY-MM-DD), `recurring` (true/false), `repeat`, `notes`

Click **Download template CSV** for a blank file with the correct headers. Excel time decimals and date serial numbers are automatically converted.

---

## 10. Settings Reference

| Setting | Description |
|---|---|
| Enable notifications | Desktop popup when a tab opens |
| **Notification reminder** | Seconds before tab opens to send advance alert. Default 10. Set 0 to disable |
| Auto-delete expired | Remove schedules after the date in their name passes |
| Open tabs in background | New tabs open without stealing focus from your current tab |
| **Grace period** | How long after scheduled time TabTimer still opens a missed tab. Default 1 hour |
| Stagger interval | Delay between multiple missed tabs opening. Default 15 seconds |
| Default category | Pre-selected category for all new schedules |
| **Default auto re-lock** | Lock setting for all new schedules. Never = no overlay (recommended) |
| Timezone | Your local timezone |
| Expiration time | Time of day expired named schedules auto-delete |
| **Show How TabTimer Works notice** | Re-enable the info banner if you dismissed it with "Don't show again" |

---

## 11. Backup & Sync

- **Export All** — download a JSON file with all your schedules
- **Import Backup** — restore from a JSON file
- **Auto-backup** — daily, weekly, or monthly with configurable retention
- **Cloud Sync (Premium)** — export and import to sync across devices
- **Health Check** — fixes stuck schedules, duplicates, orphaned alarms. Also runs automatically on startup

---

## 12. What Happens When Trial Expires

When your 7-day free trial ends and you choose not to purchase Premium:

1. A yellow banner appears listing schedules using Premium repeat types
2. Click **Convert to Nearest Free Option** to update all at once:

| Premium repeat | Converts to |
|---|---|
| Weekdays | Daily |
| Weekends | Weekly |
| Every 2 / 3 Weeks | Weekly |
| Quarterly / Every 6 Months / Every 2 Months | Monthly |
| Every 4 Years | Yearly |
| Every X Minutes / Hours | Daily |
| Custom Days | Daily |
| Specific Dates | No Repeat |

Or click Dismiss to handle them manually.

---

## 13. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+L` | Schedule current page (right-click dialog) |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management page |
| `Ctrl+A` | Select all schedules |
| `Shift+Click` | Select a range of schedules |
| `Ctrl+Click` | Add/remove individual from selection |
| `Del` | Delete selected |
| `Ctrl+D` | Duplicate selected |
| `Ctrl+N` | New schedule |
| `Ctrl+F` | Focus search |
| `Ctrl+T` | Toggle dark/light theme |
| `Ctrl+P` | Pause / Resume all schedules |
| `Esc` | Deselect all / close modal |
| `?` | Show shortcuts help overlay |

---

## 14. Troubleshooting

**Recurring schedule only fired once then stopped**
Fixed in v2.7.7. Install the latest version. The health check on startup will automatically repair any stuck schedules. If a schedule is still stuck, click Backup/Sync → Health Check.

**Schedule didn't open at the right time**
Check: Was Chrome open? Were you on the correct Chrome profile? Is the schedule showing as Active? Run Health Check from Backup/Sync.

**Tabs opened all at once when I restarted Chrome**
Expected — TabTimer caught up on missed schedules within the grace period. Reduce grace period in Settings if you'd prefer fewer catch-up opens.

**Edit form showed wrong time**
Fixed in v2.7.7. The edit form now shows your correct local time. Recurring schedules auto-advance to the next upcoming occurrence.

**Getting two notifications for one tab**
Fixed in v2.7.7. Reminder and tab-open notifications no longer both fire for the same event.

**Pages locking when I don't want them to**
Settings → Default auto re-lock → Never → Save Settings. Schedules created before this change need to be edited or deleted and recreated.

**Every X Hours saving the wrong number**
Fixed in v2.7.7. Delete and recreate any affected schedules.

**Premium repeat option is blocked with a PRO badge**
Click the PRO badge to start your free 7-day trial — no credit card needed.

**Trial expired and some schedules stopped working**
Open TabTimer management — a yellow banner lists affected schedules. Click Convert to Nearest Free Option to fix them all at once.

---

## Support

📧 **Email:** TabTimerPro@gmail.com
🐛 **Bug reports:** Open a GitHub issue
💡 **Feature requests:** Open a GitHub issue with "Feature:" in the title

---

*TabTimer v2.7.7 — Made with ❤️ for the sweepstakes and productivity community*
