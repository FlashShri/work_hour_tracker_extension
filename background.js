// Constants
let TARGET_HOURS = 8.5; // Default, will be loaded from storage
let TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
let hasPlayedCompletionSound = false;

// Load target hours on startup
async function loadTargetHours() {
  const data = await chrome.storage.local.get(['targetHours']);
  if (data.targetHours) {
    TARGET_HOURS = data.targetHours;
    TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
  }
}

// Listen for target hours updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTargetHours') {
    TARGET_HOURS = request.targetHours;
    TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
  }

  if (request.action === 'checkCompletionNow') {
    checkAndNotify();
  }
});
function playCompletionSound() {
  chrome.tts.getVoices(function (voices) {
    // Prefer Kalpana (Hindi) if available, otherwise fall back to any voice
    const preferredVoice = voices.find(
      (v) => v.voiceName === 'Microsoft Kalpana - Hindi (India)'
    );
    const fallbackVoice = voices.find(
      (v) => v.lang && v.lang.startsWith('en')
    );
    const chosenVoice = preferredVoice || fallbackVoice || voices[0];

    if (!chosenVoice) {
      console.warn('TTS: no voices available, skipping completion sound');
      return;
    }

    const isHindi = chosenVoice.lang && chosenVoice.lang.startsWith('hi');
    const message = isHindi
      ? `\u092c\u0938 \u0915\u0930\u094b \u092d\u093e\u0908! ${TARGET_HOURS} \u0918\u0902\u091f\u0947 \u0939\u094b \u0917\u090f. \u0905\u092c \u0915\u094d\u092f\u093e \u091c\u093e\u0928 \u0932\u094b\u0917\u0947 \u0915\u094d\u092f\u093e?`
      : `Great job! You have completed your ${TARGET_HOURS} hour target. Time to wrap up!`;

    const options = {
      rate: 1.0,
      pitch: 1.2,
      volume: 1.0,
      voiceName: chosenVoice.voiceName,
      lang: chosenVoice.lang,
    };

    chrome.tts.speak(message, options);
  });
}

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkCompletion') {
    checkAndNotify();
  }
});

// Check on extension install/update
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Work Hours Tracker installed');
  await loadTargetHours();

  // Check if there's an active session and set up alarm
  chrome.storage.local.get(['isActive'], (data) => {
    if (data.isActive) {
      chrome.alarms.create('checkCompletion', { periodInMinutes: 1 });
    }
  });
});

// Check on browser startup
chrome.runtime.onStartup.addListener(async () => {
  await loadTargetHours();
  chrome.storage.local.get(['isActive'], (data) => {
    if (data.isActive) {
      chrome.alarms.create('checkCompletion', { periodInMinutes: 1 });
    }
  });
});

async function checkAndNotify() {
  // Dynamic storage keys based on target so flags reset correctly when target changes
  const warnKey = `notified_${TARGET_HOURS}_warning`;
  const completeKey = `notified_${TARGET_HOURS}_complete`;


  const data = await chrome.storage.local.get([
    'punchInTime',
    'isActive',
    'totalBreakTime',
    'breakStartTime',
    warnKey,
    completeKey,
  ]);

  if (!data.isActive || !data.punchInTime) {
    return;
  }

  const now = Date.now();
  const totalBreakTime = data.totalBreakTime || 0;

  // Don't count current break time towards completion
  let currentBreakTime = 0;
  if (data.breakStartTime) {
    currentBreakTime = now - data.breakStartTime;
  }

  const totalElapsed = now - data.punchInTime;
  const workingTime = totalElapsed - totalBreakTime - currentBreakTime;

  // Update badge with hours worked
  const hoursWorked = Math.floor(workingTime / (60 * 60 * 1000));
  const remaining = TARGET_MS - workingTime;

  chrome.action.setBadgeText({ text: hoursWorked.toString() });
  chrome.action.setBadgeBackgroundColor({
    color: remaining > 0 ? '#667eea' : '#10b981',
  });

  // Notify at target - 30 minutes (warning)
  const WARNING_TIME_MS = TARGET_MS - 30 * 60 * 1000;
  if (workingTime >= WARNING_TIME_MS && !data[warnKey]) {
    chrome.notifications.create('warning-30min', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⚠️ 30 Minutes Remaining',
      message: `You have 30 minutes left to complete ${TARGET_HOURS} hours!`,
      priority: 2,
    });

    await chrome.storage.local.set({ [warnKey]: true });
  }

  // Notify at target hours (completion)
  if (workingTime >= TARGET_MS && !data[completeKey]) {
    chrome.notifications.create('complete-target', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: `🎉 ${TARGET_HOURS} Hours Completed!`,
      message: `You've completed your required work hours! Total time: ${formatDuration(workingTime)}`,
      priority: 2,
      requireInteraction: true,
    });

    fetch('https://work-hours-email-backend.onrender.com/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TARGET_COMPLETED',
      }),
    }).catch((err) => console.error('Email error:', err));

    await chrome.storage.local.set({ [completeKey]: true });
    if (!hasPlayedCompletionSound) {
      playCompletionSound();
      hasPlayedCompletionSound = true;
    }

    // Change badge color to green
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open the popup or focus on it
  chrome.action.openPopup();
  chrome.notifications.clear(notificationId);
});

// Clear notification flags when punching in
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.punchInTime && changes.punchInTime.newValue) {
    // New punch in — clear all dynamic notification flags for this target
    const warnKey = `notified_${TARGET_HOURS}_warning`;
    const completeKey = `notified_${TARGET_HOURS}_complete`;
    chrome.storage.local.set({ [warnKey]: false, [completeKey]: false });
    hasPlayedCompletionSound = false;
  }

  if (namespace === 'local' && changes.isActive && !changes.isActive.newValue) {
    // Punched out - clear badge and alarms
    chrome.action.setBadgeText({ text: '' });
    chrome.alarms.clear('checkCompletion');
  }
});

// Initialize on first load
loadTargetHours().then(() => {
  chrome.storage.local.get(['isActive'], (data) => {
    if (data.isActive) {
      chrome.alarms.create('checkCompletion', { periodInMinutes: 1 });
      checkAndNotify();
    }
  });
});
