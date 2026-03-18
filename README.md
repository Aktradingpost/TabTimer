# TabTimer — Smart Website Scheduler

**Automatically open any website at the exact time you choose. Set it once — TabTimer does the rest.**

TabTimer is a Chrome extension built for sweepstakes enthusiasts, deal hunters, and anyone who needs websites to open automatically on a schedule. No more missed entries. No more forgetting.

[![Version](https://img.shields.io/badge/version-2.8.22-orange)](https://github.com/yourusername/tabtimer)
[![License](https://img.shields.io/badge/license-Proprietary-blue)]()
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Published-green)](https://chrome.google.com/webstore)

---

## Features

### Free Features
- Schedule any website to open at a set time
- Daily, Weekly, Monthly, Once, and Yearly repeat types
- Right-click any page → "Schedule this page"
- Quick Schedule: Tomorrow 7 AM or 1 Hour from Now (Alt+L)
- Auto-delete expired one-time schedules
- Light and dark theme
- Backup and restore all your schedules
- Manage all schedules from one dashboard
- Category filters (Daily, Weekly, Monthly, Once, Other)
- **Google Drive History** — connect your Google account and manually export your full schedule history to a Google Sheet at any time (free)
- **Expire Time field** — set an exact date and time for any schedule to be silently deleted
- **Take focus when opening** — per-schedule option to bring a tab to the front regardless of global background setting
- **Auto health check** — stuck schedules are silently repaired every time the management page opens

### PRO Features — $10 Lifetime License
- **Weekdays (Mon–Fri)** repeat
- **Mon–Sat** repeat — perfect for mail-in sweepstakes postmark dates
- Weekends, Every 2 Weeks, Every 3 Weeks repeat
- Every X Minutes and Every X Hours repeat
- Custom Days Interval and Specific Dates repeat
- Every 2 Months, Quarterly, Every 6 Months, Leap Year repeat
- **Custom categories** with your own emoji and color
- **Edit category emoji, name, and color** anytime
- **Notes field** — paste entry instructions with each schedule
- Bulk import schedules via CSV or Excel
- Text URL import with pipe format for individual expire times (`https://example.com | 2026-03-31 09:00`)
- Bookmark folder import with per-bookmark expire time popup for dated bookmarks
- Auto-close tabs after opening
- Sound notification when a tab opens
- Advance reminder notification (seconds before opening)
- Never Lock mode — opens tab without blocking your browsing
- **Auto-sync to Google Drive** — syncs immediately on every schedule change plus daily refresh
- One-time payment, no subscription ever

---

## How It Works

1. **Right-click** any page and choose "Schedule this page" — or press **Alt+L** on any tab
2. Pick your time, repeat type, and category
3. TabTimer opens the page automatically at the scheduled time
4. Recurring schedules reset themselves automatically for the next occurrence

---

## Installation (Development / Load Unpacked)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked** and select the TabTimer folder
5. The TabTimer icon will appear in your Chrome toolbar

---

## Google Drive History

TabTimer can export your schedule history to a Google Sheet stored in your own Google Drive. This gives you a permanent record of every website you have ever scheduled — including ones that have expired or been deleted — so you can look back months later and see exactly how many times you visited any site.

### How it works
1. Go to **Backup/Sync** in the sidebar and click **Connect Google Account**
2. Sign in with your Google account — TabTimer will create a sheet called **TabTimer History** in your Drive
3. Click **Export to Drive Now** any time to update the sheet manually (free)
4. PRO users can enable **Auto-sync** to have the sheet update automatically every time a schedule changes

### What gets recorded
The sheet has two tabs:
- **History** — a permanent log of every schedule you have ever created; expired or deleted schedules are marked "Expired" rather than removed, so your full history is always preserved
- **Active Schedules** — a live snapshot of everything currently scheduled in TabTimer

### Columns recorded
Name, URL, Category, Repeat Type, Schedule Time, Expiration Date, Expire Time, Open Count, Date Added, Last Opened, Status, Notes

### Sheet formatting
- Header row and first column (Name) are frozen for easy scrolling
- Columns auto-size to content width after each export
- URL column is capped at 250px so long URLs do not take over the sheet

### Reset & Recreate Sheet
If you need to start fresh, use the **🗑️ Reset & Recreate Sheet** button in the Google Drive History card. This deletes your existing sheet, creates a new one with fresh formatting, and re-exports all your data automatically.

### Privacy
Your data goes directly from TabTimer to your own personal Google Drive. TabTimer does not send your data to any third-party server. Only you have access to the sheet.

---

## Backup & Restore

TabTimer includes a full backup and restore system under **Backup/Sync** in the sidebar.

- **Export** saves a JSON file with all your schedules, categories, settings, and license info
- **Import** restores everything from that file, including custom categories like Mail, Phone, and Unlimited
- Your premium license is always preserved during import — it will never be overwritten by a backup

---

## Categories

TabTimer includes five default categories: Daily, Weekly, Monthly, Once, and Other.

PRO users can create custom categories with a name, emoji, and color. To manage categories, click **Categories** in the Tools section of the sidebar.

- Click **+ Add Category** to create a new one
- Click **✏️ Edit** to change the emoji, name, or color of any category
- Custom categories show their emoji in the left sidebar for quick filtering

---

## Frequently Asked Questions

**Does TabTimer work when Chrome is closed?**
No — Chrome must be running for TabTimer to open tabs at scheduled times. The extension runs in the background as long as Chrome is open.

**What happens if I miss a scheduled time?**
TabTimer has a built-in health check that repairs missed or stuck schedules automatically. One-time schedules that have passed are marked as complete. Recurring schedules are reset to the next valid time.

**Will importing a backup erase my license?**
No. Your active premium license is always preserved. Only trial information is restored from a backup if you do not already have a paid license.

**What is Mon–Sat repeat?**
Mon–Sat fires every day of the week except Sunday. This is useful for mail-in sweepstakes where entries must be postmarked on a weekday or Saturday but not Sunday.

**Is my data private?**
Yes. TabTimer stores all data locally on your device using Chrome's built-in storage. No data is sent to any server. There are no accounts, no tracking, and no ads.

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Core scheduling, daily/weekly/monthly/once repeat, backup & restore |
| PRO | $10 one-time | All repeat types, custom categories, notes, bulk import, sound alerts, and more |

Purchase a PRO license at [tabtimerpro.com](https://tabtimerpro.com) or from the Premium button inside the extension.

---

## Privacy Policy

TabTimer does not collect, transmit, or store any personal data on external servers. All schedule data, settings, and license information are stored locally in your browser using `chrome.storage.local`. No analytics, no tracking, no ads.

**Google Drive History (optional feature):** If you choose to connect your Google account and use the Google Drive History feature, your schedule data is sent directly from your browser to your own personal Google Drive using Google's official API. TabTimer does not have access to your Google account beyond creating and updating the single TabTimer History spreadsheet. You can disconnect your Google account at any time from the Backup/Sync section. No schedule data is ever sent to TabTimer's servers — it goes directly to your own Google Drive and nowhere else.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

## Publisher

Published on the Chrome Web Store by **NestlyTab**.

For support, feature requests, or bug reports, please open an issue on GitHub.
