// options.js - TabTimer Premium v2.0.0

let locks = [];
let categories = [];
let folders = [];
let selectedIds = new Set();
let currentSettings = {};
let currentView = 'schedules';
let currentFilter = null;
let currentFolder = null;
let licenseStatus = { valid: false, trial: false, expired: false };

// ============================================
// HELPER FUNCTIONS
// ============================================

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
  const keyPattern = /^TABTIMER-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(key.toUpperCase())) {
    return { valid: false, error: 'Invalid license key format' };
  }
  
  const keyParts = key.toUpperCase().split('-');
  const checksum = keyParts[1].charCodeAt(0) + keyParts[2].charCodeAt(0) + keyParts[3].charCodeAt(0);
  
  if (checksum % 3 === 0 || key.toUpperCase() === 'TABTIMER-TEST-DEMO-KEY1') {
    const result = await chrome.storage.local.get(['license']);
    const license = result.license || {};
    license.key = key.toUpperCase();
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

function loadSettingsIntoForm() {
  // Populate settings form with current values
  if (document.getElementById('settingNotifications')) {
    document.getElementById('settingNotifications').checked = currentSettings.notificationsEnabled !== false;
  }
  if (document.getElementById('settingNotifyMinutes')) {
    document.getElementById('settingNotifyMinutes').value = currentSettings.notificationMinutes || 5;
  }
  if (document.getElementById('settingAutoDelete')) {
    document.getElementById('settingAutoDelete').checked = currentSettings.autoDeleteExpired !== false;
  }
  if (document.getElementById('settingOpenBackground')) {
    document.getElementById('settingOpenBackground').checked = currentSettings.openInBackground !== false;
  }
  if (document.getElementById('settingDefaultLockMinutes')) {
    document.getElementById('settingDefaultLockMinutes').value = currentSettings.defaultLockMinutes || 5;
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

function updateStats() {
  document.getElementById('statTotal').textContent = locks.length;
  document.getElementById('statActive').textContent = locks.filter(l => !l.opened && !l.manuallyUnlocked).length;
  document.getElementById('statRecurring').textContent = locks.filter(l => l.recurring).length;
  document.getElementById('statTotalOpens').textContent = locks.reduce((sum, l) => sum + (l.openCount || 0), 0);
  
  document.getElementById('totalCount').textContent = locks.length;
  document.getElementById('activeCount').textContent = locks.filter(l => !l.opened && !l.manuallyUnlocked).length;
  document.getElementById('recurringCount').textContent = locks.filter(l => l.recurring).length;
  
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
    
    // Quick filters
    if (currentFilter === 'active' && (lock.opened || lock.manuallyUnlocked)) return false;
    if (currentFilter === 'recurring' && !lock.recurring) return false;
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
    return;
  }
  
  container.innerHTML = filteredLocks.map(lock => {
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
      <div class="schedule-item ${isSelected ? 'selected' : ''} ${isOpened ? 'opened' : ''}" data-id="${lock.id}">
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
            <span>🔓 Re-lock: ${lock.lockMinutes || 5}min</span>
            ${lock.openCount ? `<span>📊 ${lock.openCount}x</span>` : ''}
            ${lock.recurring ? `<span>🔄 ${getRepeatDescription(lock)}</span>` : ''}
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn btn-sm btn-icon btn-outline duplicate-btn" data-id="${lock.id}" title="Duplicate">📋</button>
          <button class="btn btn-sm btn-icon btn-outline edit-btn" data-id="${lock.id}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-icon btn-danger delete-btn" data-id="${lock.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners
  container.querySelectorAll('.schedule-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.closest('.schedule-item').dataset.id;
      if (e.target.checked) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }
      updateBulkActions();
      renderSchedules();
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
}

function populateCategoryDropdowns() {
  // Use default categories if none loaded
  const cats = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  
  const selects = ['newCategory', 'bulkCategory', 'bmCategory', 'editCategory', 'categoryFilter', 'settingDefaultCategory'];
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
    } else if (id === 'newCategory' || id === 'bulkCategory' || id === 'bmCategory') {
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
  
  // Bulk actions
  document.getElementById('bulkShiftTimeBtn').addEventListener('click', () => {
    document.getElementById('shiftTimeModal').classList.add('visible');
  });
  document.getElementById('bulkDeleteBtn').addEventListener('click', bulkDelete);
  document.getElementById('bulkDuplicateBtn').addEventListener('click', bulkDuplicate);
  document.getElementById('bulkOpenAllBtn').addEventListener('click', bulkOpenAll);
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
    
    // Escape - Close modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.visible').forEach(m => m.classList.remove('visible'));
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
  try {
    const result = await chrome.runtime.sendMessage({ action: 'duplicateLock', id });
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

function openEditModal(id) {
  const lock = locks.find(l => l.id === id);
  if (!lock) return;
  
  document.getElementById('editId').value = id;
  document.getElementById('editUrl').value = lock.url;
  document.getElementById('editName').value = lock.name || '';
  document.getElementById('editCategory').value = lock.category || '';
  document.getElementById('editFolder').value = lock.folder || 'default';
  document.getElementById('editDatetime').value = new Date(lock.unlockTime).toISOString().slice(0, 19);
  document.getElementById('editRecurring').checked = lock.recurring;
  document.getElementById('editRepeatType').value = lock.repeatType || 'daily';
  document.getElementById('editLockMinutes').value = lock.lockMinutes || 5;
  
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

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const repeatType = document.getElementById('editRepeatType').value;
  const autoClose = document.getElementById('editAutoClose').checked;
  
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
        unlockTime: new Date(document.getElementById('editDatetime').value).toISOString(),
        recurring: document.getElementById('editRecurring').checked,
        repeatType: repeatType,
        lockMinutes: parseInt(document.getElementById('editLockMinutes').value) || 5,
        minuteInterval,
        hourlyInterval,
        customDays,
        autoClose,
        autoCloseMinutes: autoClose ? parseInt(document.getElementById('editAutoCloseMinutes').value) : 0
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

// ============================================
// BULK IMPORT
// ============================================

async function bulkImportText() {
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
  
  const category = document.getElementById('bulkCategory').value || 'Daily';
  const startTime = new Date(startTimeInput);
  const stagger = document.getElementById('bulkStagger').checked;
  const staggerSeconds = parseInt(document.getElementById('bulkStaggerInterval').value) || 60;
  const recurring = document.getElementById('bulkRecurring').checked;
  const repeatType = document.getElementById('bulkRepeatType').value;
  
  // Get existing URLs to check for duplicates
  const existingUrls = new Set(locks.map(l => l.url.toLowerCase()));
  
  let created = 0;
  let skipped = 0;
  let staggerIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse the line - could be:
    // 1. Just a URL: https://example.com
    // 2. Date + Name + URL: 1/31 Flashlight https://example.com
    // 3. Date + URL: 1/31 https://example.com
    // 4. Name + URL: Flashlight https://example.com
    
    let parsed = parseImportLine(line);
    
    if (!parsed.url) {
      continue; // Skip lines without valid URLs
    }
    
    // Check for duplicate URL
    if (existingUrls.has(parsed.url.toLowerCase())) {
      skipped++;
      continue;
    }
    
    // If no name was parsed, prompt the user
    if (!parsed.name) {
      const userInput = prompt(`Enter expiration date and name for:\n${parsed.url}\n\nFormat: MM/DD Name (e.g., "1/31 Flashlight")\nOr just a name, or leave blank:`);
      if (userInput === null) {
        // User cancelled - skip this URL
        continue;
      }
      if (userInput.trim()) {
        // Re-parse with user input
        const reparsed = parseImportLine(userInput + ' ' + parsed.url);
        parsed.name = reparsed.name;
      }
    }
    
    // Stagger in milliseconds (staggerSeconds * 1000)
    const unlockTime = new Date(startTime.getTime() + (stagger ? staggerIndex * staggerSeconds * 1000 : 0));
    staggerIndex++;
    
    await chrome.runtime.sendMessage({
      action: 'createLock',
      lock: {
        url: parsed.url,
        name: parsed.name,
        category,
        unlockTime: unlockTime.toISOString(),
        recurring,
        repeatType: repeatType
      }
    });
    
    // Add to existing URLs to prevent duplicates within same import
    existingUrls.add(parsed.url.toLowerCase());
    created++;
  }
  
  let message = `Imported ${created} schedules`;
  if (skipped > 0) {
    message += ` (${skipped} duplicates skipped)`;
  }
  showToast(message);
  document.getElementById('bulkUrls').value = '';
  await refreshData();
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
        repeatType: repeatType
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
  currentSettings.notificationMinutes = parseInt(document.getElementById('settingNotifyMinutes').value);
  currentSettings.autoDeleteExpired = document.getElementById('settingAutoDelete').checked;
  currentSettings.openInBackground = document.getElementById('settingOpenBackground').checked;
  currentSettings.defaultCategory = document.getElementById('settingDefaultCategory').value;
  currentSettings.defaultLockMinutes = parseInt(document.getElementById('settingDefaultLockMinutes').value);
  currentSettings.timezone = document.getElementById('settingTimezone').value;
  currentSettings.expirationTime = document.getElementById('settingExpirationTime').value;
  
  await chrome.runtime.sendMessage({ action: 'updateSettings', settings: currentSettings });
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
      statusBox.innerHTML = '<div style="color: #ef4444; font-weight: 600; font-size: 16px;">⏰ Trial Expired</div><p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Your trial has ended. Free features still work! Upgrade to unlock premium features.</p>';
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
