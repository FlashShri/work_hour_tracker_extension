// Constants
let TARGET_HOURS = 8.5; // Default, will be loaded from storage
let TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
let MONTHLY_SALARY = 0;
let DAILY_SALARY = 0;
let HOURLY_RATE = 0;

// DOM Elements
let punchInBtn, punchOutBtn, toggleBreakBtn, manualEntryBtn;
let statusEl, timerEl, remainingEl;
let punchInTimeEl, punchInValueEl;
let estimatedOutEl, estimatedOutValueEl;
let breakTimeEl, breakDurationEl;
let todayLogEl, historyLogEl;
let targetDisplayEl, dailySalaryDisplayEl, earnedTodayDisplayEl;

// Modal elements
let manualModal, editPunchInModal;
let manualPunchInInput, manualPunchOutInput, manualDateInput;
let editPunchInInput;
let settingsPanel, targetHoursInput, monthlySalaryInput, settingsMessageEl;

// State
let updateInterval;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  punchInBtn = document.getElementById('punchIn');
  punchOutBtn = document.getElementById('punchOut');
  toggleBreakBtn = document.getElementById('toggleBreak');
  manualEntryBtn = document.getElementById('manualEntry');
  statusEl = document.getElementById('status');
  timerEl = document.getElementById('timer');
  remainingEl = document.getElementById('remaining');
  punchInTimeEl = document.getElementById('punchInTime');
  punchInValueEl = document.getElementById('punchInValue');
  estimatedOutEl = document.getElementById('estimatedOut');
  estimatedOutValueEl = document.getElementById('estimatedOutValue');
  breakTimeEl = document.getElementById('breakTime');
  breakDurationEl = document.getElementById('breakDuration');
  todayLogEl = document.getElementById('todayLog');
  historyLogEl = document.getElementById('historyLog');
  targetDisplayEl = document.getElementById('targetDisplay');
  dailySalaryDisplayEl = document.getElementById('dailySalaryDisplay');
  earnedTodayDisplayEl = document.getElementById('earnedTodayDisplay');

  // Modal elements
  manualModal = document.getElementById('manualModal');
  editPunchInModal = document.getElementById('editPunchInModal');
  manualPunchInInput = document.getElementById('manualPunchIn');
  manualPunchOutInput = document.getElementById('manualPunchOut');
  manualDateInput = document.getElementById('manualDate');
  editPunchInInput = document.getElementById('editPunchInInput');
  settingsPanel = document.getElementById('settingsPanel');
  targetHoursInput = document.getElementById('targetHours');
  monthlySalaryInput = document.getElementById('monthlySalary');
  settingsMessageEl = document.getElementById('settingsMessage');

  // Event listeners
  punchInBtn.addEventListener('click', handlePunchIn);
  punchOutBtn.addEventListener('click', handlePunchOut);
  toggleBreakBtn.addEventListener('click', handleToggleBreak);
  manualEntryBtn.addEventListener('click', openManualModal);

  // Manual entry modal
  document
    .getElementById('closeModal')
    .addEventListener('click', closeManualModal);
  document
    .getElementById('cancelModal')
    .addEventListener('click', closeManualModal);
  document
    .getElementById('saveManual')
    .addEventListener('click', saveManualEntry);

  // Edit punch in modal
  punchInValueEl.addEventListener('click', openEditPunchInModal);
  document
    .getElementById('closePunchInModal')
    .addEventListener('click', closeEditPunchInModal);
  document
    .getElementById('cancelPunchInEdit')
    .addEventListener('click', closeEditPunchInModal);
  document
    .getElementById('savePunchInEdit')
    .addEventListener('click', savePunchInEdit);

  // Settings
  document
    .getElementById('toggleSettings')
    .addEventListener('click', toggleSettings);
  document
    .getElementById('saveSettings')
    .addEventListener('click', saveSettings);

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  manualDateInput.value = today;

  // Load and display current state
  loadSettings().then(() => {
    loadState();
  });

  // Start updating every second
  updateInterval = setInterval(updateDisplay, 1000);
}

async function loadState() {
  const data = await chrome.storage.local.get([
    'punchInTime',
    'isActive',
    'breakStartTime',
    'totalBreakTime',
    'history',
    'todayLog',
  ]);

  if (data.isActive && data.punchInTime) {
    // Active session
    punchInBtn.disabled = true;
    punchOutBtn.disabled = false;
    toggleBreakBtn.disabled = false;

    statusEl.textContent = 'Currently Working';
    statusEl.style.color = '#10b981';

    // Show punch in time info
    punchInTimeEl.style.display = 'flex';
    estimatedOutEl.style.display = 'flex';

    const punchInDate = new Date(data.punchInTime);
    punchInValueEl.textContent = formatTime(punchInDate);

    const estimatedOut = new Date(
      data.punchInTime + TARGET_MS + (data.totalBreakTime || 0)
    );
    estimatedOutValueEl.textContent = formatTime(estimatedOut);

    // Check if on break
    if (data.breakStartTime) {
      toggleBreakBtn.textContent = '⏸️ End Break';
      toggleBreakBtn.classList.add('on-break');
      breakTimeEl.style.display = 'block';
      statusEl.textContent = 'On Break';
      statusEl.style.color = '#f59e0b';
    }
  } else {
    // No active session
    punchInBtn.disabled = false;
    punchOutBtn.disabled = true;
    toggleBreakBtn.disabled = true;

    statusEl.textContent = 'Not Punched In';
    statusEl.style.color = '#657786';

    punchInTimeEl.style.display = 'none';
    estimatedOutEl.style.display = 'none';
    breakTimeEl.style.display = 'none';
  }

  // Load history
  displayTodayLog(data.todayLog || []);
  displayHistory(data.history || []);
  updateDisplay();
}

async function updateDisplay() {
  const data = await chrome.storage.local.get([
    'punchInTime',
    'isActive',
    'breakStartTime',
    'totalBreakTime',
  ]);

  if (!data.isActive || !data.punchInTime) {
    timerEl.textContent = '00:00:00';
    remainingEl.textContent = '';
    earnedTodayDisplayEl.textContent = formatAmount(0);
    return;
  }

  const now = Date.now();
  const punchInTime = data.punchInTime;
  const totalBreakTime = data.totalBreakTime || 0;

  // Calculate current break time if on break
  let currentBreakTime = 0;
  if (data.breakStartTime) {
    currentBreakTime = now - data.breakStartTime;
    breakDurationEl.textContent = formatDuration(
      totalBreakTime + currentBreakTime
    );
  }

  // Calculate working time (exclude breaks)
  const totalElapsed = now - punchInTime;
  const workingTime = totalElapsed - totalBreakTime - currentBreakTime;

  // Update timer
  timerEl.textContent = formatDuration(workingTime);
  const earned = (workingTime / (60 * 60 * 1000)) * HOURLY_RATE;
  earnedTodayDisplayEl.textContent = formatAmount(earned);

  // Update remaining time
  const remaining = TARGET_MS - workingTime;
  if (remaining > 0) {
    remainingEl.textContent = `${formatDuration(remaining)} remaining`;
    remainingEl.style.color = '#657786';
  } else {
    const overtime = Math.abs(remaining);
    remainingEl.textContent = `✅ Completed! +${formatDuration(overtime)} overtime`;
    remainingEl.style.color = '#10b981';
  }

  // 🔥 Instant completion check when popup is open
  if (workingTime >= TARGET_MS) {
    chrome.runtime.sendMessage({ action: 'checkCompletionNow' });
  }
  // Update badge
  const hoursWorked = Math.floor(workingTime / (60 * 60 * 1000));
  chrome.action.setBadgeText({ text: hoursWorked.toString() });
  chrome.action.setBadgeBackgroundColor({
    color: remaining > 0 ? '#667eea' : '#10b981',
  });
}

async function handlePunchIn() {
  const now = Date.now();

  await chrome.storage.local.set({
    punchInTime: now,
    isActive: true,
    breakStartTime: null,
    totalBreakTime: 0,
  });

  // Create alarm to check for completion
  chrome.alarms.create('checkCompletion', { periodInMinutes: 1 });

  // Add to today's log
  await addToTodayLog('Punched In', now);

  loadState();
}

async function handlePunchOut() {
  const data = await chrome.storage.local.get([
    'punchInTime',
    'totalBreakTime',
    'breakStartTime',
  ]);
  const now = Date.now();

  // If on break, end it first
  let finalBreakTime = data.totalBreakTime || 0;
  if (data.breakStartTime) {
    finalBreakTime += now - data.breakStartTime;
  }

  const totalElapsed = now - data.punchInTime;
  const workingTime = totalElapsed - finalBreakTime;
  const earnedAmount = (workingTime / (60 * 60 * 1000)) * HOURLY_RATE;

  // Save to history
  await saveToHistory({
    date: new Date().toDateString(),
    punchIn: data.punchInTime,
    punchOut: now,
    workingTime: workingTime,
    breakTime: finalBreakTime,
    completed: workingTime >= TARGET_MS,
    earnings: earnedAmount,
  });

  // Add to today's log
  await addToTodayLog('Punched Out', now, workingTime);

  // Reset state
  await chrome.storage.local.set({
    isActive: false,
    punchInTime: null,
    breakStartTime: null,
    totalBreakTime: 0,
  });

  // Clear alarm and badge
  chrome.alarms.clear('checkCompletion');
  chrome.action.setBadgeText({ text: '' });

  alert(`Punch out complete. You earned ${formatAmount(earnedAmount)} today.`);

  loadState();
}

async function handleToggleBreak() {
  const data = await chrome.storage.local.get([
    'breakStartTime',
    'totalBreakTime',
  ]);
  const now = Date.now();

  if (data.breakStartTime) {
    // End break
    const breakDuration = now - data.breakStartTime;
    const newTotalBreak = (data.totalBreakTime || 0) + breakDuration;

    await chrome.storage.local.set({
      breakStartTime: null,
      totalBreakTime: newTotalBreak,
    });

    await addToTodayLog('Break Ended', now, breakDuration);

    toggleBreakBtn.textContent = '☕ Start Break';
    toggleBreakBtn.classList.remove('on-break');
    statusEl.textContent = 'Currently Working';
    statusEl.style.color = '#10b981';
    breakTimeEl.style.display = 'none';
  } else {
    // Start break
    await chrome.storage.local.set({
      breakStartTime: now,
    });

    await addToTodayLog('Break Started', now);

    toggleBreakBtn.textContent = '⏸️ End Break';
    toggleBreakBtn.classList.add('on-break');
    statusEl.textContent = 'On Break';
    statusEl.style.color = '#f59e0b';
    breakTimeEl.style.display = 'block';
  }

  loadState();
}

async function addToTodayLog(action, time, duration) {
  const data = await chrome.storage.local.get(['todayLog']);
  const todayLog = data.todayLog || [];

  const entry = {
    action: action,
    time: time,
    duration: duration,
  };

  todayLog.push(entry);
  await chrome.storage.local.set({ todayLog: todayLog });

  displayTodayLog(todayLog);
}

function displayTodayLog(logs) {
  if (!logs || logs.length === 0) {
    todayLogEl.textContent = 'No entries yet';
    return;
  }

  todayLogEl.innerHTML = '';
  logs
    .slice(-5)
    .reverse()
    .forEach((entry) => {
      const div = document.createElement('div');
      div.className = 'log-entry';

      const timeStr = formatTime(new Date(entry.time));
      let content = `<span class="log-entry-time">${entry.action}</span> at ${timeStr}`;

      if (entry.duration) {
        content += `<span class="log-entry-duration">(${formatDuration(entry.duration)})</span>`;
      }

      div.innerHTML = content;
      todayLogEl.appendChild(div);
    });
}

async function saveToHistory(session) {
  const data = await chrome.storage.local.get(['history']);
  const history = data.history || [];

  history.unshift(session);

  // Keep only last 7 days
  const recentHistory = history.slice(0, 7);

  await chrome.storage.local.set({ history: recentHistory });
  displayHistory(recentHistory);
}

function displayHistory(history) {
  if (!history || history.length === 0) {
    historyLogEl.textContent = 'No history yet';
    return;
  }

  historyLogEl.innerHTML = '';
  history.forEach((session) => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    if (session.completed) {
      div.classList.add('completed');
    }

    const date = new Date(session.punchIn).toLocaleDateString();
    const inTime = formatTime(new Date(session.punchIn));
    const outTime = formatTime(new Date(session.punchOut));
    const duration = formatDuration(session.workingTime);
    const status = session.completed ? '✅' : '⚠️';
    const earningText =
      typeof session.earnings === 'number'
        ? ` | Earned: ${formatAmount(session.earnings)}`
        : '';

    div.innerHTML = `
      <div><strong>${date}</strong> ${status}</div>
      <div style="font-size: 11px; margin-top: 3px;">
        ${inTime} → ${outTime} (${duration})${earningText}
      </div>
    `;

    historyLogEl.appendChild(div);
  });
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${pad(minutes)} ${ampm}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function recalculateSalaryRates() {
  DAILY_SALARY = MONTHLY_SALARY / 30;
  HOURLY_RATE = TARGET_HOURS > 0 ? DAILY_SALARY / TARGET_HOURS : 0;
  dailySalaryDisplayEl.textContent = formatAmount(DAILY_SALARY);
}

// Load settings from storage
async function loadSettings() {
  const data = await chrome.storage.local.get(['targetHours', 'monthlySalary']);
  if (data.targetHours) {
    TARGET_HOURS = data.targetHours;
  } else {
    TARGET_HOURS = 8.5; // Default
  }
  MONTHLY_SALARY =
    typeof data.monthlySalary === 'number' ? data.monthlySalary : 0;
  TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
  targetHoursInput.value = TARGET_HOURS;
  monthlySalaryInput.value = MONTHLY_SALARY;
  targetDisplayEl.textContent = `${TARGET_HOURS} hours`;
  recalculateSalaryRates();
}

// Settings functions
function toggleSettings() {
  if (settingsPanel.style.display === 'none') {
    settingsPanel.style.display = 'block';
  } else {
    settingsPanel.style.display = 'none';
  }
}

async function saveSettings() {
  const newTargetHours = parseFloat(targetHoursInput.value);
  const newMonthlySalary = parseFloat(monthlySalaryInput.value);

  if (isNaN(newTargetHours) || newTargetHours < 1 || newTargetHours > 24) {
    showSettingsMessage(
      'Please enter a valid number between 1 and 24',
      'error'
    );
    return;
  }
  if (isNaN(newMonthlySalary) || newMonthlySalary < 0) {
    showSettingsMessage(
      'Please enter a valid monthly salary (0 or greater)',
      'error'
    );
    return;
  }

  TARGET_HOURS = newTargetHours;
  MONTHLY_SALARY = newMonthlySalary;
  TARGET_MS = TARGET_HOURS * 60 * 60 * 1000;
  recalculateSalaryRates();

  await chrome.storage.local.set({
    targetHours: TARGET_HOURS,
    monthlySalary: MONTHLY_SALARY,
  });
  targetDisplayEl.textContent = `${TARGET_HOURS} hours`;

  // Notify background script of the change
  chrome.runtime.sendMessage({
    action: 'updateTargetHours',
    targetHours: TARGET_HOURS,
  });

  showSettingsMessage('Settings saved successfully!', 'success');

  // Update display with new target
  updateDisplay();
}

function showSettingsMessage(message, type) {
  settingsMessageEl.textContent = message;
  settingsMessageEl.className = `settings-message ${type}`;
  settingsMessageEl.style.display = 'block';

  setTimeout(() => {
    settingsMessageEl.style.display = 'none';
  }, 3000);
}

// Manual Entry Modal functions
function openManualModal() {
  manualModal.style.display = 'flex';

  // Pre-fill with current time if not punched in
  const now = new Date();
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  if (!manualPunchInInput.value) {
    manualPunchInInput.value = timeString;
  }
}

function closeManualModal() {
  manualModal.style.display = 'none';
  manualPunchInInput.value = '';
  manualPunchOutInput.value = '';
}

async function saveManualEntry() {
  const punchInTime = manualPunchInInput.value;
  const punchOutTime = manualPunchOutInput.value;
  const dateStr = manualDateInput.value;

  if (!punchInTime) {
    alert('Please enter a punch in time');
    return;
  }

  // Parse the date and time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [inHour, inMinute] = punchInTime.split(':').map(Number);

  const punchInDate = new Date(year, month - 1, day, inHour, inMinute);
  const punchInMs = punchInDate.getTime();

  // Check if this is for today
  const today = new Date().toDateString();
  const entryDate = punchInDate.toDateString();
  const isToday = today === entryDate;

  if (punchOutTime) {
    // Complete entry with both punch in and out
    const [outHour, outMinute] = punchOutTime.split(':').map(Number);
    const punchOutDate = new Date(year, month - 1, day, outHour, outMinute);
    const punchOutMs = punchOutDate.getTime();

    if (punchOutMs <= punchInMs) {
      alert('Punch out time must be after punch in time');
      return;
    }

    const workingTime = punchOutMs - punchInMs;
    const earnedAmount = (workingTime / (60 * 60 * 1000)) * HOURLY_RATE;

    // Save to history
    await saveToHistory({
      date: entryDate,
      punchIn: punchInMs,
      punchOut: punchOutMs,
      workingTime: workingTime,
      breakTime: 0,
      completed: workingTime >= TARGET_MS,
      earnings: earnedAmount,
      manual: true,
    });

    if (isToday) {
      await addToTodayLog('Manual Entry', punchInMs, workingTime);
    }

    alert(
      `Manual entry saved. Estimated earning: ${formatAmount(earnedAmount)}`
    );
  } else {
    // Only punch in - start active session
    if (isToday) {
      await chrome.storage.local.set({
        punchInTime: punchInMs,
        isActive: true,
        breakStartTime: null,
        totalBreakTime: 0,
      });

      chrome.alarms.create('checkCompletion', { periodInMinutes: 1 });
      await addToTodayLog('Manual Punch In', punchInMs);

      alert('Started active session with manual punch in time!');
    } else {
      alert(
        'Cannot start active session for past dates. Please add both punch in and out times for historical entries.'
      );
      return;
    }
  }

  closeManualModal();
  loadState();
}

// Edit Punch In Modal functions
function openEditPunchInModal() {
  chrome.storage.local.get(['isActive', 'punchInTime'], (data) => {
    if (!data.isActive || !data.punchInTime) {
      return;
    }

    const punchInDate = new Date(data.punchInTime);
    const timeString = `${pad(punchInDate.getHours())}:${pad(punchInDate.getMinutes())}`;
    editPunchInInput.value = timeString;

    editPunchInModal.style.display = 'flex';
  });
}

function closeEditPunchInModal() {
  editPunchInModal.style.display = 'none';
}

async function savePunchInEdit() {
  const newTime = editPunchInInput.value;

  if (!newTime) {
    alert('Please enter a valid time');
    return;
  }

  const data = await chrome.storage.local.get(['punchInTime']);
  const oldPunchInDate = new Date(data.punchInTime);

  const [hour, minute] = newTime.split(':').map(Number);
  const newPunchInDate = new Date(
    oldPunchInDate.getFullYear(),
    oldPunchInDate.getMonth(),
    oldPunchInDate.getDate(),
    hour,
    minute
  );

  const newPunchInMs = newPunchInDate.getTime();

  // Make sure new time is not in the future
  if (newPunchInMs > Date.now()) {
    alert('Punch in time cannot be in the future');
    return;
  }

  await chrome.storage.local.set({
    punchInTime: newPunchInMs,
  });

  await addToTodayLog('Edited Punch In Time', newPunchInMs);

  closeEditPunchInModal();
  loadState();
}

// Clean up interval when popup closes
window.addEventListener('unload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
