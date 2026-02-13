# TabTimer User Guide

A complete guide to using TabTimer - the smart website scheduler for Chrome.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Adding Schedules](#adding-schedules)
3. [Managing Schedules](#managing-schedules)
4. [Quick Filters](#quick-filters)
5. [Bulk Actions](#bulk-actions)
6. [Categories (Premium)](#categories-premium)
7. [Bulk Import (Premium)](#bulk-import-premium)
8. [Bulk Reschedule (Premium)](#bulk-reschedule-premium)
9. [Backup and Restore](#backup-and-restore)
10. [Settings](#settings)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [Troubleshooting](#troubleshooting)
13. [FAQ](#faq)

---

## Getting Started

### Opening TabTimer

There are several ways to access TabTimer:

1. **Toolbar Icon** - Click the TabTimer icon in your Chrome toolbar
2. **Keyboard Shortcut** - Press `Alt+L` on any webpage to quickly add it
3. **Right-click Menu** - Right-click on any page and select "Schedule this page"

### The Main Interface

When you open TabTimer Management, you'll see:

- **Navigation Sidebar** (left) - Access different sections and filters
- **Stats Dashboard** (top) - Overview of your schedules
- **Schedule List** (center) - All your scheduled websites
- **Quick Actions** (right) - Edit, duplicate, or delete schedules

---

## Adding Schedules

### Method 1: From the Popup

1. Click the TabTimer icon in your toolbar
2. The current page URL is auto-filled (or enter a different URL)
3. Enter a name for the schedule
4. Set the date and time
5. Configure options:
   - **Recurring** - Check to repeat on a schedule
   - **Re-lock time** - How long before the schedule resets (default: 5 minutes)
6. Click **Add Schedule**

### Method 2: From the Management Page

1. Click "Manage Schedules" or go to the Management page
2. Click **+ Add New** in the sidebar
3. Fill in the schedule details
4. Click **Add Schedule**

### Method 3: Quick Add with Alt+L

1. Navigate to any webpage you want to schedule
2. Press `Alt+L`
3. The popup opens with the URL pre-filled
4. Set your time and options
5. Click **Add Schedule**

### Schedule Options Explained

| Option | Description |
|--------|-------------|
| **URL** | The website address to open |
| **Name** | A friendly name (auto-generated from page title if blank) |
| **Date/Time** | When the tab should open |
| **Category** | Organize by category (Premium) |
| **Recurring** | Enable to repeat automatically |
| **Repeat Type** | Daily, Weekly, Monthly, or Custom interval |
| **Re-lock Time** | Minutes after opening before schedule resets (1-60) |
| **Auto-close** | Automatically close the tab after X minutes |

---

## Managing Schedules

### Viewing Schedules

Your schedules are displayed as cards showing:
- **Name** and **URL**
- **Status badges** (Recurring, Daily/Weekly/Monthly, Category)
- **Schedule info** (Opens/Opened time, Re-lock duration, Open count)
- **Next occurrence** for recurring schedules

### Schedule Status

- **⏰ Opens** - Waiting to open at the scheduled time (Active)
- **✅ Opened** - Already opened, waiting to re-lock (Not Active)

### Editing a Schedule

1. Click the **✏️ Edit** button on any schedule
2. Modify any fields
3. Click **Save Changes**

**Tip:** Double-click a schedule name to quickly rename it inline.

### Duplicating a Schedule

1. Click the **📋 Duplicate** button
2. Choose a time for the copy:
   - Same time (will show conflict warning)
   - 1 minute later
   - 5 minutes later
   - Custom time
3. The duplicate is created with "(copy)" appended to the name

### Deleting Schedules

- **Single delete** - Click the **🗑️ Delete** button
- **Bulk delete** - Select multiple schedules with checkboxes, then click **Delete**

### Sorting Schedules

Use the dropdown menu to sort by:
- Time (Soon - Late) - Default
- Time (Late - Soon)
- Name (A-Z)
- Name (Z-A)
- Open Count (High - Low)

---

## Quick Filters

The sidebar includes quick filters to find schedules:

| Filter | Shows |
|--------|-------|
| **All Schedules** | Everything |
| **Active** | Schedules waiting to open |
| **Not Active** | Schedules that have opened and are waiting to re-lock |
| **Recurring** | Only recurring schedules |
| **Today** | Schedules set for today |

Click any filter to apply it. Click **All Schedules** to clear filters.

---

## Bulk Actions

Select multiple schedules using the checkboxes, then use the bulk action bar:

| Action | Description |
|--------|-------------|
| **🔍 Resolve URLs** | Resolve shortened URLs to final destinations |
| **Open All Selected** | Open all selected URLs in new tabs (doesn't affect schedules) |
| **📅 Reschedule** | Bulk reschedule with staggered times (Premium) |
| **Shift Time** | Move all selected schedules forward or backward in time |
| **Duplicate** | Create copies of all selected schedules |
| **Delete** | Delete all selected schedules |
| **Clear** | Deselect all |

### Shift Time

Shift selected schedules by a specific amount:
- -1 hour, -30 min, +30 min, +1 hour, +1 day
- Or enter a custom number of minutes (negative for earlier)

---

## Categories (Premium)

Organize your schedules with custom categories.

### Creating Categories

1. Go to **Categories** in the sidebar
2. Click **+ Add Category**
3. Enter a name
4. Choose an emoji and color
5. Click **Save**

### Using Categories

- Assign categories when creating or editing schedules
- Filter by category using the dropdown in the schedule list
- Categories appear as colored badges on schedules

### Default Categories

TabTimer includes these default categories:
- 📅 Daily
- 📆 Weekly
- 🗓️ Monthly
- 🎯 Once
- 📌 Other

---

## Bulk Import (Premium)

Import multiple URLs at once.

### How to Use

1. Go to **Bulk Import** in the sidebar
2. Paste your URLs (one per line)
3. Set the **Start Time** for the first URL
4. Enable **Stagger** to space out the schedules
5. Set the interval between schedules (e.g., 60 seconds)
6. Configure default options (recurring, re-lock time, category)
7. Click **Preview Import** to review
8. Click **Import All** to add the schedules

### Import Format

Each line should contain a URL. You can optionally include a name:
```
https://example.com/page1
https://example.com/page2 | My Custom Name
https://example.com/page3
```

### Duplicate Detection

TabTimer automatically detects if a URL already exists in your schedules and will show a warning, allowing you to skip duplicates.

---

## Bulk Reschedule (Premium)

Reschedule multiple existing schedules with intelligent conflict detection.

### How to Use

1. Select the schedules you want to reschedule (use checkboxes)
2. Click **📅 Reschedule** in the bulk action bar
3. Set the **Start Time** for the first schedule
4. Choose the **Interval** between schedules (30 sec to 10 min)
5. Review the **Preview** showing new times
6. If conflicts are detected, times are automatically adjusted
7. Click **Reschedule All** to apply

### Conflict Detection

If a proposed time conflicts with another schedule (not in your selection), TabTimer automatically moves it to the next available slot and shows you the adjustment in yellow.

---

## Backup and Restore

### Creating a Backup

1. Go to **Backup/Sync** in the sidebar
2. Click **Export Full Backup**
3. A JSON file is downloaded containing all your data

### Restoring from Backup

1. Go to **Backup/Sync**
2. Click **Import Full Backup**
3. Select your backup file
4. All schedules, settings, and categories are restored

### What's Included in Backups

- All schedules with their settings
- Categories
- Folders
- Application settings
- License information (if premium)

---

## Settings

Access settings from the **Settings** link in the sidebar.

### Available Settings

| Setting | Description |
|---------|-------------|
| **Default Category** | Category applied to new schedules |
| **Default Re-lock Time** | Default minutes before schedule resets |
| **Timezone** | Your timezone for schedule calculations |
| **Expiration Time** | When schedules with dates in name auto-delete |
| **Grace Period** | How long after missed schedule it will still open (Premium) |

### Grace Period (Premium)

If Chrome wasn't running at a scheduled time, the grace period determines how long after the scheduled time TabTimer will still open the tab:
- 2 minutes (default)
- 30 minutes
- 1-8 hours

### Test Notification

Click **Test Notification** to verify Chrome notifications are working.

### Repair Stuck Schedules

If schedules are showing incorrect status (e.g., "Not Active" when they should be "Active"), click **Repair Stuck Schedules** to fix them.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+L` | Quick-add current page to schedules |
| `/` | Focus search box (when on management page) |
| `Escape` | Close modals, clear search |
| `Ctrl+A` | Select all visible schedules |

---

## Troubleshooting

### Schedules Not Opening

**Problem:** Scheduled tabs aren't opening at the set time.

**Solutions:**
1. **Is Chrome running?** - TabTimer only works when Chrome is open
2. **Check the status** - Make sure the schedule shows "⏰ Opens" not "✅ Opened"
3. **Repair schedules** - Go to Settings → Click "Repair Stuck Schedules"
4. **Check the time** - Ensure your computer's clock is correct
5. **Reload the extension** - Go to `chrome://extensions/`, find TabTimer, click the refresh icon

### Schedules Showing "Not Active" Incorrectly

**Problem:** Schedules set for the future show as "Not Active" instead of "Active".

**Solution:** Go to Settings → Click "Repair Stuck Schedules". This resets the status for all schedules with future times.

### Recurring Schedules Stuck in the Past

**Problem:** Recurring schedules show past dates that don't advance.

**Solution:** Click "Repair Stuck Schedules" in Settings. This calculates the next future occurrence for all recurring schedules.

### Import Not Working

**Problem:** Importing a backup doesn't restore schedules.

**Solutions:**
1. Make sure the file is a valid TabTimer backup (JSON format)
2. After import, refresh the page
3. Check if schedules were imported but showing as "Not Active" - use Repair if needed

### Extension Not Loading

**Problem:** TabTimer icon doesn't appear or clicking it does nothing.

**Solutions:**
1. Go to `chrome://extensions/`
2. Make sure TabTimer is enabled
3. Click the refresh icon to reload the extension
4. If problems persist, remove and reinstall the extension

---

## FAQ

### Does TabTimer work when Chrome is closed?

No. TabTimer requires Chrome to be running to open scheduled tabs. However, if you open Chrome within the grace period after a missed schedule, it will still open.

### How many schedules can I have?

There's no hard limit. TabTimer can handle hundreds of schedules, though very large numbers may affect performance.

### Do schedules work across devices?

Schedules are stored locally on each device. Use the Backup/Restore feature to manually transfer schedules between devices.

### What happens if I miss a scheduled time?

If Chrome is running, the schedule opens during the grace period (default: 2 minutes, configurable in Premium). For recurring schedules, the next occurrence is calculated automatically.

### How does the re-lock time work?

After a schedule opens, it's marked as "Opened" for the re-lock duration (default: 5 minutes). During this time, it won't open again. After the re-lock period, recurring schedules calculate their next occurrence and become "Active" again.

### Can I schedule multiple URLs for the same time?

Yes, but be aware that opening many tabs simultaneously may be resource-intensive. Consider using staggered times (e.g., 30 seconds apart) for better performance.

### How do I cancel a schedule that's about to open?

You can either:
- Delete the schedule before it opens
- Edit the schedule to change the time
- Mark it as manually unlocked (click the schedule, then "Unlock")

### Is my data private?

Yes. All schedule data is stored locally in Chrome's storage on your computer. TabTimer does not send your URLs or any data to external servers.

---

## Getting Help

If you encounter issues not covered here:

1. **Check for updates** - Make sure you have the latest version
2. **Restart Chrome** - Sometimes a simple restart fixes issues
3. **Report a bug** - Visit our GitHub Issues page

---

<p align="center">
  <strong>Thank you for using TabTimer!</strong><br>
  Made with ❤️ for productivity enthusiasts
</p>
