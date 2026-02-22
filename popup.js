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
let breakTimeEl, breakDurationEl, breakCatLabel, breakCategorySelect;
let todayLogEl, historyLogEl;
let targetDisplayEl, dailySalaryDisplayEl, earnedTodayDisplayEl;
let notificationEmailInput;
let weeklyTotalHoursEl, weeklyTotalEarnedEl, exportCsvBtn;
// Modal elements
let manualModal, editPunchInModal;
let manualPunchInInput, manualPunchOutInput, manualDateInput;
let editPunchInInput;
let settingsPanel, targetHoursInput, monthlySalaryInput, settingsMessageEl;

// State
let updateInterval;

// ── Toast Notification System ────────────────────────────────
// showToast(message, type, duration)
// type: 'success' | 'error' | 'info' | 'warning'
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// ── Tab Switching ─────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => (p.style.display = 'none'));
      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).style.display = 'block';
    });
  });
}

// ── Progress Ring ─────────────────────────────────────────────
const RING_CIRCUMFERENCE = 427.26; // 2π × r68

function updateProgressRing(percent) {
  const fill = document.getElementById('progressRingFill');
  if (!fill) return;
  const clamped = Math.max(0, Math.min(1, percent));
  fill.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - clamped);
  fill.style.stroke = clamped >= 1 ? 'var(--success)' : 'var(--accent)';
}

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
  breakCatLabel = document.getElementById('breakCatLabel');
  breakCategorySelect = document.getElementById('breakCategory');
  todayLogEl = document.getElementById('todayLog');
  historyLogEl = document.getElementById('historyLog');
  targetDisplayEl = document.getElementById('targetDisplay');
  dailySalaryDisplayEl = document.getElementById('dailySalaryDisplay');
  earnedTodayDisplayEl = document.getElementById('earnedTodayDisplay');
  notificationEmailInput = document.getElementById('notificationEmail');
  weeklyTotalHoursEl = document.getElementById('weeklyTotalHours');
  weeklyTotalEarnedEl = document.getElementById('weeklyTotalEarned');
  exportCsvBtn = document.getElementById('exportCsvBtn');

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

  // Keyboard Shortcuts (Ctrl+Shift+P or Cmd+Shift+P)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (!punchInBtn.disabled) {
        handlePunchIn();
      } else if (!punchOutBtn.disabled) {
        handlePunchOut();
      }
    }
  });

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

  // Settings (in tab — just wire up save button)
  document
    .getElementById('saveSettings')
    .addEventListener('click', saveSettings);

  // Init tabs
  initTabs();

  // Punch Out Confirmation Modal
  document
    .getElementById('confirmPunchOutYes')
    .addEventListener('click', () => {
      document.getElementById('punchOutConfirmModal').style.display = 'none';
      performPunchOut();
    });
  document
    .getElementById('confirmPunchOutNo')
    .addEventListener('click', () => {
      document.getElementById('punchOutConfirmModal').style.display = 'none';
    });

  // Export CSV
  exportCsvBtn.addEventListener('click', exportHistoryToCsv);

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
      breakCatLabel.textContent = `On Break (${data.currentBreakCategory || 'General'})`;
      breakTimeEl.style.display = 'block';
      statusEl.textContent = 'On Break';
      statusEl.style.color = 'var(--warning)';
    }
  } else {
    // No active session
    punchInBtn.disabled = false;
    punchOutBtn.disabled = true;
    toggleBreakBtn.disabled = true;

    statusEl.textContent = 'Not Punched In';
    statusEl.style.color = 'var(--text-3)';

    punchInTimeEl.style.display = 'none';
    estimatedOutEl.style.display = 'none';
    breakTimeEl.style.display = 'none';
    updateProgressRing(0);
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
    updateProgressRing(0);
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
  const earned = calculateEarnedAmount(workingTime);
  earnedTodayDisplayEl.textContent = formatAmount(earned);

  // Update remaining time + ring
  const remaining = TARGET_MS - workingTime;
  updateProgressRing(workingTime / TARGET_MS);
  if (remaining > 0) {
    remainingEl.textContent = `${formatDuration(remaining)} left`;
    remainingEl.style.color = 'var(--text-3)';
  } else {
    const overtime = Math.abs(remaining);
    remainingEl.textContent = `+${formatDuration(overtime)} overtime`;
    remainingEl.style.color = 'var(--success)';
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
  showToast('Punched in! Timer started.', 'success');

  const settings = await chrome.storage.local.get(['notificationEmail']);

  fetch('https://work-hours-email-backend.onrender.com/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'PUNCH_IN',
      email: settings.notificationEmail,
      punchInTime: new Date(now).toLocaleTimeString(),
    }),
  }).catch((err) => console.error('Email error:', err));

  loadState();
}

// Show confirm modal before punching out
function handlePunchOut() {
  const modal = document.getElementById('punchOutConfirmModal');
  const msg = document.getElementById('punchOutConfirmMsg');
  msg.textContent = 'Are you sure you want to punch out?';
  modal.style.display = 'flex';
}

async function performPunchOut() {
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
  const earnedAmount = calculateEarnedAmount(workingTime);

  const settings = await chrome.storage.local.get(['notificationEmail']);

  fetch('https://work-hours-email-backend.onrender.com/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'PUNCH_OUT',
      email: settings.notificationEmail,
      punchInTime: formatTime(new Date(data.punchInTime)),
      punchOutTime: formatTime(new Date(now)),
      workingHours: formatDuration(workingTime),
      breakTime: formatDuration(finalBreakTime),
      earnings: earnedAmount.toFixed(2),
    }),
  }).catch((err) => console.error('Email error:', err));

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

  showToast(
    `Punched out! You worked ${formatDuration(workingTime)} and earned ${formatAmount(earnedAmount)} today.`,
    'success',
    5000
  );

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
    statusEl.style.color = 'var(--success)';
    breakTimeEl.style.display = 'none';
  } else {
    // Start break
    const category = breakCategorySelect.value;
    await chrome.storage.local.set({
      breakStartTime: now,
      currentBreakCategory: category
    });

    await addToTodayLog(`Break Started (${category})`, now);

    toggleBreakBtn.textContent = '⏸️ End Break';
    toggleBreakBtn.classList.add('on-break');
    breakCatLabel.textContent = `On Break (${category})`;
    statusEl.textContent = 'On Break';
    statusEl.style.color = 'var(--warning)';
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
  let history = data.history || [];

  history.unshift(session);

  // Keep entries from the last 7 days (limit to 50 to bound storage)
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoMs = sevenDaysAgo.getTime();

  history = history.filter((s) => s.punchIn >= sevenDaysAgoMs).slice(0, 50);

  await chrome.storage.local.set({ history: history });
  displayHistory(history);
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

  updateWeeklySummary(history);
}

function updateWeeklySummary(history) {
  if (!weeklyTotalHoursEl || !weeklyTotalEarnedEl) return;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoMs = sevenDaysAgo.getTime();

  let totalMs = 0;
  let totalEarned = 0;

  history.forEach(session => {
    if (session.punchIn >= sevenDaysAgoMs) {
      totalMs += session.workingTime || 0;
      totalEarned += session.earnings || 0;
    }
  });

  weeklyTotalHoursEl.textContent = formatDurationShort(totalMs);
  weeklyTotalEarnedEl.textContent = `Earned: ${formatAmount(totalEarned)}`;
}

function formatDurationShort(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

async function exportHistoryToCsv() {
  const data = await chrome.storage.local.get(['history']);
  const history = data.history || [];

  if (history.length === 0) {
    showToast('No history to export', 'warning');
    return;
  }

  // Create CSV content
  const headers = ['Date', 'Punch In', 'Punch Out', 'Working Time', 'Break Time', 'Completed Target', 'Earnings (Manual)', 'Manual Entry'];
  const rows = history.map(session => [
    new Date(session.punchIn).toLocaleDateString(),
    formatTime(new Date(session.punchIn)),
    session.punchOut ? formatTime(new Date(session.punchOut)) : 'N/A',
    formatDuration(session.workingTime || 0),
    formatDuration(session.breakTime || 0),
    session.completed ? 'Yes' : 'No',
    session.earnings ? session.earnings.toFixed(2) : '0.00',
    session.manual ? 'Yes' : 'No'
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `work-hours-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('CSV Exported Successfully!', 'success');
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

function calculateEarnedAmount(workingTimeMs) {
  // Earnings stop increasing once target time is completed.
  const cappedWorkingTimeMs = Math.max(0, Math.min(workingTimeMs, TARGET_MS));
  return (cappedWorkingTimeMs / (60 * 60 * 1000)) * HOURLY_RATE;
}

function recalculateSalaryRates() {
  DAILY_SALARY = MONTHLY_SALARY / 30;
  HOURLY_RATE = TARGET_HOURS > 0 ? DAILY_SALARY / TARGET_HOURS : 0;
  dailySalaryDisplayEl.textContent = formatAmount(DAILY_SALARY);
}

// Load settings from storage
async function loadSettings() {
  const data = await chrome.storage.local.get([
    'targetHours',
    'monthlySalary',
    'notificationEmail',
  ]);
  notificationEmailInput.value = data.notificationEmail || '';
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
  targetDisplayEl.textContent = `${TARGET_HOURS}h`;
  recalculateSalaryRates();
}

// Settings functions

async function saveSettings() {
  const newTargetHours = parseFloat(targetHoursInput.value);
  const newMonthlySalary = parseFloat(monthlySalaryInput.value);
  const newNotificationEmail = notificationEmailInput.value.trim();

  // Email is optional — only validate format if provided
  if (newNotificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newNotificationEmail)) {
    showSettingsMessage('Please enter a valid email address (or leave blank)', 'error');
    return;
  }
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
    notificationEmail: newNotificationEmail,
  });

  targetDisplayEl.textContent = `${TARGET_HOURS}h`;

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
    showToast('Please enter a punch in time', 'error');
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
      showToast('Punch out time must be after punch in time', 'error');
      return;
    }

    const workingTime = punchOutMs - punchInMs;
    const earnedAmount = calculateEarnedAmount(workingTime);

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

    showToast(`Manual entry saved. Earned: ${formatAmount(earnedAmount)}`, 'success', 4500);
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

      showToast('Active session started with manual punch-in time!', 'success');
    } else {
      showToast(
        'For past dates, please provide both punch-in and punch-out times.',
        'warning',
        4500
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
    showToast('Please enter a valid time', 'error');
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
    showToast('Punch-in time cannot be in the future', 'error');
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
