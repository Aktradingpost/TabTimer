# TabTimer — Smart Website Scheduler

**Automatically open any website at the exact time you choose. Set it once — TabTimer does the rest.**

TabTimer is a Chrome extension built for sweepstakes enthusiasts, deal hunters, and anyone who needs websites to open automatically on a schedule. No more missed entries. No more forgetting.

[![Version](https://img.shields.io/badge/version-2.8.20-orange)](https://github.com/yourusername/tabtimer)
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
- Bookmark folder import
- Auto-close tabs after opening
- Sound notification when a tab opens
- Advance reminder notification (seconds before opening)
- Never Lock mode — opens tab without blocking your browsing
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

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

## Publisher

Published on the Chrome Web Store by **NestlyTab**.

For support, feature requests, or bug reports, please open an issue on GitHub.
