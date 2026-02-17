# TabTimer - Smart Website Scheduler

<p align="center">
  <img src="icons/icon128.png" alt="TabTimer Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Schedule websites to open automatically at specific times</strong><br>
  Free forever with optional Premium features
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#premium-features">Premium</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a>
</p>

---

## 🎯 What is TabTimer?

TabTimer is a Chrome extension that automatically opens websites at scheduled times. Perfect for:

- 📰 **Daily reading** - News sites, blogs, newsletters
- 🎯 **Contests & Sweepstakes** - Never miss an entry window
- 📊 **Work dashboards** - Open reports at the start of each day
- ⏰ **Reminders** - Time-sensitive pages that need your attention
- 🔄 **Recurring tasks** - Weekly meetings, monthly reports

## ✨ Features

### Core Features (Free)
- ⏰ Schedule any URL to open at a specific time
- 🔄 Recurring schedules (daily, weekly, monthly, yearly, and more)
- 📁 Organize with categories
- 🔒 Lock overlay prevents accidental early access
- 🔓 Temporary unlock (5/15/30/60 minutes) - access page now, auto-relocks later
- 🔔 Desktop notifications
- 🔊 Sound notifications when tabs open
- ⏸️ Pause/Resume all schedules with one click
- 🌙 Dark/Light theme
- 💾 Backup & restore your schedules
- ⌨️ Keyboard shortcuts
- 🏥 Automatic health check on startup

### Premium Features ($10 Lifetime)
- 📦 **Bulk import from text** - Paste multiple URLs
- 📄 **Bulk import from CSV/Excel** - Import from spreadsheets
- 🔖 **Bulk import from bookmarks** - Import entire bookmark folders
- 🎨 Custom colors for schedules
- 📂 Custom categories
- ☁️ Cloud sync between devices
- 📝 Notes for each schedule (click to view!)
- 🔍 Advanced search with date filters and saved filters
- ↕️ Drag & drop reordering
- ⏱️ Bulk reschedule selected items
- ⏩ Shift time for multiple schedules
- 🆓 7-day free trial included

## 📦 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store listing](#)
2. Click "Add to Chrome"
3. Pin the extension for easy access

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the TabTimer folder

## 🚀 Quick Start

### Method 1: Right-Click Menu
1. Navigate to any website
2. Right-click anywhere on the page
3. Select **🕐 TabTimer → 📅 Schedule this page**
4. Choose time, repeat options, and click Schedule

### Method 2: Keyboard Shortcut
1. On any webpage, press **Alt+L**
2. Fill in the schedule details
3. Click Schedule

### Method 3: Management Page
1. Click the TabTimer icon in your toolbar
2. Click "Open TabTimer" or press **Alt+O**
3. Go to "Add New" and enter URL details manually

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+L` | Schedule current page |
| `Alt+U` | Unschedule current page |
| `Alt+O` | Open TabTimer management |
| `Ctrl+A` | Select all schedules |
| `Shift+Click` | Select range of schedules |
| `Ctrl+Click` | Add/remove from selection |
| `Del` | Delete selected |
| `Ctrl+D` | Duplicate selected |
| `Ctrl+N` | New schedule |
| `Ctrl+F` | Focus search |
| `Ctrl+T` | Toggle theme |
| `Ctrl+P` | Pause/Resume all |
| `Esc` | Deselect all / Close modal |
| `?` | Show shortcuts |

## 🔄 Repeat Options

TabTimer supports flexible recurring schedules:

- **None** - One-time schedule
- **Daily** - Every day at the same time
- **Weekdays** - Monday through Friday
- **Weekends** - Saturday and Sunday
- **Weekly** - Same day each week
- **Biweekly** - Every 2 weeks
- **Monthly** - Same day each month
- **Quarterly** - Every 3 months
- **Yearly** - Annual reminder
- **Custom** - Every X minutes, hours, or days

## ⚙️ Settings

Access settings from the management page:

- **Grace Period** - How long after scheduled time to still open tabs (default: 1 hour)
- **Stagger Interval** - Delay between opening multiple missed tabs (default: 15 seconds)
- **Auto Re-lock** - Time before manually unlocked pages re-lock (0 = never)
- **Notifications** - Enable/disable desktop notifications
- **Auto-delete** - Remove schedules after expiration date in name
- **Open in Background** - New tabs open without stealing focus
- **Timezone** - Your local timezone for accurate scheduling

## 📋 Schedule Features

- **Date prefix** (`2025-12-31 My Event`) - Auto-deletes after that date
- **Notes** - Add detailed notes, click the 📝 badge to view (Premium)
- **Sound** - Play notification sound when tab opens
- **Auto-close** - Automatically close tab after X minutes

## 📄 CSV/Excel Import (Premium)

Import schedules from spreadsheet files:

**Required column:** `url`

**Optional columns:**
- `name` - Schedule name
- `category` - Category (Daily, Weekly, etc.)
- `time` - Time in HH:MM or HH:MM:SS format
- `date` - Date in YYYY-MM-DD format
- `recurring` - true/false
- `repeat` - daily, weekly, monthly, etc.
- `notes` - Notes for the schedule

Download the template CSV from the import page to get started.

## 🔍 Advanced Search (Premium)

- **Search By**: Scheduled Time, Expiration Date (in name), or Either
- **Date Range**: Filter schedules within specific dates
- **Status Filter**: Active, Opened, Recurring, or One-time
- **Save Filters**: Save favorite filter combinations

## 💾 Backup & Sync

### Local Backup
- Export all schedules to a JSON file
- Import from a previous backup
- Auto-backup option (daily/weekly/monthly)

### Cloud Sync (Premium)
- Export your data for cloud storage
- Import on another device
- Smart merge without duplicates

## 🏥 Health Check

Automatic health checks run on startup:
- Fixes stuck recurring schedules
- Removes duplicate entries
- Clears orphaned alarms
- Repairs missing fields

Manual health check available in Backup/Sync settings.

## 🔒 Privacy

TabTimer respects your privacy:
- All data stored locally in Chrome
- No external servers or tracking
- No data collection
- License validation only (one-time check)
- Open source code

## 🐛 Troubleshooting

### Schedules not opening?
1. Check if Chrome was open at the scheduled time
2. Verify the grace period setting (default: 1 hour)
3. Run a health check from Backup/Sync
4. Make sure schedules aren't paused

### Sound not playing?
- Verify "Play sound" is checked for the schedule
- Check system volume
- Extension uses offscreen audio for reliability

### Import shows wrong status?
- Future schedules correctly show as Active
- Run a health check to fix existing schedules

## 📄 License

MIT License - Feel free to modify and distribute.

## 🙏 Support

- **Bug reports**: Open an issue on GitHub
- **Feature requests**: Open an issue with "Feature:" prefix
- **Email**: TabTimerPro@gmail.com

---

<p align="center">
  Made with ❤️ for productivity enthusiasts<br>
  Version 2.7.1
</p>
