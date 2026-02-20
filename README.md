# TabTimer - Smart Website Scheduler

**Automatically open websites at scheduled times — free forever with optional Premium.**

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Repeat Options](#repeat-options) • [Shortcuts](#keyboard-shortcuts) • [Support](#support)

---

## What is TabTimer?

TabTimer is a Chrome extension that opens websites automatically at the times you choose. Set it once and forget it — TabTimer handles the rest.

**Perfect for:**
- 🎯 Contests & Sweepstakes — never miss an entry window
- 📰 Morning routines — news, email, and work tools open automatically
- 📊 Work dashboards — reports launch at the start of each day
- ⏰ Reminders — time-sensitive pages that need your attention
- 🔄 Recurring tasks — weekly check-ins, monthly reports

---

## Important — How TabTimer Works

TabTimer runs inside Chrome. For schedules to open on time:

- ✔ **Chrome must be running** at the scheduled time
- ✔ You must be on the **correct Chrome profile** where TabTimer is installed
- ✔ Switching to a different Chrome profile, Firefox, Edge, or Safari will prevent scheduled tabs from opening

If Chrome was closed or you switched profiles, TabTimer will catch up and open missed tabs when you return — within your grace period (default 1 hour, adjustable in Settings).

---

## Features

### Free Forever
- Schedule any URL to open at a specific time
- Repeat options: No Repeat, Daily, Weekly, Monthly, Yearly
- **Never Lock** — pages open like normal tabs with no overlay (default)
- Optional lock overlay with countdown timer
- Temporary unlock — 5, 15, 30, or 60 minutes
- **Auto-close** — automatically close the tab after X minutes
- **Advance notification reminder** — get notified X seconds before the tab opens (default 10 seconds)
- Desktop and sound notifications
- Pause/Resume all schedules
- Dark/Light theme
- Backup and restore
- Keyboard shortcuts
- Auto health check on startup
- Grace period — missed tabs still open when Chrome restarts (default 1 hour)

### Premium ($10 Lifetime — 7-Day Free Trial Included)
- All advanced repeat options: Weekdays, Weekends, Every 2 Weeks, Quarterly, Every X Minutes/Hours, Custom Days, Specific Dates, and more
- Bulk import from text, CSV/Excel, or bookmarks
- Custom categories and colors
- Notes on any schedule
- Cloud sync across devices
- Advanced search with saved filters
- Drag and drop reordering
- Bulk reschedule and shift time
- Shift+Click multi-selection

---

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store listing
2. Click **Add to Chrome**
3. Pin the extension for easy access

### Manual / Developer Mode
1. Download or clone this repository
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `TabTimer` folder

---

## Quick Start

### Right-Click Any Page
1. Navigate to the website you want to schedule
2. Right-click anywhere on the page
3. Select **TabTimer → Schedule this page**
4. Fill in the schedule dialog and click **Schedule**

### Keyboard Shortcut
Press **Alt+L** on any webpage to open the schedule dialog instantly.

### Quick Schedule
Right-click any page and choose:
- **⚡ Quick: Tomorrow at 7 AM** — schedules as a daily recurring event
- **⚡ Quick: 1 hour from now** — one-time, opens in 60 minutes

### Management Page
Press **Alt+O** or click the toolbar icon, then click **Add New**.

---

## Never Lock Feature

By default, TabTimer opens pages like any normal browser tab — no overlay, no lock.

To add a lock to a specific schedule, choose a lock time in the schedule dialog under **Auto re-lock after unlocking**.

To change the default for all new schedules, go to **Settings → Default auto re-lock after unlocking**.

---

## Auto-Close Feature

Available in the right-click dialog, Add New form, and Edit modal.

Check **Auto-close tab after opening** and set the number of minutes. The tab will automatically close after that time.

Displayed in the schedule list as **⏱️ Auto-close: X min**.

---

## Notification Reminder

TabTimer can notify you X seconds before a scheduled tab opens so you are ready.

Go to **Settings → Notification reminder** and set the number of seconds (default 10). Set to 0 to disable.

When a reminder fires, the tab-open notification is suppressed so you only ever get one notification per scheduled tab.

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

> If your 7-day trial expires, TabTimer shows a banner offering one-click conversion of Premium repeat schedules to the nearest free option.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+L` | Schedule current page |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management |
| `Ctrl+A` | Select all schedules |
| `Shift+Click` | Select a range |
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

## CSV/Excel Import (Premium)

Required column: `url`

Optional: `name`, `category`, `time` (HH:MM:SS), `date` (YYYY-MM-DD), `recurring` (true/false), `repeat`, `notes`

Download the blank template from the import page. Excel time and date serial values are automatically converted.

---

## Privacy

- All data stored locally in your Chrome browser
- No external servers, no data collection, no tracking, no advertising
- License validation is a one-time check only

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.

---

## Troubleshooting

**Schedules not opening?**
Check Chrome is running on the correct profile. Check grace period in Settings. Run a health check from Backup/Sync.

**Wrong time showing in Edit form?**
Fixed in v2.7.5 — the edit form now shows your local time, not UTC. Recurring schedules auto-advance to the next upcoming time.

**Pages locking when I don't want them to?**
Go to Settings → Default auto re-lock → set to Never → Save Settings.

**Every X Hours saving the wrong value?**
Fixed in v2.7.5 — interval values are now read directly from the input at save time.

---

## Support

- **Email:** TabTimerPro@gmail.com
- **Bug reports:** Open a GitHub issue
- **Feature requests:** Open a GitHub issue with "Feature:" in the title

---

*Made with ❤️ for the sweepstakes and productivity community*
**Version 2.7.5**
