# TabTimer — Smart Website Scheduler

**Automatically open websites at scheduled times — free forever with optional Premium.**

[Features](#features) • [How It Works](#important--how-tabtimer-works) • [Quick Start](#quick-start) • [Repeat Options](#repeat-options) • [Shortcuts](#keyboard-shortcuts) • [Troubleshooting](#troubleshooting) • [Support](#support)

---

## What is TabTimer?

TabTimer is a Chrome extension that opens websites automatically at the times you choose. Set it once and forget it — TabTimer handles the rest.

**Perfect for:**
- 🎯 Contests & Sweepstakes — never miss an entry window
- 📰 Morning routines — news, email, and work tools open automatically
- 📊 Work dashboards — reports and tools launch at the start of each day
- ⏰ Reminders — time-sensitive pages that need your attention
- 🔄 Recurring tasks — weekly check-ins, monthly reports

---

## Important — How TabTimer Works

TabTimer runs inside Chrome. For schedules to open on time:

- ✔ **Chrome must be running** at the scheduled time
- ✔ You must be on the **correct Chrome profile** where TabTimer is installed
- ✔ Switching to a different Chrome profile, Firefox, Edge, or Safari will prevent tabs from opening

If Chrome was closed or you switched profiles, TabTimer catches up and opens missed tabs when you return — within your **grace period** (default 1 hour, adjustable in Settings).

---

## Features

### Free Forever
- Schedule any URL to open at a specific date and time
- Repeat: No Repeat, Daily, Weekly, Monthly, Yearly
- **Never Lock** — pages open like normal tabs, no overlay (default)
- Optional lock overlay with countdown timer and temporary unlock
- **Auto-close** — automatically close the tab after X minutes
- **Advance notification reminder** — notified X seconds before a tab opens (default 10s, set 0 to disable)
- One notification per tab — reminder suppresses the open notification so you never get doubled up
- Desktop and sound notifications
- Pause/Resume all schedules
- Dark/Light theme
- Backup and restore
- Keyboard shortcuts (Alt+L to schedule, Alt+O to manage)
- Grace period — missed tabs still open when Chrome restarts (default 1 hour)
- Health check on startup — automatically repairs stuck schedules

### Premium ($10 Lifetime — 7-Day Free Trial Included)
- Advanced repeats: Weekdays, Weekends, Every 2 Weeks, Every 3 Weeks, Quarterly, Every X Minutes, Every X Hours, Custom Days, Specific Dates, and more
- Bulk import from text, CSV/Excel, or bookmark folders
- Custom categories and colors
- Notes on any schedule
- Cloud sync across devices
- Advanced search with saved filters
- Drag and drop reordering
- Bulk reschedule and shift time
- Shift+Click multi-selection

---

## Quick Start

### Right-Click Any Page
1. Navigate to the website you want to schedule
2. Right-click anywhere → **TabTimer → Schedule this page**
3. Set your time, repeat, auto-close, and click **Schedule**

### Keyboard Shortcut
Press **Alt+L** on any page to open the schedule dialog instantly.

### Quick Schedule
Right-click any page and choose:
- **⚡ Quick: Tomorrow at 7 AM** — schedules as a daily recurring event
- **⚡ Quick: 1 hour from now** — one-time, opens in 60 minutes

### Management Page
Press **Alt+O** → **Add New** in the sidebar.

---

## Auto-Close Tab

Available in the right-click dialog, Add New form, and Edit modal.

Check **⏱️ Auto-close tab after opening** and set the number of minutes. The tab closes itself automatically — great for contest entries.

The schedule list shows **⏱️ Auto-close: X min** on any schedule with this enabled.

---

## Notification Reminder

Go to **Settings → Notification reminder** and set seconds (default 10).

- `0` = disabled (tab-open notification still fires)
- `10` = 10-second heads-up before the tab opens
- `60` = 1-minute warning
- `300` = 5-minute warning

When a reminder fires, the tab-open notification is automatically suppressed — you only ever get **one** notification per tab open.

---

## Repeat Options

| Option | Free | Premium |
|---|---|---|
| No Repeat (One-time) | ✅ | ✅ |
| Daily | ✅ | ✅ |
| Weekly | ✅ | ✅ |
| Monthly | ✅ | ✅ |
| Yearly | ✅ | ✅ |
| Weekdays (Mon–Fri) | — | ⭐ |
| Weekends (Sat–Sun) | — | ⭐ |
| Every 2 Weeks | — | ⭐ |
| Every 3 Weeks | — | ⭐ |
| Every 2 Months | — | ⭐ |
| Quarterly (Every 3 Months) | — | ⭐ |
| Every 6 Months | — | ⭐ |
| Leap Year (Every 4 Years) | — | ⭐ |
| Every X Minutes | — | ⭐ |
| Every X Hours | — | ⭐ |
| Custom Days Interval | — | ⭐ |
| Specific Dates | — | ⭐ |

> If your 7-day trial expires, a banner offers one-click conversion of Premium repeat schedules to the nearest free option.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+L` | Schedule current page |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management |
| `Ctrl+A` | Select all schedules |
| `Shift+Click` | Select a range |
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

**Recurring schedule only fired once and stopped**
Fixed in v2.7.6. Load the latest version. On startup, the health check will automatically repair any stuck schedules.

**Schedule didn't open at the right time**
Was Chrome open? Were you on the correct Chrome profile? Check grace period in Settings → run Health Check.

**Edit form showing wrong time**
Fixed in v2.7.6. Now shows correct local time and auto-advances past recurring schedules to next occurrence.

**Getting two notifications for one tab open**
Fixed in v2.7.6. Reminder and open notifications no longer both fire.

**Pages locking when I don't want them to**
Settings → Default auto re-lock → Never → Save Settings.

**Every X Hours saving wrong value**
Fixed in v2.7.6. Delete and recreate any schedules created before this fix.

---

## Privacy

- All data stored locally in your Chrome browser
- No external servers, no tracking, no data collection, no advertising
- Source code available on GitHub

---

## Support

- 📧 **Email:** TabTimerPro@gmail.com
- 🐛 **Bugs:** Open a GitHub issue
- 💡 **Feature requests:** Open a GitHub issue with "Feature:" in the title

---

*Made with ❤️ for the sweepstakes and productivity community — Version 2.7.6*
