# TabTimer Privacy Policy

**Last Updated: February 17, 2026**

## Overview

TabTimer ("the Extension") is a Chrome browser extension that schedules websites to open automatically at specific times. This privacy policy explains how TabTimer handles your data.

## Data Collection

### What We DON'T Collect

TabTimer does **NOT** collect, transmit, or share:
- Your browsing history
- Your scheduled URLs
- Your personal information
- Your usage patterns
- Any analytics or telemetry data
- Cookies or tracking information

### What We DO Store (Locally Only)

All data is stored **locally on your device** using Chrome's built-in storage API:

- **Scheduled URLs** - The websites you choose to schedule
- **Schedule settings** - Times, categories, repeat options, notes
- **Preferences** - Theme, notification settings, timezone
- **License key** - If you purchase Premium (stored locally for validation)
- **Backup data** - If you use the auto-backup feature

This data **never leaves your device** except when:
1. You manually export a backup file
2. You use Cloud Sync to export data (you control where the file goes)

## License Validation

If you purchase a Premium license:
- Your license key is validated once against our server
- Only the license key is transmitted (no personal data)
- The validation result is cached locally
- No ongoing communication with external servers

## Permissions Explained

TabTimer requests the following Chrome permissions:

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your schedules and settings locally |
| `alarms` | Trigger scheduled tab openings |
| `tabs` | Open new tabs at scheduled times |
| `notifications` | Show desktop notifications when tabs open |
| `contextMenus` | Right-click menu to schedule pages |
| `bookmarks` | Import schedules from bookmark folders (Premium) |
| `offscreen` | Play notification sounds reliably |

## Third-Party Services

TabTimer does not use any third-party analytics, advertising, or tracking services.

The only external resources used:
- **SheetJS library** (cdnjs.cloudflare.com) - Loaded only when importing Excel files, used to parse .xlsx files locally

## Data Security

- All data is stored using Chrome's secure storage API
- Data is sandboxed within the extension
- No data is transmitted over the network (except license validation)
- You can delete all data at any time via Chrome's extension settings

## Your Rights

You have complete control over your data:

- **Export** - Download all your data as a JSON file anytime
- **Delete** - Clear all data via `chrome://extensions/` → TabTimer → Clear site data
- **Review** - All data is visible in the extension's management page

## Children's Privacy

TabTimer does not knowingly collect any information from children under 13 years of age.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be noted with an updated "Last Updated" date at the top of this document.

## Open Source

TabTimer's code is available for review on GitHub. You can verify our privacy practices by examining the source code.

## Contact

If you have questions about this privacy policy:

- **Email**: TabTimerPro@gmail.com
- **GitHub**: Open an issue on our repository

---

## Summary

✅ All data stored locally on your device  
✅ No tracking or analytics  
✅ No data sold or shared  
✅ You control your data completely  
✅ Open source and auditable  

---

*TabTimer Version 2.7.1*
