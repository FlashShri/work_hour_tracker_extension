# Changelog

All notable changes to Work Hours Tracker extension will be documented in this file.

## [2.0.0] - 2024-02-13

### 🎉 Major New Features

#### ⚙️ Customizable Target Hours
- **Adjustable Target**: Set your daily target hours from 1 to 24 hours (0.5 hour increments)
- **Flexible Notifications**: Warnings and completion alerts adjust based on your custom target
- **Settings Panel**: Easy-to-use interface for changing target hours
- **Persistent Settings**: Your target preference is saved across sessions

#### ✏️ Editable Punch In Time
- **Click to Edit**: Simply click on your displayed punch in time to modify it
- **Time Picker Modal**: User-friendly interface to select the correct time
- **Real-time Updates**: Changes apply immediately to your current session
- **Audit Trail**: All edits are logged in today's activity log

#### 📝 Manual Entry System
- **Historical Entries**: Add work sessions for past dates you forgot to track
- **Custom Time Entry**: Specify exact punch in and punch out times
- **Flexible Modes**:
  - Historical: Both punch in/out required for past dates
  - Active Session: Only punch in needed for today
- **Date Selector**: Easy calendar picker for choosing entry dates
- **Visual Indicators**: Manual entries are marked in history

### 🔄 Changed
- **Dynamic TARGET_HOURS**: Changed from constant to variable loaded from storage
- **Enhanced UI**: Added modal dialogs for better user experience
- **Improved Info Display**: Target hours now shown dynamically
- **Updated Notifications**: Notification messages now reference custom target hours
- **Better History**: Manual entries are distinguished from automatic ones

### 🎨 UI Improvements
- Added Settings panel with collapsible interface
- New "Manual Entry" button for quick access
- Modal windows for edit operations
- Enhanced styling for input fields and forms
- Improved visual feedback for actions

### 🐛 Bug Fixes
- Fixed notification timing to work with any target hours
- Improved time calculation accuracy for custom targets
- Better error handling for manual entry validation

### 📝 Documentation
- Complete rewrite of README.md with v2.0 features
- Updated QUICKSTART.txt with new functionality
- Added usage examples for all new features
- Included troubleshooting for common scenarios

---

## [1.0.0] - Initial Release

### ✨ Core Features
- **Automatic Punch In/Out**: One-click time tracking
- **Break Time Management**: Separate tracking for breaks
- **Live Timer**: Real-time display of working hours
- **8.5 Hour Target**: Fixed target with notifications at 8 and 8.5 hours
- **Badge Counter**: Visual hours indicator on extension icon
- **Daily Log**: Track all day's activities
- **7-Day History**: View past week's work sessions
- **Completion Status**: Visual indicators for meeting daily targets

### 🔧 Technical Features
- Chrome storage API for data persistence
- Alarm API for periodic checks
- Notification API for alerts
- Service worker background script
- Clean, modern UI design

---

## Migration Guide: v1.0 → v2.0

### What Stays the Same
- All your existing history is preserved
- Core punch in/out functionality unchanged
- Break tracking works exactly the same
- Badge and notification system (just more flexible now)

### What Changes
- Default target is still 8.5 hours (you can change it)
- You can now edit punch in times (couldn't before)
- You can add manual entries (new feature)
- Settings interface added (new)

### How to Upgrade
1. Remove v1.0 from chrome://extensions/
2. Install v2.0 following normal installation steps
3. Your data migrates automatically
4. Set your preferred target hours in Settings (optional)

### New Capabilities You Get
- Fix mistakes with edit feature
- Backfill forgotten days with manual entry
- Adjust target for flexible work schedules
- Better control over your time tracking

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version (2.x.x): Incompatible API changes or major new features
- **MINOR** version (x.1.x): New features, backwards compatible
- **PATCH** version (x.x.1): Bug fixes, backwards compatible

---

**Current Version**: 2.0.0
**Last Updated**: February 13, 2024
