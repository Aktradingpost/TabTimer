// options.js - TabTimer Premium v2.3.0

let locks = [];
let categories = [];
let folders = [];
let selectedIds = new Set();
let lastSelectedIndex = -1; // For shift+click range selection
let currentSettings = {};
let currentView = 'schedules';
let currentFilter = null;
let currentFolder = null;
let customCategoryFilter = null;
let licenseStatus = { valid: false, trial: false, expired: false };
let currentFilteredLocks = []; // Keep track of currently displayed locks for selection

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format a Date object for datetime-local input (local timezone)
function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getRepeatDescription(lock) {
  const repeatType = lock.repeatType || 'daily';
  const currentTime = new Date(lock.unlockTime);
  const nextTime = new Date(currentTime);
  
  // Calculate next occurrence
  switch (repeatType) {
    case 'daily':
      nextTime.setDate(nextTime.getDate() + 1);
      return `Next: ${formatNextDate(nextTime)} (Daily)`;
    case 'weekdays':
      do {
        nextTime.setDate(nextTime.getDate() + 1);
      } while (nextTime.getDay() === 0 || nextTime.getDay() === 6);
      return `Next: ${formatNextDate(nextTime)} (Weekdays)`;
    case 'weekends':
      do {
        nextTime.setDate(nextTime.getDate() + 1);
      } while (nextTime.getDay() !== 0 && nextTime.getDay() !== 6);
      return `Next: ${formatNextDate(nextTime)} (Weekends)`;
    case 'weekly':
      nextTime.setDate(nextTime.getDate() + 7);
      return `Next: ${formatNextDate(nextTime)} (Weekly)`;
    case 'biweekly':
      nextTime.setDate(nextTime.getDate() + 14);
      return `Next: ${formatNextDate(nextTime)} (Every 2 Weeks)`;
    case 'every3weeks':
      nextTime.setDate(nextTime.getDate() + 21);
      return `Next: ${formatNextDate(nextTime)} (Every 3 Weeks)`;
    case 'monthly':
      nextTime.setMonth(nextTime.getMonth() + 1);
      return `Next: ${formatNextDate(nextTime)} (Monthly)`;
    case 'bimonthly':
      nextTime.setMonth(nextTime.getMonth() + 2);
      return `Next: ${formatNextDate(nextTime)} (Every 2 Months)`;
    case 'quarterly':
      nextTime.setMonth(nextTime.getMonth() + 3);
      return `Next: ${formatNextDate(nextTime)} (Quarterly)`;
    case 'every6months':
      nextTime.setMonth(nextTime.getMonth() + 6);
      return `Next: ${formatNextDate(nextTime)} (Every 6 Months)`;
    case 'yearly':
      nextTime.setFullYear(nextTime.getFullYear() + 1);
      return `Next: ${formatNextDate(nextTime)} (Yearly)`;
    case 'leapyear':
      nextTime.setFullYear(nextTime.getFullYear() + 4);
      return `Next: ${formatNextDate(nextTime)} (Every 4 Years)`;
    case 'hourly':
      const hours = lock.hourlyInterval || 6;
      nextTime.setHours(nextTime.getHours() + hours);
      return `Next: ${formatNextDateTime(nextTime)} (Every ${hours}h)`;
    case 'minutes':
      const mins = lock.minuteInterval || 10;
      nextTime.setMinutes(nextTime.getMinutes() + mins);
      return `Next: ${formatNextDateTime(nextTime)} (Every ${mins}m)`;
    case 'custom-days':
      const days = lock.customDays || 3;
      nextTime.setDate(nextTime.getDate() + days);
      return `Next: ${formatNextDate(nextTime)} (Every ${days} days)`;
    default:
      nextTime.setDate(nextTime.getDate() + 1);
      return `Next: ${formatNextDate(nextTime)}`;
  }
}

function formatNextDate(date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatNextDateTime(date) {
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check license
  await checkLicense();
  
  // Load all data
  await loadAllData();
  
  // Setup event listeners
  setupEventListeners();
  setupKeyboardShortcuts();

  // ── How TabTimer Works notice ──────────────────────────
  // Runs once right after DOM is ready so buttons always work
  (function setupHowItWorksNotice() {
    const noticeEl = document.getElementById('tabtimer-how-it-works');
    const closeBtn = document.getElementById('tabtimer-notice-close-btn');
    const popup    = document.getElementById('tabtimer-notice-popup');
    const hideNowBtn   = document.getElementById('tabtimer-hide-now');
    const dontShowBtn  = document.getElementById('tabtimer-dont-show');

    if (!noticeEl || !closeBtn) return;

    // Check storage — hide permanently if user chose "Don't show again"
    chrome.storage.local.get(['hideHowItWorksNotice'], (data) => {
      if (data.hideHowItWorksNotice === true) {
        noticeEl.style.display = 'none';
      }
      const showCb = document.getElementById('settingShowHowItWorks');
      if (showCb) showCb.checked = !data.hideHowItWorksNotice;
    });

    // X button — toggle the mini-popup
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!popup) return;
      const isVisible = popup.style.display === 'block';
      popup.style.display = isVisible ? 'none' : 'block';
    });

    // "Hide for now" — hides until next page load, does NOT save to storage
    if (hideNowBtn) {
      hideNowBtn.addEventListener('click', () => {
        noticeEl.style.display = 'none';
        if (popup) popup.style.display = 'none';
      });
    }

    // "Don't show again" — saves permanently to storage
    if (dontShowBtn) {
      dontShowBtn.addEventListener('click', () => {
        chrome.storage.local.set({ hideHowItWorksNotice: true });
        noticeEl.style.display = 'none';
        if (popup) popup.style.display = 'none';
        const showCb = document.getElementById('settingShowHowItWorks');
        if (showCb) showCb.checked = false;
        showToast('Notice hidden. Re-enable it anytime in Settings.');
      });
    }

    // Click anywhere else closes the mini-popup
    document.addEventListener('click', (e) => {
      if (!popup) return;
      if (!popup.contains(e.target) && e.target !== closeBtn) {
        popup.style.display = 'none';
      }
    });
  })();
  // ────────────────────────────────────────────────────────
  
  // Apply theme
  if (currentSettings.theme === 'dark') {
    document.body.classList.add('dark');
  }
  
  // Set default datetime
  setDefaultDatetime();
  
  // Populate category dropdowns
  populateCategoryDropdowns();
  
  // Update license status display
  showLicenseStatus();
  
  // Render initial view
  renderSchedules();
  renderCategories();
  updateStats();

  // Check if we were opened as a fallback from a page where content script was blocked
  chrome.storage.local.get(['prefillUrl', 'prefillTitle'], (data) => {
    if (data.prefillUrl) {
      // Clear it immediately so it does not persist
      chrome.storage.local.remove(['prefillUrl', 'prefillTitle']);
      // Switch to Add New view using the proper function
      switchView('add');
      // Update sidebar active state
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      const addNavItem = document.querySelector('.sidebar-item[data-view="add"]');
      if (addNavItem) addNavItem.classList.add('active');
      // Pre-fill the URL and name
      const urlInput = document.getElementById('newUrl');
      const nameInput = document.getElementById('newName');
      if (urlInput) urlInput.value = data.prefillUrl;
      if (nameInput && data.prefillTitle) nameInput.value = data.prefillTitle;
      // Focus the datetime field so user can set the time
      setTimeout(() => {
        const dt = document.getElementById('newDatetime');
        if (dt) dt.focus();
      }, 300);
    }
  });
});

// ============================================
// LICENSE SYSTEM - Free / Trial / Premium
// ============================================

// License states:
// - free: No trial started, only free features
// - trial: Trial active, all premium features
// - trialExpired: Trial ended, back to free features
// - premium: Licensed, all premium features forever

async function checkLicense() {
  const result = await chrome.storage.local.get(['license']);
  const license = result.license || {};
  
  // Check if premium license is activated
  if (license.key && license.validated) {
    licenseStatus = { status: 'premium', valid: true, trial: false, expired: false };
    return;
  }
  
  // Check if trial has been started
  if (license.trialStarted) {
    const trialEnd = license.trialStarted + (license.trialDays || 7) * 24 * 60 * 60 * 1000;
    if (Date.now() < trialEnd) {
      // Trial still active
      const daysLeft = Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000));
      licenseStatus = { status: 'trial', valid: true, trial: true, expired: false, daysLeft };
      return;
    } else {
      // Trial expired - back to free
      licenseStatus = { status: 'trialExpired', valid: false, trial: false, expired: true };
      return;
    }
  }
  
  // No trial started yet - free user
  licenseStatus = { status: 'free', valid: false, trial: false, expired: false };
}

async function startTrial() {
  // First check if trial was already used
  const result = await chrome.storage.local.get(['license']);
  const existingLicense = result.license || {};
  
  // If trial was already started (even if expired), don't allow another trial
  if (existingLicense.trialStarted) {
    const trialEnd = existingLicense.trialStarted + (existingLicense.trialDays || 7) * 24 * 60 * 60 * 1000;
    if (Date.now() >= trialEnd) {
      // Trial was already used and expired
      showToast('⚠️ You have already used your free trial. Please upgrade to Premium for $10!');
      licenseStatus = { status: 'trialExpired', valid: false, trial: false, expired: true };
      showLicenseStatus();
      updateLicenseModal();
      return;
    } else {
      // Trial is still active
      const daysLeft = Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000));
      showToast(`⏳ Your trial is already active! ${daysLeft} days remaining.`);
      licenseStatus = { status: 'trial', valid: true, trial: true, expired: false, daysLeft };
      showLicenseStatus();
      updateLicenseModal();
      return;
    }
  }
  
  // Start new trial
  const license = {
    trialStarted: Date.now(),
    trialDays: 7
  };
  await chrome.storage.local.set({ license });
  licenseStatus = { status: 'trial', valid: true, trial: true, expired: false, daysLeft: 7 };
  showLicenseStatus();
  showToast('🎉 7-day Premium trial started! Enjoy all features.');
  applyPremiumState();
}

async function validateLicenseKey(key) {
  const keyPattern = /^TT[A-Z0-9]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(key.toUpperCase())) {
    return { valid: false, error: 'Invalid license key format' };
  }
  
  const k = key.toUpperCase();
  const p = k.replace(/-/g, '');
  
  // Multi-layer validation - much harder to reverse engineer
  const s1 = p.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  const s2 = p.split('').filter((_, i) => i % 2 === 0).reduce((a, c) => a + c.charCodeAt(0), 0);
  const s3 = p.split('').filter((_, i) => i % 2 === 1).reduce((a, c) => a + c.charCodeAt(0), 0);
  const s4 = p.substring(2, 6).split('').reduce((a, c) => a * c.charCodeAt(0), 1) % 9973;
  const s5 = p.substring(10, 14).split('').reduce((a, c) => a + (c.charCodeAt(0) ^ 42), 0);
  
  const v1 = (s1 * 7) % 97;
  const v2 = (s2 + s3) % 53;
  const v3 = (s4 ^ s5) % 31;
  const magic = (v1 + v2 + v3) % 17;
  
  // Valid if magic number equals specific values based on key characteristics
  const keySum = s1 % 100;
  const validMagic = [3, 7, 11, 14].includes(magic) && (keySum % 4 === (magic % 4));
  
  if (validMagic) {
    const result = await chrome.storage.local.get(['license']);
    const license = result.license || {};
    license.key = k;
    license.validated = true;
    license.activatedAt = Date.now();
    await chrome.storage.local.set({ license });
    licenseStatus = { status: 'premium', valid: true, trial: false, expired: false };
    return { valid: true };
  }
  
  return { valid: false, error: 'Invalid license key' };
}

function isPremiumFeature() {
  // Returns true if user has access to premium features (trial or licensed)
  return licenseStatus.status === 'premium' || licenseStatus.status === 'trial';
}

function applyPremiumState() {
  // Show/hide premium features based on license status
  const hasPremium = isPremiumFeature();
  
  // Toggle premium feature visibility
  document.querySelectorAll('.premium-feature').forEach(el => {
    el.style.display = hasPremium ? '' : 'none';
  });
  
  document.querySelectorAll('.premium-locked').forEach(el => {
    el.style.display = hasPremium ? 'none' : '';
  });
  
  // Update header premium badge
  const headerBadge = document.getElementById('headerPremiumBadge');
  if (headerBadge) {
    if (licenseStatus.status === 'premium') {
      headerBadge.style.display = '';
      headerBadge.textContent = 'PREMIUM';
      headerBadge.style.background = '#22c55e';
    } else if (licenseStatus.status === 'trial') {
      headerBadge.style.display = '';
      headerBadge.textContent = 'TRIAL';
      headerBadge.style.background = '#f59e0b';
    } else {
      headerBadge.style.display = 'none';
    }
  }
}

function showPremiumPrompt() {
  // Show the license modal with upgrade options
  updateLicenseModal();
  document.getElementById('licenseModal').classList.add('visible');
  
  // Show a toast as well
  if (licenseStatus.status === 'free') {
    showToast('✨ This is a Premium feature! Try it free for 7 days.');
  } else if (licenseStatus.status === 'trialExpired') {
    showToast('🔓 Your trial has expired. Upgrade to unlock this feature!');
  }
}

function showLicenseStatus() {
  const btn = document.getElementById('licenseBtn');
  
  switch(licenseStatus.status) {
    case 'premium':
      btn.innerHTML = '⭐ Premium';
      btn.style.background = '#22c55e';
      btn.title = 'Premium license activated';
      break;
    case 'trial':
      btn.innerHTML = `⏳ Trial: ${licenseStatus.daysLeft}d`;
      btn.style.background = '#f59e0b';
      btn.title = `${licenseStatus.daysLeft} days left in trial`;
      break;
    case 'trialExpired':
      btn.innerHTML = '🔓 Upgrade';
      btn.style.background = '#ef4444';
      btn.title = 'Trial expired - Click to upgrade';
      break;
    case 'free':
    default:
      btn.innerHTML = '✨ Try Premium';
      btn.style.background = '#8b5cf6';
      btn.title = 'Try Premium free for 7 days';
      break;
  }
  
  // Apply premium feature visibility
  applyPremiumState();

  // If trial just expired, check if user has schedules with premium repeat types and prompt to fix
  if (licenseStatus.status === 'trialExpired') {
    checkAndPromptDowngradeRepeatTypes();
  }
}

const PREMIUM_REPEAT_TYPES = ['weekdays','weekends','biweekly','every3weeks','bimonthly','quarterly','every6months','leapyear','minutes','hourly','custom-days','specific-dates'];
const FREE_REPEAT_LABEL = {
  weekdays: 'Daily (was Weekdays)',
  weekends: 'Weekly (was Weekends)',
  biweekly: 'Weekly (was Every 2 Weeks)',
  every3weeks: 'Weekly (was Every 3 Weeks)',
  bimonthly: 'Monthly (was Every 2 Months)',
  quarterly: 'Monthly (was Quarterly)',
  every6months: 'Monthly (was Every 6 Months)',
  leapyear: 'Yearly (was Leap Year)',
  minutes: 'Daily (was Every X Minutes)',
  hourly: 'Daily (was Every X Hours)',
  'custom-days': 'Daily (was Custom Days)',
  'specific-dates': 'none (was Specific Dates)'
};
const FREE_REPEAT_DOWNGRADE = {
  weekdays: 'daily', weekends: 'weekly', biweekly: 'weekly',
  every3weeks: 'weekly', bimonthly: 'monthly', quarterly: 'monthly',
  every6months: 'monthly', leapyear: 'yearly', minutes: 'daily',
  hourly: 'daily', 'custom-days': 'daily', 'specific-dates': 'none'
};

async function checkAndPromptDowngradeRepeatTypes() {
  const affectedLocks = locks.filter(l => PREMIUM_REPEAT_TYPES.includes(l.repeatType));
  if (affectedLocks.length === 0) return;

  // Show a banner at the top of the schedules list
  const existing = document.getElementById('tabtimer-downgrade-banner');
  if (existing) return; // already shown

  const banner = document.createElement('div');
  banner.id = 'tabtimer-downgrade-banner';
  banner.style.cssText = 'background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:14px 16px;margin-bottom:16px;';
  banner.innerHTML = `
    <strong>⚠️ Your trial has expired.</strong>
    You have <strong>${affectedLocks.length}</strong> schedule(s) using Premium repeat types that are no longer active.<br>
    <small style="color:#92400e;">Affected: ${affectedLocks.map(l => `"${l.name || l.url}" (${l.repeatType})`).join(', ')}</small><br><br>
    <button id="tabtimer-do-downgrade" style="background:#f59e0b;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;margin-right:8px;">
      🔄 Convert to Nearest Free Option
    </button>
    <button id="tabtimer-dismiss-downgrade" style="background:#e5e7eb;color:#374151;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">
      Dismiss
    </button>
    <div style="font-size:11px;color:#78350f;margin-top:8px;">
      Each schedule will be updated to the closest free repeat type. You can edit individually if needed.
    </div>
  `;

  const scheduleList = document.getElementById('scheduleList') || document.querySelector('.schedule-list');
  if (scheduleList && scheduleList.parentNode) {
    scheduleList.parentNode.insertBefore(banner, scheduleList);
  }

  document.getElementById('tabtimer-do-downgrade').addEventListener('click', async () => {
    let updatedLocks = [...locks];
    affectedLocks.forEach(affected => {
      const idx = updatedLocks.findIndex(l => l.id === affected.id);
      if (idx !== -1) {
        const newRepeat = FREE_REPEAT_DOWNGRADE[affected.repeatType] || 'daily';
        updatedLocks[idx] = {
          ...updatedLocks[idx],
          repeatType: newRepeat,
          recurring: newRepeat !== 'none'
        };
      }
    });
    await chrome.runtime.sendMessage({ action: 'saveLocks', locks: updatedLocks });
    await refreshData();
    banner.remove();
    showToast(`✅ Updated ${affectedLocks.length} schedule(s) to free repeat types.`);
  });

  document.getElementById('tabtimer-dismiss-downgrade').addEventListener('click', () => {
    banner.remove();
  });
}

// ============================================
// DATA LOADING
// ============================================

const DEFAULT_CATEGORIES = [
  { id: 'daily', name: 'Daily', emoji: '📅', color: '#3b82f6' },
  { id: 'weekly', name: 'Weekly', emoji: '📆', color: '#8b5cf6' },
  { id: 'monthly', name: 'Monthly', emoji: '🗓️', color: '#06b6d4' },
  { id: 'once', name: 'Once', emoji: '🎯', color: '#f97316' },
  { id: 'other', name: 'Other', emoji: '📌', color: '#94a3b8' }
];

const DEFAULT_FOLDERS = [
  { id: 'default', name: 'All Schedules', icon: '📁', color: '#64748b' }
];

async function loadAllData() {
  try {
    locks = await chrome.runtime.sendMessage({ action: 'getLocks' }) || [];
    const catResult = await chrome.runtime.sendMessage({ action: 'getCategories' });
    categories = Array.isArray(catResult) ? catResult : [];
    const folderResult = await chrome.runtime.sendMessage({ action: 'getFolders' });
    folders = Array.isArray(folderResult) ? folderResult : [];
    currentSettings = await chrome.runtime.sendMessage({ action: 'getSettings' }) || {};
    
    // Load pause state
    const pauseResult = await chrome.storage.local.get(['pauseAll']);
    updatePauseButton(pauseResult.pauseAll || false);
  } catch (e) {
    console.error('Error loading data:', e);
    locks = [];
    categories = [];
    folders = [];
    currentSettings = {};
  }
  
  // Initialize defaults if empty
  if (!categories || categories.length === 0) {
    categories = DEFAULT_CATEGORIES;
    await chrome.runtime.sendMessage({ action: 'updateCategories', categories });
  }
  
  if (!folders || folders.length === 0) {
    folders = DEFAULT_FOLDERS;
    await chrome.runtime.sendMessage({ action: 'updateFolders', folders });
  }
  
  // Load settings into form
  loadSettingsIntoForm();
  
  console.log('Loaded categories:', categories);
  console.log('Loaded folders:', folders);
}

function updatePauseButton(isPaused) {
  const btn = document.getElementById('pauseAllBtn');
  if (isPaused) {
    btn.innerHTML = '⏸️ Paused';
    btn.style.background = '#ef4444';
    btn.title = 'Click to resume all schedules';
  } else {
    btn.innerHTML = '▶️ Active';
    btn.style.background = '#22c55e';
    btn.title = 'Click to pause all schedules';
  }
}

function loadSettingsIntoForm() {
  // Populate settings form with current values
  if (document.getElementById('settingNotifications')) {
    document.getElementById('settingNotifications').checked = currentSettings.notificationsEnabled !== false;
  }
  if (document.getElementById('settingNotifyMinutes')) {
    document.getElementById('settingNotifyMinutes').value = currentSettings.notificationSeconds !== undefined ? currentSettings.notificationSeconds : 10;
  }
  if (document.getElementById('settingAutoDelete')) {
    document.getElementById('settingAutoDelete').checked = currentSettings.autoDeleteExpired !== false;
  }
  if (document.getElementById('settingOpenBackground')) {
    document.getElementById('settingOpenBackground').checked = currentSettings.openInBackground !== false;
  }
  if (document.getElementById('settingGracePeriod')) {
    document.getElementById('settingGracePeriod').value = currentSettings.gracePeriodMinutes || 60;
  }
  // Update the grace period display in the How TabTimer Works notice
  const gracePeriodDisplay = document.getElementById('gracePeriodDisplay');
  if (gracePeriodDisplay) {
    const gp = currentSettings.gracePeriodMinutes || 60;
    gracePeriodDisplay.textContent = gp >= 60 ? (gp / 60) + ' hour' + (gp > 60 ? 's' : '') : gp + ' minutes';
  }


  if (document.getElementById('settingMissedTabStagger')) {
    document.getElementById('settingMissedTabStagger').value = currentSettings.missedTabStaggerSeconds || 15;
  }
  if (document.getElementById('settingDefaultLockMinutes')) {
    const defLock = (currentSettings.defaultLockMinutes !== undefined && currentSettings.defaultLockMinutes !== null) ? currentSettings.defaultLockMinutes : 0;
    document.getElementById('settingDefaultLockMinutes').value = String(defLock);
  }
  if (document.getElementById('settingTimezone')) {
    document.getElementById('settingTimezone').value = currentSettings.timezone || 'America/New_York';
  }
  if (document.getElementById('settingExpirationTime')) {
    document.getElementById('settingExpirationTime').value = currentSettings.expirationTime || '23:59';
  }
}

async function refreshData() {
  await loadAllData();
  renderSchedules();
  updateStats();
  populateCategoryDropdowns();
}

// Auto-refresh when schedules are created/changed from another tab (e.g. right-click scheduling)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.locks) {
    loadAllData().then(() => {
      renderSchedules();
      updateStats();
    });
  }
});

function updateStats() {
  document.getElementById('statTotal').textContent = locks.length;
  document.getElementById('statActive').textContent = locks.filter(l => !l.opened && !l.manuallyUnlocked).length;
  document.getElementById('statRecurring').textContent = locks.filter(l => l.recurring).length;
  document.getElementById('statTotalOpens').textContent = locks.reduce((sum, l) => sum + (l.openCount || 0), 0);
  
  document.getElementById('totalCount').textContent = locks.length;
  document.getElementById('activeCount').textContent = locks.filter(l => !l.opened && !l.manuallyUnlocked).length;
  document.getElementById('notActiveCount').textContent = locks.filter(l => l.opened || l.manuallyUnlocked).length;
  
  // Category-based filters (FREE feature)
  // Default categories: Daily, Weekly, Monthly, Once, Other
  const defaultCategories = ['Daily', 'Weekly', 'Monthly', 'Once', 'Other'];
  
  const dailyCount = locks.filter(l => (l.category || 'Other').toLowerCase() === 'daily').length;
  const weeklyCount = locks.filter(l => (l.category || 'Other').toLowerCase() === 'weekly').length;
  const monthlyCount = locks.filter(l => (l.category || 'Other').toLowerCase() === 'monthly').length;
  const onceCount = locks.filter(l => (l.category || 'Other').toLowerCase() === 'once').length;
  const otherCount = locks.filter(l => (l.category || 'Other').toLowerCase() === 'other').length;
  
  document.getElementById('dailyCount').textContent = dailyCount;
  document.getElementById('weeklyCount').textContent = weeklyCount;
  document.getElementById('monthlyCount').textContent = monthlyCount;
  document.getElementById('onceCount').textContent = onceCount;
  document.getElementById('otherCount').textContent = otherCount;
  
  // Show/hide default category filters based on whether there are schedules in that category
  document.getElementById('filterDaily').style.display = dailyCount > 0 ? '' : 'none';
  document.getElementById('filterWeekly').style.display = weeklyCount > 0 ? '' : 'none';
  document.getElementById('filterMonthly').style.display = monthlyCount > 0 ? '' : 'none';
  document.getElementById('filterOnce').style.display = onceCount > 0 ? '' : 'none';
  document.getElementById('filterOther').style.display = otherCount > 0 ? '' : 'none';
  
  // Custom category filters (PRO feature) - show filters for non-default categories
  const customCategoryContainer = document.getElementById('customCategoryFilters');
  customCategoryContainer.innerHTML = '';
  
  // Get all unique categories that aren't in the default list
  const allCategories = [...new Set(locks.map(l => l.category || 'Other'))];
  const customCategories = allCategories.filter(cat => 
    !defaultCategories.map(d => d.toLowerCase()).includes(cat.toLowerCase())
  );
  
  // Create filters for custom categories
  customCategories.forEach(cat => {
    const count = locks.filter(l => l.category === cat).length;
    if (count > 0) {
      const filterEl = document.createElement('a');
      filterEl.className = 'sidebar-item';
      filterEl.dataset.filter = `cat-custom-${cat.toLowerCase().replace(/\s+/g, '-')}`;
      filterEl.dataset.category = cat;
      filterEl.innerHTML = `📁 ${cat} <span class="count">${count}</span>`;
      filterEl.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        filterEl.classList.add('active');
        currentFilter = `cat-custom`;
        customCategoryFilter = cat;
        renderSchedules();
      });
      customCategoryContainer.appendChild(filterEl);
    }
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  document.getElementById('todayCount').textContent = locks.filter(l => {
    const d = new Date(l.unlockTime);
    return d >= today && d < tomorrow;
  }).length;
}

function setDefaultDatetime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0);
  // Include seconds in the format for step="1" inputs
  const defaultValue = tomorrow.toISOString().slice(0, 19);
  
  ['newDatetime', 'bulkStartTime', 'bmStartTime'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = defaultValue;
  });
}

// ============================================
// RENDERING
// ============================================

function renderSchedules() {
  const container = document.getElementById('scheduleList');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const sortBy = document.getElementById('sortSelect').value;
  
  // Get advanced search filters
  const advFilters = getAdvancedSearchFilters();
  
  let filteredLocks = locks.filter(lock => {
    // Search filter
    if (searchTerm) {
      const matchName = (lock.name || '').toLowerCase().includes(searchTerm);
      const matchUrl = lock.url.toLowerCase().includes(searchTerm);
      
      // Also search in resolved URLs (captured after redirects)
      let matchResolvedUrl = false;
      if (lock.resolvedUrls && Array.isArray(lock.resolvedUrls)) {
        matchResolvedUrl = lock.resolvedUrls.some(url => 
          url.toLowerCase().includes(searchTerm)
        );
      }
      
      if (!matchName && !matchUrl && !matchResolvedUrl) return false;
    }
    
    // Category filter
    if (categoryFilter && lock.category !== categoryFilter) return false;
    
    // Folder filter
    if (currentFolder && currentFolder !== 'default' && lock.folder !== currentFolder) return false;
    
    // Advanced date filters
    if (advFilters.dateFrom || advFilters.dateTo) {
      // Parse dates carefully to avoid timezone issues
      // Input format from date picker is YYYY-MM-DD
      let fromDate = null;
      let toDate = null;
      
      if (advFilters.dateFrom) {
        const [year, month, day] = advFilters.dateFrom.split('-').map(Number);
        fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      }
      
      if (advFilters.dateTo) {
        const [year, month, day] = advFilters.dateTo.split('-').map(Number);
        toDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      }
      
      const dateType = advFilters.dateType || 'scheduled';
      
      // Get the scheduled time
      const scheduledTime = new Date(lock.unlockTime);
      
      // Extract expiration date from name (YYYY-MM-DD format)
      const expirationMatch = lock.name?.match(/(\d{4}-\d{2}-\d{2})/);
      let expirationDate = null;
      if (expirationMatch) {
        const [year, month, day] = expirationMatch[1].split('-').map(Number);
        expirationDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      }
      
      let matchesDateFilter = false;
      
      if (dateType === 'scheduled') {
        // Only check scheduled time
        const afterFrom = !fromDate || scheduledTime >= fromDate;
        const beforeTo = !toDate || scheduledTime <= toDate;
        matchesDateFilter = afterFrom && beforeTo;
      } else if (dateType === 'expiration') {
        // Only check expiration date in name
        if (!expirationDate) {
          matchesDateFilter = false; // No expiration date in name
        } else {
          const afterFrom = !fromDate || expirationDate >= fromDate;
          const beforeTo = !toDate || expirationDate <= toDate;
          matchesDateFilter = afterFrom && beforeTo;
        }
      } else if (dateType === 'both') {
        // Match if either date is in range
        const scheduledAfterFrom = !fromDate || scheduledTime >= fromDate;
        const scheduledBeforeTo = !toDate || scheduledTime <= toDate;
        const scheduledMatches = scheduledAfterFrom && scheduledBeforeTo;
        
        let expirationMatches = false;
        if (expirationDate) {
          const expAfterFrom = !fromDate || expirationDate >= fromDate;
          const expBeforeTo = !toDate || expirationDate <= toDate;
          expirationMatches = expAfterFrom && expBeforeTo;
        }
        
        matchesDateFilter = scheduledMatches || expirationMatches;
      }
      
      if (!matchesDateFilter) return false;
    }
    
    // Advanced status filter
    if (advFilters.status) {
      switch (advFilters.status) {
        case 'active':
          if (lock.opened || lock.manuallyUnlocked) return false;
          break;
        case 'opened':
          if (!lock.opened && !lock.manuallyUnlocked) return false;
          break;
        case 'recurring':
          if (!lock.recurring) return false;
          break;
        case 'one-time':
          if (lock.recurring) return false;
          break;
      }
    }
    
    // Quick filters
    if (currentFilter === 'active' && (lock.opened || lock.manuallyUnlocked)) return false;
    if (currentFilter === 'notactive' && !lock.opened && !lock.manuallyUnlocked) return false;
    
    // Category-based filters (cat-daily, cat-weekly, cat-monthly, cat-once, cat-other)
    if (currentFilter === 'cat-daily' && (lock.category || 'Other').toLowerCase() !== 'daily') return false;
    if (currentFilter === 'cat-weekly' && (lock.category || 'Other').toLowerCase() !== 'weekly') return false;
    if (currentFilter === 'cat-monthly' && (lock.category || 'Other').toLowerCase() !== 'monthly') return false;
    if (currentFilter === 'cat-once' && (lock.category || 'Other').toLowerCase() !== 'once') return false;
    if (currentFilter === 'cat-other' && (lock.category || 'Other').toLowerCase() !== 'other') return false;
    
    // Custom category filter (for PRO categories)
    if (currentFilter === 'cat-custom' && lock.category !== customCategoryFilter) return false;
    
    if (currentFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 86400000);
      const d = new Date(lock.unlockTime);
      if (d < today || d >= tomorrow) return false;
    }
    
    return true;
  });
  
  // Sort
  filteredLocks.sort((a, b) => {
    switch (sortBy) {
      case 'custom':
        // Sort by custom sortOrder field
        const orderA = a.sortOrder !== undefined ? a.sortOrder : 9999;
        const orderB = b.sortOrder !== undefined ? b.sortOrder : 9999;
        return orderA - orderB;
      case 'time-asc':
        if (a.opened && !b.opened) return 1;
        if (!a.opened && b.opened) return -1;
        return new Date(a.unlockTime) - new Date(b.unlockTime);
      case 'time-desc':
        if (a.opened && !b.opened) return 1;
        if (!a.opened && b.opened) return -1;
        return new Date(b.unlockTime) - new Date(a.unlockTime);
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'url-asc':
        return (a.url || '').localeCompare(b.url || '');
      case 'url-desc':
        return (b.url || '').localeCompare(a.url || '');
      default:
        return new Date(a.unlockTime) - new Date(b.unlockTime);
    }
  });
  
  if (filteredLocks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3>No schedules found</h3>
        <p>Create your first schedule using the Add New tab or press Alt+L on any page.</p>
      </div>
    `;
    currentFilteredLocks = [];
    return;
  }
  
  // Store for shift+click selection
  currentFilteredLocks = filteredLocks;
  
  container.innerHTML = filteredLocks.map((lock, index) => {
    const unlockDate = new Date(lock.unlockTime);
    const isSelected = selectedIds.has(lock.id);
    const isOpened = lock.opened || lock.manuallyUnlocked;
    const category = categories.find(c => c.name === lock.category || c.id === lock.category);
    const color = lock.color || (category ? category.color : '#64748b');
    const hasResolvedUrls = lock.resolvedUrls && lock.resolvedUrls.length > 0;
    
    const timeStr = unlockDate.toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Build resolved URL tooltip
    const resolvedTooltip = hasResolvedUrls 
      ? `Redirects to: ${lock.resolvedUrls[lock.resolvedUrls.length - 1]}` 
      : '';
    
    return `
      <div class="schedule-item ${isSelected ? 'selected' : ''} ${isOpened ? 'opened' : ''}" data-id="${lock.id}" data-index="${index}">
        <div class="schedule-color-bar" style="background: ${color};"></div>
        <input type="checkbox" class="schedule-checkbox" ${isSelected ? 'checked' : ''}>
        <div class="schedule-info">
          <div class="schedule-header">
            <span class="schedule-name" data-id="${lock.id}" title="Double-click to edit">${lock.name || 'Unnamed'}</span>
            ${lock.recurring ? '<span class="badge badge-recurring">🔁 Recurring</span>' : ''}
            <span class="badge badge-category" style="background: ${color}20; color: ${color};">${category?.emoji || '📌'} ${lock.category || 'Other'}</span>
          </div>
          <div class="schedule-url">
            ${lock.url}
            ${hasResolvedUrls ? `<span class="resolved-url-indicator" title="${resolvedTooltip}">🔗</span>` : ''}
          </div>
          <div class="schedule-meta">
            <span>${isOpened ? '✅ Opened' : '⏰ Opens'}: ${timeStr}</span>
            <span>🔓 Re-lock: ${lock.lockMinutes === 0 ? 'Never' : (lock.lockMinutes || 0) === 0 ? 'Never' : (lock.lockMinutes) + 'min'}</span>
            ${lock.autoClose && lock.autoCloseMinutes ? `<span title="Tab will auto-close after this many minutes">⏱️ Auto-close: ${lock.autoCloseMinutes} min</span>` : ''}
            ${lock.openCount ? `<span>📊 ${lock.openCount}x</span>` : ''}
            ${lock.recurring ? `<span>🔄 ${getRepeatDescription(lock)}</span>` : ''}
            ${lock.playSound ? `<span title="Sound enabled">🔊</span>` : ''}
            ${lock.notes ? `<span class="notes-badge" data-id="${lock.id}" title="Click to view notes" style="background: #fbbf24; color: #78350f; padding: 2px 6px; border-radius: 4px; font-weight: 600; cursor: pointer;">📝 Notes</span>` : ''}
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn btn-sm btn-icon btn-outline resolve-btn" data-id="${lock.id}" title="Resolve shortened URL${hasResolvedUrls ? ' (already resolved)' : ''}">${hasResolvedUrls ? '🔗' : '🔍'}</button>
          <button class="btn btn-sm btn-icon btn-outline duplicate-btn" data-id="${lock.id}" title="Duplicate">📋</button>
          <button class="btn btn-sm btn-icon btn-outline edit-btn" data-id="${lock.id}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-icon btn-danger delete-btn" data-id="${lock.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handler for notes badges
  container.querySelectorAll('.notes-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      showNotesModal(badge.dataset.id);
    });
  });
  
  // Add event listeners for checkboxes with shift+click support
  container.querySelectorAll('.schedule-checkbox').forEach((cb, index) => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling
      
      const item = e.target.closest('.schedule-item');
      const id = item.dataset.id;
      const currentIndex = parseInt(item.dataset.index);
      
      if (e.shiftKey && lastSelectedIndex !== -1) {
        // Shift+Click: Select range from last selected to current
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        
        for (let i = start; i <= end; i++) {
          const lockId = currentFilteredLocks[i]?.id;
          if (lockId) {
            selectedIds.add(lockId);
          }
        }
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl+Click (or Cmd on Mac): Toggle individual item
        if (selectedIds.has(id)) {
          selectedIds.delete(id);
        } else {
          selectedIds.add(id);
          lastSelectedIndex = currentIndex;
        }
      } else {
        // Normal click: Toggle this item
        if (e.target.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }
        lastSelectedIndex = currentIndex;
      }
      
      updateBulkActions();
      renderSchedules();
    });
  });
  
  // Also allow clicking on the row (not just checkbox) for selection
  container.querySelectorAll('.schedule-item').forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons, checkbox, or input
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.schedule-actions')) {
        return;
      }
      
      const id = item.dataset.id;
      const currentIndex = parseInt(item.dataset.index);
      const checkbox = item.querySelector('.schedule-checkbox');
      
      if (e.shiftKey && lastSelectedIndex !== -1) {
        // Shift+Click: Select range
        e.preventDefault();
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        
        for (let i = start; i <= end; i++) {
          const lockId = currentFilteredLocks[i]?.id;
          if (lockId) {
            selectedIds.add(lockId);
          }
        }
        updateBulkActions();
        renderSchedules();
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl+Click: Toggle individual
        e.preventDefault();
        if (selectedIds.has(id)) {
          selectedIds.delete(id);
        } else {
          selectedIds.add(id);
        }
        lastSelectedIndex = currentIndex;
        updateBulkActions();
        renderSchedules();
      }
    });
  });
  
  container.querySelectorAll('.schedule-name').forEach(el => {
    el.addEventListener('dblclick', () => startInlineEdit(el));
  });
  
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteLock(btn.dataset.id));
  });
  
  container.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', () => duplicateLock(btn.dataset.id));
  });
  
  container.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', () => resolveUrl(btn.dataset.id));
  });
  
  // Setup drag and drop if in custom sort mode
  setupDragAndDrop();
}

function populateCategoryDropdowns() {
  // Use default categories if none loaded
  const cats = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  
  const selects = ['newCategory', 'bulkCategory', 'bmCategory', 'csvCategory', 'editCategory', 'categoryFilter', 'settingDefaultCategory'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) {
      console.log(`Category select not found: ${id}`);
      return;
    }
    
    const currentValue = select.value;
    select.innerHTML = id === 'categoryFilter' ? '<option value="">All Categories</option>' : '';
    
    cats.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = `${cat.emoji || '📌'} ${cat.name}`;
      select.appendChild(option);
    });
    
    // Set default value
    if (currentValue) {
      select.value = currentValue;
    } else if (id === 'newCategory' || id === 'bulkCategory' || id === 'bmCategory' || id === 'csvCategory') {
      // Default to "Daily" for new schedules
      select.value = 'Daily';
    }
  });
}

function renderCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  
  const cats = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  
  container.innerHTML = cats.map(cat => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg); border-radius: 8px; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">${cat.emoji || '📌'}</span>
        <span style="font-weight: 500;">${cat.name}</span>
        <span style="width: 16px; height: 16px; border-radius: 50%; background: ${cat.color || '#3b82f6'};"></span>
      </div>
      <button class="btn btn-outline btn-sm delete-category-btn" data-id="${cat.id}" style="color: var(--danger);">Delete</button>
    </div>
  `).join('');
  
  // Add delete handlers
  container.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Delete this category?')) return;
      categories = categories.filter(c => c.id !== id);
      await chrome.runtime.sendMessage({ action: 'updateCategories', categories });
      renderCategories();
      populateCategoryDropdowns();
      showToast('Category deleted');
    });
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', async () => {
    document.body.classList.toggle('dark');
    currentSettings.theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    await chrome.runtime.sendMessage({ action: 'updateSettings', settings: currentSettings });
  });
  
  // Pause All toggle
  document.getElementById('pauseAllBtn').addEventListener('click', async () => {
    const result = await chrome.storage.local.get(['pauseAll']);
    const newPauseState = !result.pauseAll;
    await chrome.storage.local.set({ pauseAll: newPauseState });
    updatePauseButton(newPauseState);
    showToast(newPauseState ? '⏸️ All schedules paused' : '▶️ Schedules resumed');
  });
  
  // Sidebar navigation
  document.querySelectorAll('.sidebar-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentFolder = null;
      currentFilter = null;
    });
  });
  
  // Premium locked items - show upgrade prompt
  document.querySelectorAll('.sidebar-item[data-action="showPremiumPrompt"]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showPremiumPrompt();
    });
  });
  
  // Quick filters
  document.querySelectorAll('.sidebar-item[data-filter]').forEach(item => {
    item.addEventListener('click', () => {
      currentFilter = item.dataset.filter;
      currentFolder = null;
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      switchView('schedules');
      renderSchedules();
    });
  });
  
  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  
  searchInput.addEventListener('input', () => {
    // Show/hide clear button based on input value
    searchClearBtn.style.display = searchInput.value ? 'flex' : 'none';
    renderSchedules();
  });
  
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    searchInput.focus();
    renderSchedules();
  });
  
  document.getElementById('categoryFilter').addEventListener('change', renderSchedules);
  document.getElementById('sortSelect').addEventListener('change', renderSchedules);
  
  // Select all
  document.getElementById('selectAllBtn').addEventListener('click', () => {
    const visibleLocks = document.querySelectorAll('.schedule-item');
    if (selectedIds.size === visibleLocks.length) {
      selectedIds.clear();
    } else {
      visibleLocks.forEach(item => selectedIds.add(item.dataset.id));
    }
    updateBulkActions();
    renderSchedules();
  });
  
  // Create schedule
  document.getElementById('createScheduleBtn').addEventListener('click', createSchedule);
  
  // Repeat type dropdown
  document.getElementById('newRepeatSelect').addEventListener('change', (e) => {
    const value = e.target.value;
    // Block premium repeat types for free/expired users
    if (PREMIUM_REPEAT_TYPES.includes(value) && !isPremiumFeature()) {
      e.target.value = document.getElementById('newRepeat').value || 'daily'; // revert
      showLicenseModal();
      return;
    }
    document.getElementById('newRepeat').value = value;
    document.getElementById('minuteIntervalGroup').style.display = value === 'minutes' ? 'block' : 'none';
    document.getElementById('hourlyIntervalGroup').style.display = value === 'hourly' ? 'block' : 'none';
    document.getElementById('customDaysGroup').style.display = value === 'custom-days' ? 'block' : 'none';
    document.getElementById('specificDatesGroup').style.display = value === 'specific-dates' ? 'block' : 'none';
  });
  
  // Auto-close checkbox toggle
  document.getElementById('newAutoClose').addEventListener('change', (e) => {
    document.getElementById('autoCloseMinutesGroup').style.display = e.target.checked ? 'block' : 'none';
  });
  
  // Edit modal repeat type dropdown
  document.getElementById('editRepeatType').addEventListener('change', (e) => {
    const value = e.target.value;
    document.getElementById('editMinuteGroup').style.display = value === 'minutes' ? 'block' : 'none';
    document.getElementById('editHourlyGroup').style.display = value === 'hourly' ? 'block' : 'none';
    document.getElementById('editCustomDaysGroup').style.display = value === 'custom-days' ? 'block' : 'none';
  });
  
  // Edit modal auto-close checkbox
  document.getElementById('editAutoClose').addEventListener('change', (e) => {
    document.getElementById('editAutoCloseGroup').style.display = e.target.checked ? 'block' : 'none';
  });
  
  setupButtonGroup('newLockMinutesGroup', 'newLockMinutes');
  
  // Color options
  setupColorOptions('newColorOptions', 'newColor');
  setupColorOptions('editColorOptions', 'editColor');
  
  // Collapsibles
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.collapsible').classList.toggle('open');
    });
  });
  
  // Card tabs - for bulk import text/bookmarks switching
  document.querySelectorAll('.card-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = tab.dataset.tab;
      const card = tab.closest('.card');
      
      // Remove active from all tabs in this card
      card.querySelectorAll('.card-tab').forEach(t => t.classList.remove('active'));
      // Remove active from all tab contents in this card
      card.querySelectorAll('.card-tab-content').forEach(c => c.classList.remove('active'));
      
      // Activate clicked tab
      tab.classList.add('active');
      
      // Activate corresponding content
      const content = document.getElementById(`tab-${tabId}`);
      if (content) {
        content.classList.add('active');
      }
    });
  });
  
  // Add Category button
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    const name = prompt('Enter category name:');
    if (!name) return;
    const emoji = prompt('Enter emoji for category (optional):', '📌') || '📌';
    const color = prompt('Enter color hex code (optional):', '#3b82f6') || '#3b82f6';
    
    categories.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      emoji: emoji,
      color: color
    });
    
    chrome.runtime.sendMessage({ action: 'updateCategories', categories });
    renderCategories();
    populateCategoryDropdowns();
    showToast(`Category "${name}" added`);
  });
  
  // Bulk import
  document.getElementById('bulkImportBtn').addEventListener('click', bulkImportText);
  document.getElementById('bmImportBtn').addEventListener('click', bulkImportBookmarks);
  
  // CSV/Excel import
  setupCsvImport();
  
  // Bookmark folder select
  setupBookmarkImport();
  
  // Export/Import
  document.getElementById('exportAllBtn').addEventListener('click', exportAllData);
  document.getElementById('importBackupBtn').addEventListener('click', () => {
    document.getElementById('importBackupFile').click();
  });
  document.getElementById('importBackupFile').addEventListener('change', importBackup);
  
  // Auto-backup
  document.getElementById('autoBackupEnabled').addEventListener('change', toggleAutoBackup);
  document.getElementById('autoBackupFrequency').addEventListener('change', saveAutoBackupSettings);
  document.getElementById('autoBackupKeep').addEventListener('change', saveAutoBackupSettings);
  document.getElementById('viewBackupsBtn').addEventListener('click', viewBackups);
  document.getElementById('backupsModalClose').addEventListener('click', () => {
    document.getElementById('backupsModal').classList.remove('visible');
  });
  document.getElementById('backupsCloseBtn').addEventListener('click', () => {
    document.getElementById('backupsModal').classList.remove('visible');
  });
  document.getElementById('clearAllBackupsBtn').addEventListener('click', clearAllBackups);
  
  // Load backup status
  loadAutoBackupStatus();
  
  // Settings
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
  document.getElementById('testNotificationBtn').addEventListener('click', testNotification);
  document.getElementById('repairSchedulesBtn').addEventListener('click', repairSchedules);
  
  // Bulk actions
  document.getElementById('bulkShiftTimeBtn').addEventListener('click', () => {
    // Check for premium access - Shift Time is a premium feature
    if (!isPremiumFeature()) {
      showToast('⭐ Shift Time is a Premium feature. Start your free trial or upgrade!');
      document.getElementById('licenseModal').classList.add('visible');
      return;
    }
    document.getElementById('shiftTimeModal').classList.add('visible');
  });
  document.getElementById('bulkDeleteBtn').addEventListener('click', bulkDelete);
  document.getElementById('bulkDuplicateBtn').addEventListener('click', bulkDuplicate);
  document.getElementById('bulkOpenAllBtn').addEventListener('click', bulkOpenAll);
  document.getElementById('bulkResolveBtn').addEventListener('click', bulkResolveUrls);
  document.getElementById('bulkRescheduleBtn').addEventListener('click', openBulkRescheduleModal);
  document.getElementById('bulkClearBtn').addEventListener('click', () => {
    selectedIds.clear();
    updateBulkActions();
    renderSchedules();
  });
  
  // Shift time modal
  document.getElementById('shiftTimeClose').addEventListener('click', () => {
    document.getElementById('shiftTimeModal').classList.remove('visible');
  });
  document.getElementById('shiftTimeCancelBtn').addEventListener('click', () => {
    document.getElementById('shiftTimeModal').classList.remove('visible');
  });
  document.getElementById('shiftTimeConfirmBtn').addEventListener('click', bulkShiftTime);
  
  // Shift time preset buttons
  document.querySelectorAll('.shift-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('shiftMinutes').value = btn.dataset.minutes;
    });
  });
  
  // Bulk reschedule modal
  document.getElementById('bulkRescheduleClose').addEventListener('click', closeBulkRescheduleModal);
  document.getElementById('bulkRescheduleCancelBtn').addEventListener('click', closeBulkRescheduleModal);
  document.getElementById('bulkRescheduleConfirmBtn').addEventListener('click', executeBulkReschedule);
  document.getElementById('rescheduleStartTime').addEventListener('change', updateReschedulePreview);
  document.getElementById('rescheduleInterval').addEventListener('change', updateReschedulePreview);
  
  // Edit modal
  document.getElementById('editModalClose').addEventListener('click', closeEditModal);
  document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
  document.getElementById('editSaveBtn').addEventListener('click', saveEdit);
  
  // Shortcuts modal
  document.getElementById('keyboardShortcutsBtn').addEventListener('click', () => {
    document.getElementById('shortcutsModal').classList.add('visible');
  });
  document.getElementById('shortcutsModalClose').addEventListener('click', () => {
    document.getElementById('shortcutsModal').classList.remove('visible');
  });
  
  // Notes modal
  document.getElementById('notesModalClose').addEventListener('click', closeNotesModal);
  document.getElementById('notesModalCloseBtn').addEventListener('click', closeNotesModal);
  document.getElementById('notesModalEditBtn').addEventListener('click', editFromNotesModal);
  
  // License modal
  document.getElementById('licenseBtn').addEventListener('click', () => {
    updateLicenseModal();
    document.getElementById('licenseModal').classList.add('visible');
  });
  document.getElementById('licenseModalClose').addEventListener('click', () => {
    document.getElementById('licenseModal').classList.remove('visible');
  });
  document.getElementById('activateLicenseBtn').addEventListener('click', async () => {
    const key = document.getElementById('licenseKeyInput').value.trim();
    if (!key) {
      showToast('Please enter a license key');
      return;
    }
    const result = await validateLicenseKey(key);
    if (result.valid) {
      showToast('🎉 License activated! Enjoy Premium!');
      showLicenseStatus();
      updateLicenseModal();
    } else {
      showToast(result.error);
    }
  });
  
  // Start trial button
  document.getElementById('startTrialBtn').addEventListener('click', async () => {
    await startTrial();
    updateLicenseModal();
    document.getElementById('licenseModal').classList.remove('visible');
  });
  
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('visible');
    });
  });
  
  // Advanced Search
  document.getElementById('advancedSearchBtn').addEventListener('click', () => {
    const panel = document.getElementById('advancedSearchPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });
  
  document.getElementById('applyAdvancedSearch').addEventListener('click', () => {
    renderSchedules();
  });
  
  document.getElementById('clearAdvancedSearch').addEventListener('click', () => {
    document.getElementById('searchDateType').value = 'scheduled';
    document.getElementById('searchDateFrom').value = '';
    document.getElementById('searchDateTo').value = '';
    document.getElementById('searchStatus').value = '';
    renderSchedules();
  });
  
  document.getElementById('saveSearchFilter').addEventListener('click', saveSearchFilter);
  
  // Cloud Sync
  document.getElementById('cloudExportBtn').addEventListener('click', exportForCloudSync);
  document.getElementById('cloudImportBtn').addEventListener('click', () => {
    document.getElementById('cloudImportFile').click();
  });
  document.getElementById('cloudImportFile').addEventListener('change', importFromCloudSync);
  
  // Health Check
  document.getElementById('runHealthCheckBtn').addEventListener('click', runHealthCheck);
  
  // Sort order change - show drag hint
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    const hint = document.getElementById('dragDropHint');
    if (e.target.value === 'custom') {
      hint.style.display = 'block';
    } else {
      hint.style.display = 'none';
    }
    renderSchedules();
  });
  
  // Load saved filters
  loadSavedFilters();
  loadCloudSyncStatus();
}

// ============================================
// ADVANCED SEARCH & FILTERS
// ============================================

function getAdvancedSearchFilters() {
  const dateType = document.getElementById('searchDateType').value;
  const dateFrom = document.getElementById('searchDateFrom').value;
  const dateTo = document.getElementById('searchDateTo').value;
  const status = document.getElementById('searchStatus').value;
  
  return { dateType, dateFrom, dateTo, status };
}

async function saveSearchFilter() {
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const name = prompt('Enter a name for this filter:');
  if (!name) return;
  
  const filter = {
    id: Date.now().toString(),
    name,
    ...getAdvancedSearchFilters(),
    category: document.getElementById('categoryFilter').value,
    searchText: document.getElementById('searchInput').value
  };
  
  const result = await chrome.storage.local.get(['savedFilters']);
  const savedFilters = result.savedFilters || [];
  savedFilters.push(filter);
  await chrome.storage.local.set({ savedFilters });
  
  loadSavedFilters();
  showToast(`Filter "${name}" saved!`);
}

async function loadSavedFilters() {
  const result = await chrome.storage.local.get(['savedFilters']);
  const savedFilters = result.savedFilters || [];
  
  const container = document.getElementById('savedFiltersContainer');
  const list = document.getElementById('savedFiltersList');
  
  if (savedFilters.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  list.innerHTML = savedFilters.map(f => `
    <div class="filter-pill" data-id="${f.id}">
      <span class="filter-name">${f.name}</span>
      <span class="delete-filter" data-id="${f.id}">&times;</span>
    </div>
  `).join('');
  
  // Add click handlers
  list.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-filter')) {
        deleteSavedFilter(e.target.dataset.id);
      } else {
        applySavedFilter(pill.dataset.id);
      }
    });
  });
}

async function applySavedFilter(filterId) {
  const result = await chrome.storage.local.get(['savedFilters']);
  const filter = (result.savedFilters || []).find(f => f.id === filterId);
  if (!filter) return;
  
  document.getElementById('searchDateFrom').value = filter.dateFrom || '';
  document.getElementById('searchDateTo').value = filter.dateTo || '';
  document.getElementById('searchStatus').value = filter.status || '';
  document.getElementById('categoryFilter').value = filter.category || '';
  document.getElementById('searchInput').value = filter.searchText || '';
  
  document.getElementById('advancedSearchPanel').style.display = 'block';
  renderSchedules();
  showToast(`Applied filter "${filter.name}"`);
}

async function deleteSavedFilter(filterId) {
  const result = await chrome.storage.local.get(['savedFilters']);
  const savedFilters = (result.savedFilters || []).filter(f => f.id !== filterId);
  await chrome.storage.local.set({ savedFilters });
  loadSavedFilters();
  showToast('Filter deleted');
}

// ============================================
// CLOUD SYNC
// ============================================

async function exportForCloudSync() {
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const result = await chrome.runtime.sendMessage({ action: 'cloudSync', operation: 'export' });
  
  if (result.success) {
    const blob = new Blob([JSON.stringify(result.exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabtimer-sync-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    loadCloudSyncStatus();
    showToast('☁️ Export ready! Save to your cloud storage.');
  } else {
    showToast(result.error || 'Export failed');
  }
}

async function importFromCloudSync(e) {
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.version || !data.data) {
      showToast('Invalid sync file format');
      return;
    }
    
    const result = await chrome.runtime.sendMessage({ 
      action: 'cloudSync', 
      operation: 'import', 
      data 
    });
    
    if (result.success) {
      showToast(`☁️ Synced! Added ${result.added} new schedules.`);
      await refreshData();
      loadCloudSyncStatus();
    } else {
      showToast(result.error || 'Import failed');
    }
  } catch (err) {
    showToast('Error reading sync file: ' + err.message);
  }
  
  e.target.value = '';
}

async function loadCloudSyncStatus() {
  const result = await chrome.runtime.sendMessage({ action: 'cloudSync', operation: 'getLastSync' });
  
  const statusText = document.getElementById('cloudSyncStatusText');
  const lastSyncTime = document.getElementById('lastSyncTime');
  
  if (result.lastSync) {
    const syncDate = new Date(result.lastSync);
    statusText.textContent = '✅ Synced';
    lastSyncTime.textContent = `Last sync: ${syncDate.toLocaleString()}`;
  } else {
    statusText.textContent = 'Not synced yet';
    lastSyncTime.textContent = '';
  }
}

// ============================================
// HEALTH CHECK
// ============================================

async function runHealthCheck() {
  const statusText = document.getElementById('healthCheckStatusText');
  const reportDiv = document.getElementById('healthCheckReport');
  
  statusText.textContent = '🔄 Running health check...';
  
  const result = await chrome.runtime.sendMessage({ action: 'runHealthCheck' });
  
  if (result.success) {
    const issues = result.issues;
    const total = result.totalFixed;
    
    if (total === 0) {
      statusText.textContent = '✅ All schedules are healthy!';
      reportDiv.style.display = 'none';
    } else {
      statusText.textContent = `🔧 Fixed ${total} issues`;
      reportDiv.style.display = 'block';
      reportDiv.innerHTML = `
        <strong>Health Check Report:</strong><br>
        • Stuck recurring schedules: ${issues.stuckRecurring}<br>
        • Duplicate IDs removed: ${issues.duplicateIds}<br>
        • Orphaned alarms cleared: ${issues.orphanedAlarms}<br>
        • Invalid URLs removed: ${issues.invalidUrls}<br>
        • Missing fields fixed: ${issues.missingFields}<br>
        • Incorrectly opened fixed: ${issues.fixedOpened}
      `;
      await refreshData();
    }
  } else {
    statusText.textContent = '❌ Health check failed';
  }
}

// ============================================
// DRAG AND DROP
// ============================================

let draggedElement = null;

function setupDragAndDrop() {
  const list = document.getElementById('scheduleList');
  const sortSelect = document.getElementById('sortSelect');
  
  // Only enable drag and drop in custom sort mode
  if (sortSelect.value !== 'custom') return;
  
  const items = list.querySelectorAll('.schedule-item');
  
  items.forEach(item => {
    item.setAttribute('draggable', 'true');
    item.classList.add('draggable');
    
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.schedule-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  if (this !== draggedElement) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  if (this === draggedElement) return;
  
  const list = document.getElementById('scheduleList');
  const items = Array.from(list.querySelectorAll('.schedule-item'));
  const draggedIndex = items.indexOf(draggedElement);
  const targetIndex = items.indexOf(this);
  
  if (draggedIndex < targetIndex) {
    this.parentNode.insertBefore(draggedElement, this.nextSibling);
  } else {
    this.parentNode.insertBefore(draggedElement, this);
  }
  
  // Save new order
  const newOrder = Array.from(list.querySelectorAll('.schedule-item')).map(item => item.dataset.id);
  await chrome.runtime.sendMessage({ action: 'updateSortOrder', order: newOrder });
  
  showToast('Order saved');
}

function setupButtonGroup(groupId, hiddenId, callback) {
  const group = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenId);
  if (!group || !hidden) return;
  
  group.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hidden.value = btn.dataset.value;
      if (callback) callback(btn.dataset.value);
    });
  });
}

function setupColorOptions(containerId, hiddenId) {
  const container = document.getElementById(containerId);
  const hidden = document.getElementById(hiddenId);
  if (!container || !hidden) return;
  
  container.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      hidden.value = opt.dataset.color;
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    
    // ? - Show shortcuts
    if (e.key === '?') {
      document.getElementById('shortcutsModal').classList.add('visible');
    }
    
    // Ctrl+F - Focus search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    
    // Ctrl+A - Select all
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      document.getElementById('selectAllBtn').click();
    }
    
    // Delete - Delete selected
    if (e.key === 'Delete' && selectedIds.size > 0) {
      bulkDelete();
    }
    
    // Ctrl+D - Duplicate selected
    if (e.ctrlKey && e.key === 'd' && selectedIds.size > 0) {
      e.preventDefault();
      bulkDuplicate();
    }
    
    // Ctrl+N - New schedule
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      switchView('add');
    }
    
    // Ctrl+T - Toggle theme
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      document.getElementById('themeToggle').click();
    }
    
    // Escape - Close modals or deselect
    if (e.key === 'Escape') {
      const visibleModals = document.querySelectorAll('.modal-overlay.visible');
      if (visibleModals.length > 0) {
        visibleModals.forEach(m => m.classList.remove('visible'));
      } else if (selectedIds.size > 0) {
        // Deselect all if no modals are open
        selectedIds.clear();
        updateBulkActions();
        renderSchedules();
        showToast('Selection cleared');
      }
    }
    
    // Ctrl+P - Pause/Resume all
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      document.getElementById('pauseAllBtn').click();
    }
  });
}

// ============================================
// VIEW MANAGEMENT
// ============================================

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view-content').forEach(v => v.style.display = 'none');
  const viewEl = document.getElementById(`view-${view}`);
  if (viewEl) viewEl.style.display = 'block';
  
  // Show/hide stats
  document.getElementById('statsGrid').style.display = view === 'schedules' ? 'grid' : 'none';
}

// ============================================
// CRUD OPERATIONS
// ============================================

async function createSchedule() {
  const url = document.getElementById('newUrl').value.trim();
  const name = document.getElementById('newName').value.trim();
  const category = document.getElementById('newCategory').value;
  const folder = document.getElementById('newFolder').value;
  const color = document.getElementById('newColor').value;
  const datetime = document.getElementById('newDatetime').value;
  const repeat = document.getElementById('newRepeat').value;
  const lockMinutes = parseInt(document.getElementById('newLockMinutes').value);
  
  // Get auto-close settings
  const autoClose = document.getElementById('newAutoClose').checked;
  const autoCloseMinutes = autoClose ? parseInt(document.getElementById('newAutoCloseMinutes').value) : 0;
  
  // Get sound notification setting
  const playSound = document.getElementById('newPlaySound').checked;
  
  // Get custom repeat settings
  let minuteInterval = null;
  let hourlyInterval = null;
  let customDays = null;
  let specificDates = null;
  
  if (repeat === 'minutes') {
    minuteInterval = parseInt(document.getElementById('newMinuteInterval').value);
  } else if (repeat === 'hourly') {
    hourlyInterval = parseInt(document.getElementById('newHourlyInterval').value);
  } else if (repeat === 'custom-days') {
    customDays = parseInt(document.getElementById('newCustomDays').value);
  } else if (repeat === 'specific-dates') {
    const datesText = document.getElementById('newSpecificDates').value.trim();
    if (datesText) {
      specificDates = datesText.split(',').map(d => d.trim()).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
      if (specificDates.length === 0) {
        showToast('Please enter valid dates in YYYY-MM-DD format');
        return;
      }
    }
  }
  
  if (!url) {
    showToast('Please enter a URL');
    return;
  }
  
  if (!datetime) {
    showToast('Please select a date and time');
    return;
  }
  
  const unlockTime = new Date(datetime);
  if (unlockTime <= new Date()) {
    showToast('Schedule time must be in the future');
    return;
  }
  
  // Check for conflicts
  const conflict = await chrome.runtime.sendMessage({ 
    action: 'checkConflict', 
    time: unlockTime.toISOString() 
  });
  
  if (conflict.hasConflict) {
    const proceed = confirm(`Another schedule exists at this time. Schedule anyway?`);
    if (!proceed) return;
  }
  
  const result = await chrome.runtime.sendMessage({
    action: 'createLock',
    lock: {
      url,
      name,
      category,
      folder,
      color,
      unlockTime: unlockTime.toISOString(),
      recurring: repeat !== 'none' && repeat !== 'specific-dates',
      repeatType: repeat,
      lockMinutes,
      autoClose,
      autoCloseMinutes,
      playSound,
      minuteInterval,
      hourlyInterval,
      customDays,
      specificDates
    }
  });
  
  if (result.success) {
    showToast('Schedule created!');
    await refreshData();
    switchView('schedules');
    
    // Clear form
    document.getElementById('newUrl').value = '';
    document.getElementById('newName').value = '';
  } else {
    showToast('Failed to create schedule');
  }
}

async function deleteLock(id) {
  if (!confirm('Delete this schedule?')) return;
  
  await chrome.runtime.sendMessage({ action: 'deleteLock', id });
  showToast('Schedule deleted');
  await refreshData();
}

async function duplicateLock(id) {
  // Check for premium access - duplicate is a premium feature
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const lock = locks.find(l => l.id === id);
  if (!lock) {
    showToast('Schedule not found');
    return;
  }
  
  // Show the time conflict modal
  const selectedTime = await showDuplicateTimeModal(lock);
  
  if (!selectedTime) {
    // User cancelled
    return;
  }
  
  try {
    const result = await chrome.runtime.sendMessage({ 
      action: 'duplicateLock', 
      id,
      customTime: selectedTime.toISOString()
    });
    if (result && result.success) {
      showToast('Schedule duplicated!');
      await refreshData();
    } else {
      showToast('Failed to duplicate: ' + (result?.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Duplicate error:', error);
    showToast('Error duplicating: ' + error.message);
  }
}

function showDuplicateTimeModal(lock) {
  return new Promise(async (resolve) => {
    const modal = document.getElementById('duplicateTimeModal');
    const sourceName = document.getElementById('duplicateSourceName');
    const currentTimeDiv = document.getElementById('duplicateCurrentTime');
    const nextTimeSpan = document.getElementById('duplicateNextTime');
    const customTimeInput = document.getElementById('duplicateTimeCustom');
    
    // Display source info
    sourceName.textContent = lock.name || lock.url;
    
    const currentTime = new Date(lock.unlockTime);
    currentTimeDiv.textContent = currentTime.toLocaleString();
    
    // Find next available time slot
    const nextSlotResult = await chrome.runtime.sendMessage({
      action: 'findNextAvailableSlot',
      startTime: lock.unlockTime,
      intervalMinutes: 1
    });
    
    const nextAvailableTime = new Date(nextSlotResult.time);
    nextTimeSpan.textContent = nextAvailableTime.toLocaleString();
    
    // Set custom time default to next available
    customTimeInput.value = formatDateTimeLocal(nextAvailableTime);
    
    // Show modal
    modal.classList.add('visible');
    
    // Clean up function to remove listeners
    const cleanup = () => {
      modal.classList.remove('visible');
      // Clone and replace buttons to remove old listeners
      const buttons = ['duplicateTimeModalClose', 'duplicateTimeCancelBtn', 'duplicateTimeSameBtn', 'duplicateTimeNextBtn', 'duplicateTimeCustomBtn'];
      buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn.replaceWith(btn.cloneNode(true));
      });
    };
    
    // Set up button handlers
    document.getElementById('duplicateTimeModalClose').addEventListener('click', () => {
      cleanup();
      resolve(null);
    });
    
    document.getElementById('duplicateTimeCancelBtn').addEventListener('click', () => {
      cleanup();
      resolve(null);
    });
    
    document.getElementById('duplicateTimeSameBtn').addEventListener('click', () => {
      cleanup();
      resolve(currentTime);
    });
    
    document.getElementById('duplicateTimeNextBtn').addEventListener('click', () => {
      cleanup();
      resolve(nextAvailableTime);
    });
    
    document.getElementById('duplicateTimeCustomBtn').addEventListener('click', () => {
      const customTime = new Date(customTimeInput.value);
      cleanup();
      resolve(customTime);
    });
  });
}

async function resolveUrl(id) {
  const lock = locks.find(l => l.id === id);
  if (!lock) return;
  
  showToast('🔍 Resolving URL... please wait');
  
  try {
    const result = await chrome.runtime.sendMessage({ action: 'resolveUrl', id: id, url: lock.url });
    if (result && result.success) {
      if (result.resolvedUrl && result.resolvedUrl !== lock.url) {
        showToast(`✅ Resolved to: ${result.resolvedUrl.substring(0, 50)}...`);
      } else {
        showToast('ℹ️ URL does not redirect (no change)');
      }
      await refreshData();
    } else {
      showToast('Failed to resolve: ' + (result?.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Resolve error:', error);
    showToast('Error resolving URL: ' + error.message);
  }
}

function openEditModal(id) {
  const lock = locks.find(l => l.id === id);
  if (!lock) return;
  
  document.getElementById('editId').value = id;
  document.getElementById('editUrl').value = lock.url;
  document.getElementById('editName').value = lock.name || '';
  document.getElementById('editCategory').value = lock.category || '';
  document.getElementById('editFolder').value = lock.folder || 'default';
  // Convert unlockTime to local datetime for the edit field (toISOString gives UTC which shows wrong time)
  const editDate = new Date(lock.unlockTime);
  // For recurring schedules where the stored time is in the past, advance to next future occurrence
  // so the edit form always shows a sensible upcoming time
  let editDisplayTime = editDate;
  if (lock.recurring && editDate.getTime() < Date.now()) {
    // Step forward by the repeat interval until we get a future time
    let candidate = new Date(editDate);
    let safety = 0;
    const interval = lock.hourlyInterval || 1;
    while (candidate.getTime() <= Date.now() && safety < 1000) {
      if (lock.repeatType === 'hourly') candidate.setHours(candidate.getHours() + interval);
      else if (lock.repeatType === 'minutes') candidate.setMinutes(candidate.getMinutes() + (lock.minuteInterval || 10));
      else if (lock.repeatType === 'daily') candidate.setDate(candidate.getDate() + 1);
      else if (lock.repeatType === 'weekly') candidate.setDate(candidate.getDate() + 7);
      else if (lock.repeatType === 'monthly') candidate.setMonth(candidate.getMonth() + 1);
      else if (lock.repeatType === 'yearly') candidate.setFullYear(candidate.getFullYear() + 1);
      else if (lock.repeatType === 'custom-days') candidate.setDate(candidate.getDate() + (lock.customDays || 2));
      else candidate.setDate(candidate.getDate() + 1);
      safety++;
    }
    editDisplayTime = candidate;
  }
  // Format as local time for datetime-local input (YYYY-MM-DDTHH:MM:SS)
  const tzOffset = editDisplayTime.getTimezoneOffset() * 60000;
  const localISO = new Date(editDisplayTime.getTime() - tzOffset).toISOString().slice(0, 19);
  document.getElementById('editDatetime').value = localISO;
  document.getElementById('editRecurring').checked = lock.recurring;
  document.getElementById('editRepeatType').value = lock.repeatType || 'daily';
  document.getElementById('editLockMinutes').value = lock.lockMinutes !== undefined ? lock.lockMinutes : 5;
  
  // Set minute interval
  if (lock.repeatType === 'minutes') {
    document.getElementById('editMinuteInterval').value = lock.minuteInterval || 10;
    document.getElementById('editMinuteGroup').style.display = 'block';
  } else {
    document.getElementById('editMinuteGroup').style.display = 'none';
  }
  
  // Set hourly interval
  if (lock.repeatType === 'hourly') {
    document.getElementById('editHourlyInterval').value = lock.hourlyInterval || 6;
    document.getElementById('editHourlyGroup').style.display = 'block';
  } else {
    document.getElementById('editHourlyGroup').style.display = 'none';
  }
  
  // Set custom days
  if (lock.repeatType === 'custom-days') {
    document.getElementById('editCustomDays').value = lock.customDays || 3;
    document.getElementById('editCustomDaysGroup').style.display = 'block';
  } else {
    document.getElementById('editCustomDaysGroup').style.display = 'none';
  }
  
  // Set auto-close
  document.getElementById('editAutoClose').checked = lock.autoClose || false;
  document.getElementById('editAutoCloseMinutes').value = lock.autoCloseMinutes || 5;
  document.getElementById('editAutoCloseGroup').style.display = lock.autoClose ? 'block' : 'none';
  
  // Set play sound
  document.getElementById('editPlaySound').checked = lock.playSound || false;
  
  // Set notes (Premium)
  document.getElementById('editNotes').value = lock.notes || '';
  
  // Set color
  document.getElementById('editColor').value = lock.color || '';
  document.querySelectorAll('#editColorOptions .color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === (lock.color || ''));
  });
  
  document.getElementById('editModal').classList.add('visible');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('visible');
}

// Notes Modal
let currentNotesLockId = null;

function showNotesModal(id) {
  const lock = locks.find(l => l.id === id);
  if (!lock || !lock.notes) return;
  
  currentNotesLockId = id;
  
  document.getElementById('notesModalName').textContent = lock.name || 'Unnamed';
  document.getElementById('notesModalUrl').textContent = lock.url;
  document.getElementById('notesModalContent').textContent = lock.notes;
  
  document.getElementById('notesModal').classList.add('visible');
}

function closeNotesModal() {
  document.getElementById('notesModal').classList.remove('visible');
  currentNotesLockId = null;
}

function editFromNotesModal() {
  if (currentNotesLockId) {
    const idToEdit = currentNotesLockId; // Save the ID before closing
    closeNotesModal();
    openEditModal(idToEdit);
  }
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const repeatType = document.getElementById('editRepeatType').value;
  const autoClose = document.getElementById('editAutoClose').checked;
  const playSound = document.getElementById('editPlaySound').checked;
  const notes = document.getElementById('editNotes').value;
  
  // Get custom repeat values
  let minuteInterval = null;
  let hourlyInterval = null;
  let customDays = null;
  
  if (repeatType === 'minutes') {
    minuteInterval = parseInt(document.getElementById('editMinuteInterval').value);
  } else if (repeatType === 'hourly') {
    hourlyInterval = parseInt(document.getElementById('editHourlyInterval').value);
  } else if (repeatType === 'custom-days') {
    customDays = parseInt(document.getElementById('editCustomDays').value);
  }
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'updateLock',
      lock: {
        id,
        url: document.getElementById('editUrl').value,
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        folder: document.getElementById('editFolder').value || 'default',
        color: document.getElementById('editColor').value || '',
        unlockTime: (() => {
          // datetime-local gives local time — convert correctly to ISO
          const raw = document.getElementById('editDatetime').value;
          return new Date(raw).toISOString();
        })(),
        recurring: document.getElementById('editRecurring').checked,
        opened: false,        // always reset so the schedule fires again after editing
        reminderSent: false,  // reset reminder so it fires fresh
        repeatType: repeatType,
        lockMinutes: parseInt(document.getElementById('editLockMinutes').value),
        minuteInterval,
        hourlyInterval,
        customDays,
        autoClose,
        autoCloseMinutes: autoClose ? parseInt(document.getElementById('editAutoCloseMinutes').value) : 0,
        playSound,
        notes
      }
    });
    
    if (result && result.success) {
      showToast('Schedule updated');
      closeEditModal();
      await refreshData();
    } else {
      showToast('Failed to update: ' + (result?.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Save edit error:', error);
    showToast('Error saving: ' + error.message);
  }
}

// Inline edit
function startInlineEdit(nameEl) {
  const lockId = nameEl.dataset.id;
  const currentName = nameEl.textContent.trim();
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName === 'Unnamed' ? '' : currentName;
  input.style.cssText = `
    font-size: inherit; font-weight: inherit; padding: 4px 8px;
    border: 2px solid var(--primary); border-radius: 6px;
    background: var(--bg-input); color: var(--text); min-width: 200px;
  `;
  
  nameEl.style.display = 'none';
  nameEl.parentNode.insertBefore(input, nameEl);
  input.focus();
  input.select();
  
  const save = async () => {
    const newName = input.value.trim() || 'Unnamed';
    await chrome.runtime.sendMessage({
      action: 'updateLock',
      lock: { id: lockId, name: newName }
    });
    input.remove();
    nameEl.style.display = '';
    nameEl.textContent = newName;
    showToast('Name updated');
  };
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      input.remove();
      nameEl.style.display = '';
    }
  });
  
  input.addEventListener('blur', () => setTimeout(save, 100));
}

// ============================================
// BULK OPERATIONS
// ============================================

function updateBulkActions() {
  const bar = document.getElementById('bulkActions');
  document.getElementById('selectedCount').textContent = selectedIds.size;
  bar.classList.toggle('visible', selectedIds.size > 0);
}

async function bulkDelete() {
  if (!confirm(`Delete ${selectedIds.size} schedules?`)) return;
  
  await chrome.runtime.sendMessage({ action: 'deleteLocks', ids: Array.from(selectedIds) });
  showToast(`Deleted ${selectedIds.size} schedules`);
  selectedIds.clear();
  updateBulkActions();
  await refreshData();
}

async function bulkDuplicate() {
  for (const id of selectedIds) {
    await chrome.runtime.sendMessage({ action: 'duplicateLock', id });
  }
  showToast(`Duplicated ${selectedIds.size} schedules`);
  await refreshData();
}

async function bulkShiftTime() {
  const minutes = parseInt(document.getElementById('shiftMinutes').value);
  await chrome.runtime.sendMessage({ 
    action: 'bulkShiftTime', 
    ids: Array.from(selectedIds), 
    minutes 
  });
  showToast(`Shifted ${selectedIds.size} schedules by ${minutes} minutes`);
  document.getElementById('shiftTimeModal').classList.remove('visible');
  await refreshData();
}

// ============================================
// BULK RESCHEDULE FUNCTIONS
// ============================================

function openBulkRescheduleModal() {
  // Check for premium
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  if (selectedIds.size === 0) {
    showToast('Please select schedules to reschedule');
    return;
  }
  
  // Get all non-selected locks to check for conflicts
  const otherLocks = locks.filter(l => !selectedIds.has(l.id) && !l.opened && !l.manuallyUnlocked);
  const intervalSeconds = parseInt(document.getElementById('rescheduleInterval').value) || 60;
  
  // Start from now, rounded up to next minute
  let proposedTime = new Date();
  proposedTime.setSeconds(0, 0);
  proposedTime.setMinutes(proposedTime.getMinutes() + 1);
  
  // Find next available time that doesn't conflict with existing schedules
  let attempts = 0;
  while (attempts < 1000) {
    const conflict = otherLocks.find(other => {
      const otherTime = new Date(other.unlockTime);
      const diff = Math.abs(proposedTime.getTime() - otherTime.getTime());
      return diff < intervalSeconds * 1000; // Within the interval window
    });
    
    if (!conflict) {
      break; // Found a free slot
    }
    
    // Move to next minute
    proposedTime.setMinutes(proposedTime.getMinutes() + 1);
    attempts++;
  }
  
  // Format for datetime-local input (local timezone)
  document.getElementById('rescheduleStartTime').value = formatDateTimeLocal(proposedTime);
  
  // Update count
  document.getElementById('rescheduleCount').textContent = selectedIds.size;
  
  // Generate preview
  updateReschedulePreview();
  
  // Show modal
  document.getElementById('bulkRescheduleModal').classList.add('visible');
}

function closeBulkRescheduleModal() {
  document.getElementById('bulkRescheduleModal').classList.remove('visible');
}

function updateReschedulePreview() {
  const startTimeStr = document.getElementById('rescheduleStartTime').value;
  const intervalSeconds = parseInt(document.getElementById('rescheduleInterval').value);
  
  if (!startTimeStr) {
    document.getElementById('reschedulePreviewList').innerHTML = '<em>Select a start time</em>';
    return;
  }
  
  const startTime = new Date(startTimeStr);
  const selectedLocks = Array.from(selectedIds).map(id => locks.find(l => l.id === id)).filter(Boolean);
  
  // Sort by current unlock time to maintain order
  selectedLocks.sort((a, b) => new Date(a.unlockTime) - new Date(b.unlockTime));
  
  // Get all OTHER locks (not selected) to check for conflicts
  const otherLocks = locks.filter(l => !selectedIds.has(l.id));
  
  let previewHtml = '';
  let conflictHtml = '';
  let hasConflicts = false;
  let currentTime = new Date(startTime);
  
  for (let i = 0; i < selectedLocks.length; i++) {
    const lock = selectedLocks[i];
    let scheduledTime = new Date(currentTime);
    let conflictResolved = false;
    
    // Check for conflicts with other (non-selected) schedules
    let attempts = 0;
    while (attempts < 100) {
      const conflict = otherLocks.find(other => {
        const otherTime = new Date(other.unlockTime);
        const diff = Math.abs(scheduledTime.getTime() - otherTime.getTime());
        return diff < intervalSeconds * 1000; // Within the interval window
      });
      
      if (conflict) {
        hasConflicts = true;
        conflictHtml += `<div>• "${lock.name?.substring(0, 30) || 'Schedule'}..." conflicts at ${scheduledTime.toLocaleTimeString()} - moved to next slot</div>`;
        scheduledTime = new Date(scheduledTime.getTime() + intervalSeconds * 1000);
        conflictResolved = true;
        attempts++;
      } else {
        break;
      }
    }
    
    const timeStr = scheduledTime.toLocaleString();
    const name = lock.name?.substring(0, 40) || lock.url.substring(0, 40);
    previewHtml += `<div style="padding: 4px 0; border-bottom: 1px solid var(--border);">
      <strong>${i + 1}.</strong> ${timeStr}${conflictResolved ? ' <span style="color: #f59e0b;">(adjusted)</span>' : ''}
      <div style="color: var(--text-muted); font-size: 12px; margin-left: 20px;">${name}...</div>
    </div>`;
    
    // Move to next slot
    currentTime = new Date(scheduledTime.getTime() + intervalSeconds * 1000);
  }
  
  document.getElementById('reschedulePreviewList').innerHTML = previewHtml;
  
  // Show/hide conflicts
  const conflictsDiv = document.getElementById('rescheduleConflicts');
  if (hasConflicts) {
    document.getElementById('rescheduleConflictList').innerHTML = conflictHtml;
    conflictsDiv.style.display = 'block';
  } else {
    conflictsDiv.style.display = 'none';
  }
}

async function executeBulkReschedule() {
  const startTimeStr = document.getElementById('rescheduleStartTime').value;
  const intervalSeconds = parseInt(document.getElementById('rescheduleInterval').value);
  
  if (!startTimeStr) {
    showToast('Please select a start time');
    return;
  }
  
  const startTime = new Date(startTimeStr);
  const selectedLocks = Array.from(selectedIds).map(id => locks.find(l => l.id === id)).filter(Boolean);
  
  // Sort by current unlock time to maintain order
  selectedLocks.sort((a, b) => new Date(a.unlockTime) - new Date(b.unlockTime));
  
  // Get all OTHER locks (not selected) to check for conflicts
  const otherLocks = locks.filter(l => !selectedIds.has(l.id));
  
  // Calculate new times avoiding conflicts
  const updates = [];
  let currentTime = new Date(startTime);
  
  for (const lock of selectedLocks) {
    let scheduledTime = new Date(currentTime);
    
    // Check for conflicts and adjust
    let attempts = 0;
    while (attempts < 100) {
      const conflict = otherLocks.find(other => {
        const otherTime = new Date(other.unlockTime);
        const diff = Math.abs(scheduledTime.getTime() - otherTime.getTime());
        return diff < intervalSeconds * 1000;
      });
      
      if (conflict) {
        scheduledTime = new Date(scheduledTime.getTime() + intervalSeconds * 1000);
        attempts++;
      } else {
        break;
      }
    }
    
    updates.push({
      id: lock.id,
      unlockTime: scheduledTime.toISOString()
    });
    
    currentTime = new Date(scheduledTime.getTime() + intervalSeconds * 1000);
  }
  
  // Apply all updates
  const result = await chrome.storage.local.get(['locks']);
  const allLocks = result.locks || [];
  
  for (const update of updates) {
    const lock = allLocks.find(l => l.id === update.id);
    if (lock) {
      lock.unlockTime = update.unlockTime;
      lock.opened = false;
      lock.manuallyUnlocked = false;
      lock.autoRelockAt = null;
    }
  }
  
  await chrome.storage.local.set({ locks: allLocks });
  
  closeBulkRescheduleModal();
  selectedIds.clear();
  updateBulkActions();
  await refreshData();
  
  showToast(`✅ Rescheduled ${updates.length} schedules!`);
}

async function bulkOpenAll() {
  const count = selectedIds.size;
  if (count === 0) return;
  
  if (!confirm(`Open ${count} selected URLs in new tabs?\n\nNote: This will NOT affect their schedules - they will still open at their scheduled times.`)) return;
  
  for (const id of selectedIds) {
    const lock = locks.find(l => l.id === id);
    if (lock) {
      // Just open the tab - don't change any schedule status
      chrome.tabs.create({ url: lock.url, active: false });
    }
  }
  
  selectedIds.clear();
  updateBulkActions();
  showToast(`Opened ${count} URLs (schedules unchanged)`);
  renderSchedules();
}

async function bulkResolveUrls() {
  const count = selectedIds.size;
  if (count === 0) return;
  
  if (!confirm(`Resolve ${count} selected URLs?\n\nThis will open each URL in a background tab, capture the final URL after any redirects, then close the tab.\n\nThis may take a few seconds per URL.`)) return;
  
  showToast(`🔍 Resolving ${count} URLs... please wait`);
  
  let resolved = 0;
  let unchanged = 0;
  let failed = 0;
  
  for (const id of selectedIds) {
    const lock = locks.find(l => l.id === id);
    if (lock) {
      try {
        const result = await chrome.runtime.sendMessage({ action: 'resolveUrl', id: id, url: lock.url });
        if (result && result.success) {
          if (result.resolvedUrl && result.resolvedUrl !== lock.url) {
            resolved++;
          } else {
            unchanged++;
          }
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
  }
  
  selectedIds.clear();
  updateBulkActions();
  await refreshData();
  
  let message = `✅ Done! ${resolved} resolved`;
  if (unchanged > 0) message += `, ${unchanged} unchanged`;
  if (failed > 0) message += `, ${failed} failed`;
  showToast(message);
}

// ============================================
// BULK IMPORT
// ============================================

// Global state for duplicate handling during import
let duplicateImportState = {
  skipAll: false,
  pendingLines: [],
  currentIndex: 0,
  created: 0,
  skipped: 0,
  startTime: null,
  stagger: false,
  staggerSeconds: 60,
  staggerIndex: 0,
  category: 'Daily',
  recurring: false,
  repeatType: 'daily',
  existingUrls: new Set(),
  resolve: null
};

async function bulkImportText() {
  // Check for premium access - bulk import is a premium feature
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const lines = document.getElementById('bulkUrls').value.split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    showToast('Please enter at least one URL');
    return;
  }
  
  const startTimeInput = document.getElementById('bulkStartTime').value;
  if (!startTimeInput) {
    showToast('Please select a start time');
    return;
  }
  
  // Initialize import state
  duplicateImportState = {
    skipAll: false,
    pendingLines: lines,
    currentIndex: 0,
    created: 0,
    skipped: 0,
    startTime: new Date(startTimeInput),
    stagger: document.getElementById('bulkStagger').checked,
    staggerSeconds: parseInt(document.getElementById('bulkStaggerInterval').value) || 60,
    staggerIndex: 0,
    category: document.getElementById('bulkCategory').value || 'Daily',
    recurring: document.getElementById('bulkRecurring').checked,
    repeatType: document.getElementById('bulkRepeatType').value,
    playSound: document.getElementById('bulkPlaySound').checked,
    existingUrls: new Set(locks.map(l => l.url.toLowerCase())),
    resolve: null
  };
  
  // Process each line
  await processNextImportLine();
}

async function processNextImportLine() {
  const state = duplicateImportState;
  
  while (state.currentIndex < state.pendingLines.length) {
    const line = state.pendingLines[state.currentIndex].trim();
    state.currentIndex++;
    
    if (!line) continue;
    
    let parsed = parseImportLine(line);
    
    if (!parsed.url) {
      continue; // Skip lines without valid URLs
    }
    
    // Check for duplicate URL
    const urlLower = parsed.url.toLowerCase();
    if (state.existingUrls.has(urlLower)) {
      if (state.skipAll) {
        state.skipped++;
        continue;
      }
      
      // Find the existing schedule
      const existingLock = locks.find(l => l.url.toLowerCase() === urlLower);
      
      // Show duplicate modal and wait for user decision
      const decision = await showDuplicateModal(parsed, existingLock, state);
      
      if (decision.action === 'skip') {
        state.skipped++;
        continue;
      } else if (decision.action === 'skipAll') {
        state.skipAll = true;
        state.skipped++;
        continue;
      } else if (decision.action === 'add') {
        // Add at the specified time
        await createImportSchedule(parsed, decision.time, state);
        state.existingUrls.add(urlLower);
        state.created++;
        continue;
      }
    }
    
    // Not a duplicate - prompt for name if missing
    if (!parsed.name) {
      const userInput = prompt(`Enter expiration date and name for:\n${parsed.url}\n\nFormat: MM/DD Name (e.g., "1/31 Flashlight")\nOr just a name, or leave blank:`);
      if (userInput === null) {
        continue; // User cancelled
      }
      if (userInput.trim()) {
        const reparsed = parseImportLine(userInput + ' ' + parsed.url);
        parsed.name = reparsed.name;
      }
    }
    
    // Calculate unlock time with stagger
    const unlockTime = new Date(state.startTime.getTime() + (state.stagger ? state.staggerIndex * state.staggerSeconds * 1000 : 0));
    state.staggerIndex++;
    
    await createImportSchedule(parsed, unlockTime, state);
    state.existingUrls.add(urlLower);
    state.created++;
  }
  
  // Import complete
  finishBulkImport();
}

async function createImportSchedule(parsed, unlockTime, state) {
  await chrome.runtime.sendMessage({
    action: 'createLock',
    lock: {
      url: parsed.url,
      name: parsed.name,
      category: state.category,
      unlockTime: unlockTime.toISOString(),
      recurring: state.recurring,
      repeatType: state.repeatType,
      playSound: state.playSound || false
    }
  });
}

function showDuplicateModal(parsed, existingLock, state) {
  return new Promise(async (resolve) => {
    const modal = document.getElementById('duplicateModal');
    const urlDisplay = document.getElementById('duplicateUrlDisplay');
    const existingInfo = document.getElementById('existingScheduleInfo');
    const nextTimeSpan = document.getElementById('nextAvailableTime');
    const customTimeInput = document.getElementById('duplicateCustomTime');
    
    // Display the duplicate URL
    urlDisplay.textContent = parsed.url;
    
    // Display existing schedule info
    const existingDate = new Date(existingLock.unlockTime);
    existingInfo.innerHTML = `
      <strong>${existingLock.name || 'Unnamed'}</strong><br>
      📅 Scheduled: ${existingDate.toLocaleString()}<br>
      ${existingLock.recurring ? '🔁 Recurring: ' + (existingLock.repeatType || 'Daily') : '📌 One-time'}
    `;
    
    // Find next available time slot
    const nextSlotResult = await chrome.runtime.sendMessage({
      action: 'findNextAvailableSlot',
      startTime: state.startTime.toISOString(),
      intervalMinutes: 1
    });
    
    const nextAvailableTime = new Date(nextSlotResult.time);
    nextTimeSpan.textContent = nextAvailableTime.toLocaleString();
    
    // Set custom time default to next available
    customTimeInput.value = formatDateTimeLocal(nextAvailableTime);
    
    // Show modal
    modal.classList.add('visible');
    
    // Set up button handlers
    const skipBtn = document.getElementById('duplicateSkipBtn');
    const skipAllBtn = document.getElementById('duplicateSkipAllBtn');
    const addNextBtn = document.getElementById('duplicateAddNextBtn');
    const addCustomBtn = document.getElementById('duplicateAddCustomBtn');
    const closeBtn = document.getElementById('duplicateModalClose');
    
    const cleanup = () => {
      modal.classList.remove('visible');
      skipBtn.replaceWith(skipBtn.cloneNode(true));
      skipAllBtn.replaceWith(skipAllBtn.cloneNode(true));
      addNextBtn.replaceWith(addNextBtn.cloneNode(true));
      addCustomBtn.replaceWith(addCustomBtn.cloneNode(true));
      closeBtn.replaceWith(closeBtn.cloneNode(true));
    };
    
    document.getElementById('duplicateSkipBtn').addEventListener('click', () => {
      cleanup();
      resolve({ action: 'skip' });
    });
    
    document.getElementById('duplicateSkipAllBtn').addEventListener('click', () => {
      cleanup();
      resolve({ action: 'skipAll' });
    });
    
    document.getElementById('duplicateAddNextBtn').addEventListener('click', () => {
      cleanup();
      resolve({ action: 'add', time: nextAvailableTime });
    });
    
    document.getElementById('duplicateAddCustomBtn').addEventListener('click', () => {
      const customTime = new Date(customTimeInput.value);
      cleanup();
      resolve({ action: 'add', time: customTime });
    });
    
    document.getElementById('duplicateModalClose').addEventListener('click', () => {
      cleanup();
      resolve({ action: 'skip' });
    });
  });
}

function finishBulkImport() {
  const state = duplicateImportState;
  
  let message = `Imported ${state.created} schedules`;
  if (state.skipped > 0) {
    message += ` (${state.skipped} duplicates skipped)`;
  }
  showToast(message);
  document.getElementById('bulkUrls').value = '';
  refreshData();
  switchView('schedules');
}

// Parse a line like "1/31 Flashlight https://example.com" into {name, url}
function parseImportLine(line) {
  // Find the URL in the line (starts with http:// or https://)
  const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
  if (!urlMatch) {
    return { url: null, name: '' };
  }
  
  const url = urlMatch[1];
  const beforeUrl = line.substring(0, line.indexOf(url)).trim();
  
  if (!beforeUrl) {
    // Just a URL, no name
    return { url, name: '' };
  }
  
  // Try to parse date from the beginning
  // Formats: 1/31, 01/31, 1-31, 01-31, 1/31/26, 1/31/2026
  const datePatterns = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s*/,  // M/D/YY or M/D/YYYY
    /^(\d{1,2})[\/\-](\d{1,2})\s*/,                   // M/D (assume current year)
  ];
  
  let expirationDate = null;
  let remainingText = beforeUrl;
  
  for (const pattern of datePatterns) {
    const match = beforeUrl.match(pattern);
    if (match) {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      let year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
      
      // Handle 2-digit year
      if (year < 100) {
        year += 2000;
      }
      
      // If the date is in the past (for current year), assume next year
      const testDate = new Date(year, month - 1, day);
      if (testDate < new Date() && !match[3]) {
        year++;
      }
      
      // Format as YYYY-MM-DD
      expirationDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      remainingText = beforeUrl.substring(match[0].length).trim();
      break;
    }
  }
  
  // Clean up remaining text (the name part)
  // Remove common separators at the start
  remainingText = remainingText.replace(/^[\-\:\$\#\@\!\*]+\s*/, '').trim();
  
  // Build the final name
  let name = '';
  if (expirationDate) {
    name = expirationDate;
    if (remainingText) {
      name += ' ' + remainingText;
    }
  } else {
    name = remainingText;
  }
  
  return { url, name };
}

async function setupBookmarkImport() {
  const select = document.getElementById('bookmarkFolder');
  
  try {
    const tree = await chrome.bookmarks.getTree();
    select.innerHTML = '<option value="">-- Select a folder --</option>';
    
    function addFolders(nodes, depth = 0) {
      for (const node of nodes) {
        if (node.children) {
          const option = document.createElement('option');
          option.value = node.id;
          option.textContent = '  '.repeat(depth) + (node.title || 'Bookmarks');
          select.appendChild(option);
          addFolders(node.children, depth + 1);
        }
      }
    }
    
    addFolders(tree);
  } catch (e) {
    console.error('Failed to load bookmarks:', e);
  }
  
  select.addEventListener('change', async () => {
    const folderId = select.value;
    const preview = document.getElementById('bookmarkPreview');
    const list = document.getElementById('bookmarkList');
    const count = document.getElementById('bookmarkCount');
    const btn = document.getElementById('bmImportBtn');
    
    if (!folderId) {
      preview.style.display = 'none';
      btn.disabled = true;
      return;
    }
    
    const bookmarks = await chrome.bookmarks.getChildren(folderId);
    const urls = bookmarks.filter(b => b.url);
    
    count.textContent = urls.length;
    list.innerHTML = urls.slice(0, 10).map(b => `<div>• ${b.title || b.url}</div>`).join('');
    if (urls.length > 10) list.innerHTML += `<div>... and ${urls.length - 10} more</div>`;
    
    preview.style.display = 'block';
    btn.disabled = urls.length === 0;
  });
}

async function bulkImportBookmarks() {
  // Check for premium access - bulk import is a premium feature
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  const folderId = document.getElementById('bookmarkFolder').value;
  if (!folderId) {
    showToast('Please select a bookmark folder');
    return;
  }
  
  const startTimeInput = document.getElementById('bmStartTime').value;
  if (!startTimeInput) {
    showToast('Please select a start time');
    return;
  }
  
  const category = document.getElementById('bmCategory').value || 'Daily';
  const startTime = new Date(startTimeInput);
  const stagger = document.getElementById('bmStagger').checked;
  const staggerSeconds = parseInt(document.getElementById('bmStaggerInterval').value) || 60;
  const recurring = document.getElementById('bmRecurring').checked;
  const repeatType = document.getElementById('bmRepeatType').value;
  const lockMinutes = parseInt(document.getElementById('bmLockMinutes').value);
  const color = document.getElementById('bmColor').value || null;
  const playSound = document.getElementById('bmPlaySound').checked;
  
  const bookmarks = await chrome.bookmarks.getChildren(folderId);
  const urls = bookmarks.filter(b => b.url);
  
  if (urls.length === 0) {
    showToast('No bookmarks found in this folder');
    return;
  }
  
  let created = 0;
  for (let i = 0; i < urls.length; i++) {
    const b = urls[i];
    // Stagger in milliseconds (staggerSeconds * 1000)
    const unlockTime = new Date(startTime.getTime() + (stagger ? i * staggerSeconds * 1000 : 0));
    
    await chrome.runtime.sendMessage({
      action: 'createLock',
      lock: {
        url: b.url,
        name: b.title || '',
        category,
        unlockTime: unlockTime.toISOString(),
        recurring,
        repeatType: repeatType,
        lockMinutes: lockMinutes,
        color: color,
        playSound: playSound
      }
    });
    created++;
  }
  
  showToast(`Imported ${created} bookmarks`);
  await refreshData();
  switchView('schedules');
}

// ============================================
// EXPORT/IMPORT
// ============================================

async function exportAllData() {
  const data = await chrome.runtime.sendMessage({ action: 'exportLocks' });
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tabtimer-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Backup exported');
}

async function importBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    await chrome.runtime.sendMessage({ action: 'importFullBackup', data });
    showToast('Backup restored');
    await refreshData();
    
    // Re-check license status after import (trial info may have been restored)
    await checkLicense();
    showLicenseStatus();
    updateLicenseModal();
    applyPremiumState();
    
    // Notify user if their trial status was restored
    if (data.license && data.license.trialStarted) {
      const trialEnd = data.license.trialStarted + (data.license.trialDays || 7) * 24 * 60 * 60 * 1000;
      if (Date.now() >= trialEnd) {
        showToast('📋 Your previous trial period was restored from backup.');
      }
    }
  } catch (err) {
    showToast('Failed to import: ' + err.message);
  }
  
  e.target.value = '';
}

// ============================================
// SETTINGS
// ============================================

async function saveSettings() {
  currentSettings.notificationsEnabled = document.getElementById('settingNotifications').checked;
  currentSettings.notificationSeconds = parseInt(document.getElementById('settingNotifyMinutes').value);
  currentSettings.autoDeleteExpired = document.getElementById('settingAutoDelete').checked;
  currentSettings.openInBackground = document.getElementById('settingOpenBackground').checked;
  currentSettings.gracePeriodMinutes = parseInt(document.getElementById('settingGracePeriod').value);
  currentSettings.missedTabStaggerSeconds = parseInt(document.getElementById('settingMissedTabStagger').value);
  currentSettings.defaultCategory = document.getElementById('settingDefaultCategory').value;
  currentSettings.defaultLockMinutes = parseInt(document.getElementById('settingDefaultLockMinutes').value);
  currentSettings.timezone = document.getElementById('settingTimezone').value;
  currentSettings.expirationTime = document.getElementById('settingExpirationTime').value;
  
  await chrome.runtime.sendMessage({ action: 'updateSettings', settings: currentSettings });

  // Save the "show how it works" notice preference
  const showCb = document.getElementById('settingShowHowItWorks');
  if (showCb) {
    const hide = !showCb.checked;
    chrome.storage.local.set({ hideHowItWorksNotice: hide });
    // Show or hide the notice immediately based on the new setting
    const noticeEl = document.getElementById('tabtimer-how-it-works');
    if (noticeEl) noticeEl.style.display = hide ? 'none' : 'flex';
  }

  showToast('Settings saved');
}

function testNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'TabTimer Test',
    message: 'This is a test notification!'
  });
}

async function repairSchedules() {
  showToast('🔧 Repairing stuck schedules...');
  try {
    // Do the repair directly in the options page context
    const result = await chrome.storage.local.get(['locks']);
    const locks = result.locks || [];
    const now = Date.now();
    let repaired = 0;
    
    for (const lock of locks) {
      const unlockTime = new Date(lock.unlockTime).getTime();
      
      // Fix 1: If unlock time is in the FUTURE but marked as opened or manually unlocked, reset it
      if (unlockTime > now && (lock.opened || lock.manuallyUnlocked)) {
        lock.opened = false;
        lock.manuallyUnlocked = false;
        lock.autoRelockAt = null;
        repaired++;
        console.log(`Fixed future schedule marked as opened/unlocked: ${lock.name}`);
      }
      
      // Fix 2: If recurring and unlock time is in the PAST, calculate next future time
      if (lock.recurring && unlockTime < now) {
        let nextTime = new Date(lock.unlockTime);
        let safetyCounter = 0;
        while (nextTime.getTime() <= now && safetyCounter < 365) {
          nextTime.setDate(nextTime.getDate() + 1); // Add 1 day for daily
          safetyCounter++;
        }
        lock.unlockTime = nextTime.toISOString();
        lock.opened = false;
        lock.manuallyUnlocked = false;
        lock.autoRelockAt = null;
        repaired++;
        console.log(`Fixed past schedule: ${lock.name} -> ${nextTime}`);
      }
    }
    
    if (repaired > 0) {
      await chrome.storage.local.set({ locks });
      await refreshData();
      showToast(`✅ Repaired ${repaired} schedules! Check the list for updated times.`);
    } else {
      showToast('ℹ️ No stuck schedules found - all schedules are up to date.');
    }
  } catch (error) {
    showToast('Error repairing schedules: ' + error.message);
    console.error('Repair error:', error);
  }
}

function updateLicenseModal() {
  const statusBox = document.getElementById('licenseStatusBox');
  const freeSection = document.getElementById('freeUserSection');
  const upgradeSection = document.getElementById('upgradeSection');
  const licenseKeySection = document.getElementById('licenseKeySection');
  const premiumSection = document.getElementById('premiumUserSection');
  
  // Hide all sections first
  freeSection.style.display = 'none';
  upgradeSection.style.display = 'none';
  licenseKeySection.style.display = 'none';
  premiumSection.style.display = 'none';
  
  switch(licenseStatus.status) {
    case 'premium':
      statusBox.innerHTML = '<div style="color: #22c55e; font-weight: 600; font-size: 16px;">✅ Premium License Active</div>';
      premiumSection.style.display = 'block';
      break;
      
    case 'trial':
      statusBox.innerHTML = `<div style="color: #f59e0b; font-weight: 600; font-size: 16px;">⏳ Trial Active: ${licenseStatus.daysLeft} days remaining</div><p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Enjoying premium features? Upgrade to keep them forever!</p>`;
      upgradeSection.style.display = 'block';
      licenseKeySection.style.display = 'block';
      break;
      
    case 'trialExpired':
      statusBox.innerHTML = '<div style="color: #ef4444; font-weight: 600; font-size: 16px;">⏰ Trial Expired</div><p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Your 7-day free trial has ended. Free features still work! Upgrade to Premium for just $10 to unlock all features forever.</p>';
      upgradeSection.style.display = 'block';
      licenseKeySection.style.display = 'block';
      break;
      
    case 'free':
    default:
      statusBox.innerHTML = '<div style="color: #6366f1; font-weight: 600; font-size: 16px;">🆓 Free Version</div><p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">You\'re using the free version. Try Premium free for 7 days!</p>';
      freeSection.style.display = 'block';
      licenseKeySection.style.display = 'block';
      break;
  }
}

// ============================================
// AUTO-BACKUP
// ============================================

async function loadAutoBackupStatus() {
  const result = await chrome.storage.local.get(['autoBackupEnabled', 'autoBackupFrequency', 'autoBackupKeep', 'lastAutoBackup']);
  
  document.getElementById('autoBackupEnabled').checked = result.autoBackupEnabled || false;
  document.getElementById('autoBackupFrequency').value = result.autoBackupFrequency || 'daily';
  document.getElementById('autoBackupKeep').value = result.autoBackupKeep || 5;
  
  updateAutoBackupStatusDisplay(result.autoBackupEnabled, result.lastAutoBackup);
}

function updateAutoBackupStatusDisplay(enabled, lastBackup) {
  const statusText = document.getElementById('autoBackupStatusText');
  
  if (enabled) {
    if (lastBackup) {
      const date = new Date(lastBackup);
      statusText.innerHTML = `✅ Auto-backup enabled. Last backup: ${date.toLocaleString()}`;
    } else {
      statusText.innerHTML = '✅ Auto-backup enabled. No backups yet.';
    }
    statusText.style.color = '#22c55e';
  } else {
    statusText.innerHTML = '⚪ Auto-backup disabled';
    statusText.style.color = 'var(--text-muted)';
  }
}

async function toggleAutoBackup(e) {
  const enabled = e.target.checked;
  await chrome.storage.local.set({ autoBackupEnabled: enabled });
  
  if (enabled) {
    // Create initial backup
    await createAutoBackup();
    showToast('Auto-backup enabled! First backup created.');
  } else {
    showToast('Auto-backup disabled');
  }
  
  loadAutoBackupStatus();
}

async function saveAutoBackupSettings() {
  await chrome.storage.local.set({
    autoBackupFrequency: document.getElementById('autoBackupFrequency').value,
    autoBackupKeep: parseInt(document.getElementById('autoBackupKeep').value)
  });
}

async function createAutoBackup() {
  const result = await chrome.storage.local.get(['locks', 'categories', 'folders', 'settings', 'savedBackups', 'autoBackupKeep']);
  
  const backup = {
    timestamp: new Date().toISOString(),
    locks: result.locks || [],
    categories: result.categories || [],
    folders: result.folders || [],
    settings: result.settings || {}
  };
  
  let savedBackups = result.savedBackups || [];
  savedBackups.unshift(backup);
  
  // Keep only the specified number of backups
  const keepCount = result.autoBackupKeep || 5;
  savedBackups = savedBackups.slice(0, keepCount);
  
  await chrome.storage.local.set({ 
    savedBackups,
    lastAutoBackup: backup.timestamp
  });
}

async function viewBackups() {
  const result = await chrome.storage.local.get(['savedBackups']);
  const backups = result.savedBackups || [];
  
  const container = document.getElementById('backupsList');
  
  if (backups.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No saved backups yet.</p>';
  } else {
    container.innerHTML = backups.map((backup, index) => {
      const date = new Date(backup.timestamp);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg); border-radius: 8px; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 500;">${date.toLocaleString()}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${backup.locks?.length || 0} schedules</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm download-backup-btn" data-index="${index}">💾 Download</button>
            <button class="btn btn-secondary btn-sm restore-backup-btn" data-index="${index}">🔄 Restore</button>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.download-backup-btn').forEach(btn => {
      btn.addEventListener('click', () => downloadBackup(parseInt(btn.dataset.index)));
    });
    
    container.querySelectorAll('.restore-backup-btn').forEach(btn => {
      btn.addEventListener('click', () => restoreBackup(parseInt(btn.dataset.index)));
    });
  }
  
  document.getElementById('backupsModal').classList.add('visible');
}

async function downloadBackup(index) {
  const result = await chrome.storage.local.get(['savedBackups']);
  const backup = result.savedBackups[index];
  
  if (!backup) return;
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tabtimer-backup-${backup.timestamp.split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Backup downloaded');
}

async function restoreBackup(index) {
  const result = await chrome.storage.local.get(['savedBackups']);
  const backup = result.savedBackups[index];
  
  if (!backup) return;
  
  if (!confirm(`Restore backup from ${new Date(backup.timestamp).toLocaleString()}? This will replace your current data.`)) return;
  
  await chrome.runtime.sendMessage({ action: 'importFullBackup', data: backup });
  showToast('Backup restored!');
  document.getElementById('backupsModal').classList.remove('visible');
  await refreshData();
}

async function clearAllBackups() {
  if (!confirm('Delete all saved backups? This cannot be undone.')) return;
  
  await chrome.storage.local.set({ savedBackups: [] });
  showToast('All backups cleared');
  viewBackups(); // Refresh the list
}

// ============================================
// UTILITIES
// ============================================

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ============================================
// CSV/EXCEL IMPORT
// ============================================

let csvParsedData = [];

function setupCsvImport() {
  const dropZone = document.getElementById('csvDropZone');
  const fileInput = document.getElementById('csvFileInput');
  const clearBtn = document.getElementById('csvClearFile');
  const importBtn = document.getElementById('csvImportBtn');
  const templateLink = document.getElementById('downloadCsvTemplate');
  
  // Click to browse
  dropZone.addEventListener('click', () => fileInput.click());
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleCsvFile(e.target.files[0]);
    }
  });
  
  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleCsvFile(e.dataTransfer.files[0]);
    }
  });
  
  // Clear file
  clearBtn.addEventListener('click', () => {
    fileInput.value = '';
    csvParsedData = [];
    document.getElementById('csvFileName').style.display = 'none';
    document.getElementById('csvPreview').style.display = 'none';
    importBtn.disabled = true;
  });
  
  // Import button
  importBtn.addEventListener('click', importCsvData);
  
  // Download template
  templateLink.addEventListener('click', (e) => {
    e.preventDefault();
    downloadCsvTemplate();
  });
  
  // Set default start time
  const csvStartTime = document.getElementById('csvStartTime');
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  now.setSeconds(0);
  csvStartTime.value = formatDateTimeLocal(now);
}

function handleCsvFile(file) {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    parseCsvFile(file);
    document.getElementById('csvFileNameText').textContent = `📄 ${file.name}`;
    document.getElementById('csvFileName').style.display = 'block';
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    parseExcelFile(file);
    document.getElementById('csvFileNameText').textContent = `📄 ${file.name}`;
    document.getElementById('csvFileName').style.display = 'block';
  } else {
    showToast('Please upload a CSV or Excel file');
    return;
  }
}

function parseCsvFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const rows = parseCSV(text);
    processParsedData(rows);
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
}

async function parseExcelFile(file) {
  // Use the bundled XLSX parser
  if (typeof XLSX === 'undefined') {
    showToast('Excel parser not loaded. Please try again or use CSV format.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        showToast('No sheets found in Excel file');
        return;
      }
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      
      // Convert to array of arrays
      const rows = Array.isArray(sheet) ? sheet : XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (!rows || rows.length === 0) {
        showToast('No data found in Excel file');
        return;
      }
      
      processParsedData(rows);
    } catch (err) {
      console.error('Excel parsing error:', err);
      showToast('Error parsing Excel file: ' + err.message);
    }
  };
  reader.onerror = () => {
    showToast('Error reading file');
  };
  reader.readAsArrayBuffer(file);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Convert Excel decimal time serial (e.g. 0.354166...) to HH:MM:SS string
function excelTimeToString(val) {
  const num = parseFloat(val);
  if (isNaN(num) || num < 0 || num >= 1) return null;
  const totalSeconds = Math.round(num * 86400);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

// Convert Excel date serial number (e.g. 45717) to YYYY-MM-DD string
function excelDateToString(val) {
  const num = parseInt(val);
  if (isNaN(num) || num < 1) return null;
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + num * 86400000);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return y + '-' + mo + '-' + d;
}

function processParsedData(rows) {
  if (rows.length < 1) {
    showToast('File is empty');
    return;
  }

  // Check if first row looks like headers or data
  const firstRow = rows[0].map(cell => String(cell || '').toLowerCase().trim());
  const hasHeaderRow = firstRow.some(cell =>
    ['url', 'name', 'category', 'time', 'date', 'recurring', 'repeat', 'notes'].includes(cell)
  );

  let headers;
  let dataRows;

  if (hasHeaderRow) {
    headers = firstRow;
    dataRows = rows.slice(1);
  } else {
    const firstCell = String(rows[0][0] || '').trim();
    if (firstCell.includes('.') || firstCell.startsWith('http')) {
      headers = ['url'];
      dataRows = rows;
    } else {
      showToast('File must have a "url" column header, or contain URLs in the first column');
      return;
    }
  }

  const urlIndex = headers.indexOf('url');
  if (urlIndex === -1) {
    headers[0] = 'url';
  }

  const finalUrlIndex = headers.indexOf('url');
  const timeIndex = headers.indexOf('time');
  const dateIndex = headers.indexOf('date');

  // Parse data rows
  csvParsedData = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length === 0) continue;

    let urlValue = String(row[finalUrlIndex] || '').trim();

    // Skip empty URLs
    if (!urlValue) continue;

    // Skip placeholder/example rows from old templates
    if (urlValue.toLowerCase().includes('example.com')) continue;

    // Add https:// if no protocol specified
    if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://')) {
      if (urlValue.includes('.')) {
        urlValue = 'https://' + urlValue;
      } else {
        continue;
      }
    }

    const item = { url: urlValue };

    // Map other columns, converting Excel serial values as needed
    headers.forEach(function(header, idx) {
      if (idx !== finalUrlIndex && row[idx] !== undefined && row[idx] !== '') {
        let cellVal = String(row[idx]).trim();

        // Convert Excel decimal time serial (0.0 - 0.9999) to HH:MM:SS
        if (idx === timeIndex) {
          const asNum = parseFloat(cellVal);
          if (!isNaN(asNum) && asNum > 0 && asNum < 1) {
            const converted = excelTimeToString(asNum);
            if (converted) cellVal = converted;
          }
        }

        // Convert Excel date serial number to YYYY-MM-DD
        if (idx === dateIndex) {
          const asNum = parseFloat(cellVal);
          if (!isNaN(asNum) && asNum > 1000 && cellVal.indexOf('-') === -1) {
            const converted = excelDateToString(asNum);
            if (converted) cellVal = converted;
          }
        }

        item[header] = cellVal;
      }
    });

    csvParsedData.push(item);
  }
  
  if (csvParsedData.length === 0) {
    showToast('No valid URLs found in file');
    return;
  }
  
  // Show preview
  showCsvPreview(headers, dataRows.slice(0, 5)); // Show first 5 rows
  document.getElementById('csvRowCount').textContent = csvParsedData.length;
  document.getElementById('csvPreview').style.display = 'block';
  document.getElementById('csvImportBtn').disabled = false;
  
  showToast(`Found ${csvParsedData.length} URLs to import`);
}

function showCsvPreview(headers, rows) {
  const thead = document.getElementById('csvPreviewHead');
  const tbody = document.getElementById('csvPreviewBody');
  
  // Header row
  thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  
  // Data rows
  tbody.innerHTML = rows.map(row => {
    return '<tr>' + headers.map((_, idx) => `<td>${row[idx] || ''}</td>`).join('') + '</tr>';
  }).join('');
}

async function importCsvData() {
  if (!isPremiumFeature()) {
    showPremiumPrompt();
    return;
  }
  
  if (csvParsedData.length === 0) {
    showToast('No data to import');
    return;
  }
  
  const defaultCategory = document.getElementById('csvCategory').value || 'Daily';
  const defaultStartTime = new Date(document.getElementById('csvStartTime').value);
  const stagger = document.getElementById('csvStagger').checked;
  const staggerInterval = parseInt(document.getElementById('csvStaggerInterval').value) * 1000;
  const defaultRecurring = document.getElementById('csvRecurring').checked;
  const defaultRepeatType = document.getElementById('csvRepeatType').value;
  const playSound = document.getElementById('csvPlaySound').checked;
  
  // Get the "Apply to All" fields
  const expirationDate = document.getElementById('csvExpirationDate').value; // YYYY-MM-DD or empty
  const namePrefix = document.getElementById('csvNamePrefix').value.trim();
  
  let imported = 0;
  let currentTime = defaultStartTime.getTime();
  
  for (const item of csvParsedData) {
    // Determine time for this schedule
    let scheduleTime;
    if (item.date && item.time) {
      scheduleTime = new Date(`${item.date}T${item.time}`);
    } else if (item.time) {
      // Use time with today's date or default date
      const timeParts = item.time.split(':');
      scheduleTime = new Date(defaultStartTime);
      scheduleTime.setHours(parseInt(timeParts[0]) || 0);
      scheduleTime.setMinutes(parseInt(timeParts[1]) || 0);
      scheduleTime.setSeconds(parseInt(timeParts[2]) || 0);
    } else if (item.date) {
      scheduleTime = new Date(`${item.date}T${defaultStartTime.toTimeString().slice(0, 8)}`);
    } else {
      scheduleTime = new Date(currentTime);
      if (stagger) {
        currentTime += staggerInterval;
      }
    }
    
    // Determine recurring
    const isRecurring = item.recurring !== undefined 
      ? (item.recurring === 'true' || item.recurring === '1' || item.recurring === 'yes')
      : defaultRecurring;
    
    // Determine repeat type
    const repeatType = item.repeat || defaultRepeatType;
    
    // Build the schedule name
    let scheduleName = item.name || namePrefix || '';
    
    // Add expiration date prefix if set
    if (expirationDate) {
      scheduleName = expirationDate + (scheduleName ? ' ' + scheduleName : '');
    }
    
    try {
      await chrome.runtime.sendMessage({
        action: 'createLock',
        lock: {
          url: item.url,
          name: scheduleName,
          category: item.category || defaultCategory,
          unlockTime: scheduleTime.toISOString(),
          recurring: isRecurring,
          repeatType: repeatType,
          lockMinutes: 0,
          playSound: playSound,
          notes: item.notes || ''
        }
      });
      imported++;
    } catch (err) {
      console.error('Error importing:', item.url, err);
    }
  }
  
  showToast(`✅ Imported ${imported} schedules from file`);
  
  // Clear and refresh
  document.getElementById('csvFileInput').value = '';
  csvParsedData = [];
  document.getElementById('csvFileName').style.display = 'none';
  document.getElementById('csvPreview').style.display = 'none';
  document.getElementById('csvImportBtn').disabled = true;
  document.getElementById('csvExpirationDate').value = '';
  document.getElementById('csvNamePrefix').value = '';
  
  await refreshData();
}

function downloadCsvTemplate() {
  const template = `url,name,category,time,date,recurring,repeat,notes
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,
,,,,,,,`;

  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tabtimer-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Template downloaded!');
}
