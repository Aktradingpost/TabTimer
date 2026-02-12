# TabTimer - Smart Website Scheduler

## 🎯 What is TabTimer?

TabTimer is a Chrome extension that automatically opens websites at times you specify. Set it once, and TabTimer handles the rest - 
opening your scheduled sites in new tabs exactly when you need them.

**Perfect for:**
- 📋 Daily task management and workflows
- 📰 Morning news and email routines
- ⏰ Timed reminders and check-ins
- 📅 Any website you visit on a regular schedule

---

## ✨ Features

### Free Features
- **Unlimited Schedules** - Add as many scheduled websites as you need
- **Recurring Schedules** - Daily, weekly, monthly, or custom intervals
- **Auto Re-lock** - Schedules automatically reset for the next occurrence
- **Quick Filters** - View Active, Not Active, Recurring, or Today's schedules
- **Search** - Find schedules quickly by name or URL
- **Keyboard Shortcuts** - Press Alt+L on any page to schedule it
- **Themes** - Light and dark mode support
- **Backup/Restore** - Export and import your schedules
- **URL Resolution** - Resolve shortened URLs to see final destinations

### Premium Features ⭐
- **Bulk Import** - Import multiple URLs at once from a list
- **Bulk Reschedule** - Reschedule multiple URLs with staggered times and conflict detection
- **Categories** - Organize schedules with custom categories and colors
- **Duplicate** - Copy schedules with smart time conflict handling
- **Grace Period Settings** - Configure how long after a missed schedule it will still open

---

## 📥 Installation

### From Chrome Web Store
1. Visit the [TabTimer Chrome Web Store page](#)
2. Click "Add to Chrome"
3. Click "Add Extension" to confirm

### Manual Installation (Developer Mode)
1. Download and extract the TabTimer zip file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extracted TabTimer folder

---

## 🚀 Quick Start

### Adding Your First Schedule

1. **Click the TabTimer icon** in your Chrome toolbar, or press **Alt+L** on any webpage
2. **Enter the URL** you want to schedule
3. **Set the date and time** for when it should open
4. **Enable "Recurring"** if you want it to repeat daily
5. **Click "Add Schedule"**

That's it! TabTimer will open that URL automatically at your scheduled time.

### Managing Schedules

- **View all schedules** - Click the TabTimer icon → "Manage Schedules"
- **Edit a schedule** - Click the ✏️ edit button on any schedule
- **Delete a schedule** - Click the 🗑️ delete button
- **Search schedules** - Use the search box to find by name or URL

---

## 📖 Documentation

For detailed instructions, see the **[User Guide](USERGUIDE.md)**.

---

## ⚙️ How It Works

1. **You set schedules** with URLs and times
2. **TabTimer monitors** the clock in the background
3. **At the scheduled time**, TabTimer opens the URL in a new tab
4. **For recurring schedules**, it automatically calculates the next occurrence
5. **After the re-lock period** (default 5 minutes), the schedule resets for next time

---

## 🔒 Privacy & Permissions

TabTimer requires minimal permissions:
- **Storage** - To save your schedules locally on your computer
- **Alarms** - To trigger scheduled tab openings
- **Tabs** - To open new tabs at scheduled times

**Your data stays local.** TabTimer does not send your URLs or schedule data to any external servers.

---

## 🐛 Troubleshooting

### Schedules not opening?
1. Make sure Chrome is running at the scheduled time
2. Check that the schedule shows as "Active" (not "Not Active")
3. Go to Settings → Click "Repair Stuck Schedules"

### Schedules showing wrong status?
- If schedules show "Not Active" but are scheduled for the future, click "Repair Stuck Schedules" in Settings

### Need to reset all schedules?
- Use Backup/Sync to export your data first, then reimport if needed

---

## 📋 Version History

### v1.0 - Initial Release
- Schedule websites to open automatically
- Recurring schedules (daily, weekly, monthly, custom)
- Auto re-lock functionality
- Light/dark theme support
- Backup and restore
- Premium features: Bulk Import, Categories, Bulk Reschedule

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Support

- **Issues & Bugs**: [GitHub Issues](#)
- **Feature Requests**: [GitHub Discussions](#)

---

  Made with ❤️ for productivity enthusiasts

