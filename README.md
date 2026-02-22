# 🕐 Work Hours Tracker v3.0 - Chrome Extension

A beautiful, dark-themed Chrome extension to track your daily work hours with **editable times**, **customizable targets**, **break categories**, and **advanced CSV exports**.

## ✨ NEW in Version 3.0

- **🎨 Modern Dark Theme** - Completely redesigned UI with beautiful gradients, JetBrains Mono font, and smooth micro-animations.
- **⏱️ Progress Ring** - Visual SVG circular progress ring filling up as you reach your target hours.
- **📑 Tabbed Interface** - Cleanly separated tabs for **Today**, **History**, and **Settings**.
- **📥 CSV Export** - One-click export of your 7-day history to a `.csv` file.
- **📊 Weekly Summary** - See your total 7-day hours and earnings at a glance.
- **⌨️ Keyboard Shortcuts** - Use `Ctrl+Shift+P` (or `Cmd+Shift+P`) to quickly Punch In or Punch Out!
- **🏷️ Break Categories** - Categorize your breaks (Lunch, Coffee, Personal) for better tracking.
- **🍞 Toast Notifications** - Unobtrusive slide-in notifications replaced all annoying pop-up alerts.

## ✨ All Features

### Core Tracking
- **Easy Punch In/Out**: One-click (or keyboard shortcut) to start and stop tracking.
- **Live Timer & Ring**: See your working hours and visual progress in real-time.
- **Smart Breaks**: Track your breaks with specific categories (they don't count towards work hours).

### Smart Features
- **Editable Punch Times**: Click on your punch-in time to edit it dynamically.
- **Manual Time Entry**: Add entries for past days or set custom times.
- **Flexible Settings**: Adjust your daily target (1-24 hours) and your monthly salary.
- **Dynamic Notifications**:
  - TTS warning (via background voice) 30 minutes before reaching target.
  - Success message + visual progress ring completion when target is met.
- **Badge Counter**: Shows hours worked directly on the Chrome extension icon.

### History & Insights
- **Today's Log**: Track all your punch ins, outs, and breaks for the current day.
- **7-Day Rolling History**: View your completed metrics from the last week directly on the History tab.
- **CSV Data Export**: Download your data locally, ensuring you retain full copies of your performance.

## 📦 Installation

### Step 1: Download the Extension
1. Clone or download this repository folder.
2. Save it somewhere permanent on your computer.

### Step 2: Install in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner).
3. Click the **"Load unpacked"** button.
4. Select the extension folder.
5. Done! You should see the `WorkTrack` icon in your toolbar 🎉

> **Tip**: Click the puzzle icon in the Chrome toolbar and pin the extension to keep it visible!

## 🚀 How to Use

### 1. Daily Tracking
1. Open the extension or press `Ctrl+Shift+P` to quickly punch in.
2. The timer and progress ring will begin filling automatically.
3. If taking a break, choose a category from the dropdown (General, Lunch, Coffee, etc.) and click **"☕ Break"**.
4. When finished for the day, press `Ctrl+Shift+P` or click **"🔴 Punch Out"**.
5. Confirm the action in the red modal lock, and your completion is logged!

### 2. Customizing Targets
1. Click the **"Settings"** tab.
2. Change your **Target Hours / Day** (e.g., 7.5).
3. Add a **Monthly Salary** to unlock live tracking of "Earned Today".
4. Click **"💾 Save Settings"**.

### 3. Reviewing & Exporting History
1. Click on the **"History"** tab.
2. Review your "7-Day Total" at the top of the interface.
3. Scroll through your recent daily logs.
4. Click **"📥 Export CSV"** to download your tracked timesheet.

## 🔒 Privacy

- All data is stored **100% locally** via Chrome Extension Standard Storage (`chrome.storage.local`).
- No external databases, telemetry, tracking, or network backend dependencies.
- You own your data.

## 📝 File Structure

```text
work_hour_tracker_extension/
├── manifest.json       # Manifest V3 Configuration
├── popup.html          # Tabbed, Dark-Theme UI Structure
├── popup.js            # Core UI, Timers, History, CSV Logic
├── background.js       # Background Alarms, TTS & Notifications
├── styles.css          # Modern CSS, Design Tokens, Animations
└── README.md           # This file
```

---

**Version 3.0** - Premium Aesthetics, Smarter Tracking! 🎉
