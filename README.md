# 🕐 Work Hours Tracker v2.0 - Chrome Extension

A powerful and flexible Chrome extension to track your daily work hours with **editable times** and **customizable targets**.

## ✨ NEW in Version 2.0

- **⚙️ Customizable Target Hours** - Set your own daily target (not just 8.5 hours!)
- **✏️ Edit Punch In Time** - Made a mistake? Click to edit your punch in time
- **📝 Manual Entry Mode** - Add historical entries or punch in/out with custom times
- **🎯 Flexible Settings** - Adjust target hours anytime (1-24 hours)
- **📊 Enhanced History** - Manual entries are clearly marked

## ✨ All Features

### Core Tracking
- **Easy Punch In/Out**: One-click to start and stop tracking
- **Break Time Tracking**: Track your breaks separately (they don't count towards work hours)
- **Live Timer**: See your working hours in real-time
- **Visual Progress**: Color-coded status (working/break/completed)

### Smart Features
- **Editable Punch Times**: Click on your punch in time to edit it
- **Manual Time Entry**: Add entries for past days or set custom times
- **Customizable Target**: Set target hours from 1 to 24 hours
- **Smart Notifications**: 
  - Warning at target - 30 minutes
  - Completion notification when target is reached
- **Badge Counter**: Shows hours worked on the extension icon

### History & Insights
- **Daily Log**: Track all your punch ins, outs, and breaks
- **7-Day History**: See your work patterns with completion status
- **Manual Entry Tracking**: Historical entries are marked in the log
- **Estimated Completion Time**: Know exactly when you can leave

## 📦 Installation

### Step 1: Download the Extension
1. Download the `work-hours-tracker` folder
2. Save it somewhere permanent on your computer (don't delete it later!)

### Step 2: Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"** button
4. Select the `work-hours-tracker` folder
5. Done! You should see the extension icon in your toolbar 🎉

### Optional: Pin the Extension
- Click the puzzle icon in Chrome toolbar
- Find "Work Hours Tracker"
- Click the pin icon to keep it visible

## 🚀 How to Use

### Quick Start - Normal Mode
1. Click the extension icon when you arrive at office
2. Click **"🟢 Punch In"** button
3. Take breaks using **"☕ Start Break"** button
4. Click **"🔴 Punch Out"** when leaving

### ⚙️ Customize Your Target Hours
1. Click **"⚙️ Settings"** in the extension
2. Change "Target Hours Per Day" (e.g., 7, 8.5, 9)
3. Click **"💾 Save Settings"**
4. Your new target is applied immediately!

### ✏️ Edit Your Punch In Time
1. **While actively working**, click on the punch in time (displays as "9:00 AM")
2. A modal opens with a time picker
3. Select the correct time
4. Click **"💾 Update"**
5. Your session updates with the new start time!

### 📝 Manual Entry Mode
Perfect for:
- Adding yesterday's hours you forgot to track
- Entering times when you forgot to punch in
- Correcting mistakes

**How to use:**
1. Click **"✏️ Manual Entry"** button
2. Set your punch in time
3. (Optional) Set punch out time
4. Choose the date
5. Click **"💾 Save Entry"**

**Two modes:**
- **Historical Entry**: Provide both punch in AND punch out times for past dates
- **Start Active Session**: Provide only punch in time for TODAY to start tracking now

### 🔔 Notifications
- **At (Target - 30 min)**: You'll get a warning (e.g., at 8 hours if target is 8.5)
- **At Target Hours**: You'll get a completion notification! 🎉
- The extension icon badge shows your current hours worked

## 💡 Usage Examples

### Example 1: Different Target Hours
**Scenario**: Your company requires 7.5 hours instead of 8.5
1. Open extension → Click "⚙️ Settings"
2. Change target to "7.5"
3. Save settings
4. Now you'll be notified at 7 hours (warning) and 7.5 hours (complete)

### Example 2: Forgot to Punch In
**Scenario**: You arrived at 9 AM but forgot to punch in until 10 AM
1. Punch in at 10 AM (when you remember)
2. Click on "10:00 AM" in the extension
3. Change it to "9:00 AM"
4. Your working hours now correctly start from 9 AM!

### Example 3: Add Yesterday's Hours
**Scenario**: You forgot to track yesterday completely
1. Click "✏️ Manual Entry"
2. Set punch in: 9:00 AM
3. Set punch out: 5:30 PM
4. Change date to yesterday
5. Save - it appears in your history!

### Example 4: Flexible Hours
**Scenario**: Working a longer day today (10 hours) to leave early Friday
1. Change target to "10 hours" for today
2. Work your day normally
3. Get notified at 9.5 hours (warning) and 10 hours (complete)
4. Change back to normal target tomorrow

## 📊 What You'll See

- **Live Timer**: Current working time (HH:MM:SS)
- **Remaining Time**: How much time left to complete target
- **Editable Punch In**: Click to change if you made a mistake
- **Estimated Punch Out**: What time you should complete
- **Today's Log**: All your actions today (including edits)
- **Recent History**: Your last 7 work sessions with ✅ or ⚠️

## 🔧 Advanced Tips

### Best Practices
1. **Punch in immediately** when starting work
2. **Use breaks** for accurate tracking (lunch, coffee breaks)
3. **Edit promptly** if you notice a wrong punch in time
4. **Set realistic targets** based on your actual requirements
5. **Review history** weekly to see patterns

## 🔒 Privacy

- All data is stored locally on YOUR computer
- Nothing is sent to any server
- No tracking, no analytics
- Your data stays private

## 🆚 Version Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Auto punch in/out | ✅ | ✅ |
| Break tracking | ✅ | ✅ |
| Fixed target (8.5h) | ✅ | - |
| Custom target hours | - | ✅ |
| Edit punch times | - | ✅ |
| Manual entry | - | ✅ |
| Historical entries | - | ✅ |

## 🐛 Troubleshooting

**Can't edit punch in time?**
- Make sure you're currently punched in (active session)
- Past entries can't be edited (use manual entry instead)

**Manual entry not saving?**
- For past dates: Both punch in AND out required
- For today: Only punch in creates active session
- Check that punch out is after punch in

**Target hours not updating?**
- Make sure to click "Save Settings"
- Refresh the extension popup

## 📱 Sharing with Team

Your team can use different target hours!
1. Share the extension folder
2. Each person installs it
3. Each person sets their own target hours
4. Everyone tracks independently

## 📝 File Structure

```
work-hours-tracker/
├── manifest.json       # Extension configuration (v2.0)
├── popup.html         # UI with modals and settings
├── popup.js           # Logic for editable times & manual entry
├── background.js      # Dynamic target hour notifications
├── styles.css         # Enhanced styling with modals
├── icons/             # Extension icons
└── README.md          # This file
```

## 📄 License

Free to use and modify for personal and commercial use.

---

**Version 2.0** - Now with full control over your time tracking! 🎉

**Made with ❤️ for better work-life balance**
