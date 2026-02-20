// service_worker.js - TabTimer Premium v2.3.0
// Smart Website Scheduler with Advanced Features

// ============================================
// OFFSCREEN DOCUMENT FOR SOUND
// ============================================

let creatingOffscreen = null;

async function setupOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  
  if (existingContexts.length > 0) {
    return; // Already exists
  }
  
  // Avoid race condition by checking if we're already creating
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  
  creatingOffscreen = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play notification sound when scheduled tabs open'
  });
  
  await creatingOffscreen;
  creatingOffscreen = null;
}

async function playNotificationSound() {
  try {
    await setupOffscreenDocument();
    await chrome.runtime.sendMessage({ action: 'playNotificationSound' });
  } catch (e) {
    console.log('TabTimer: Could not play sound via offscreen:', e);
  }
}

// ============================================
// INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener(() => {
  console.log('TabTimer Premium v2.3 installed');
  
  // Create context menus
  createContextMenus();
  
  // Initialize storage with defaults
  initializeStorage();
  
  // Start the alarm checker
  ensureAlarmExists();
  
  // Repair any stuck schedules
  setTimeout(() => repairStuckSchedules(), 1000);
});

// CRITICAL: Also start alarm when Chrome starts up
chrome.runtime.onStartup.addListener(() => {
  console.log('TabTimer: Chrome started, ensuring alarms exist');
  ensureAlarmExists();
  // Run comprehensive health check
  runScheduleHealthCheck();
});

// Ensure alarm exists - called on install, startup, and periodically
async function ensureAlarmExists() {
  const alarm = await chrome.alarms.get('checkLocks');
  if (!alarm) {
    console.log('TabTimer: Creating checkLocks alarm');
    chrome.alarms.create('checkLocks', { periodInMinutes: 0.1 }); // Check every 6 seconds
  }
  
  const backupAlarm = await chrome.alarms.get('autoBackup');
  if (!backupAlarm) {
    chrome.alarms.create('autoBackup', { periodInMinutes: 60 });
  }
}

// ============================================
// SCHEDULE HEALTH CHECK
// ============================================

async function runScheduleHealthCheck() {
  console.log('TabTimer: Running comprehensive health check...');
  const result = await chrome.storage.local.get(['locks', 'settings']);
  let locks = result.locks || [];
  const settings = result.settings || {};
  const now = Date.now();
  
  let issues = {
    stuckRecurring: 0,
    orphanedAlarms: 0,
    invalidUrls: 0,
    duplicateIds: 0,
    missingFields: 0,
    fixedOpened: 0
  };
  
  // Check 1: Find and remove duplicate IDs
  const seenIds = new Set();
  const uniqueLocks = [];
  for (const lock of locks) {
    if (!seenIds.has(lock.id)) {
      seenIds.add(lock.id);
      uniqueLocks.push(lock);
    } else {
      issues.duplicateIds++;
      console.log(`Health Check: Removing duplicate ID ${lock.id}`);
    }
  }
  locks = uniqueLocks;
  
  // Check 2: Fix missing required fields
  for (const lock of locks) {
    let fixed = false;
    
    if (!lock.id) {
      lock.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      fixed = true;
    }
    if (!lock.url) {
      issues.invalidUrls++;
      continue;
    }
    if (!lock.category) {
      lock.category = 'Other';
      fixed = true;
    }
    if (lock.recurring === undefined) {
      lock.recurring = false;
      fixed = true;
    }
    if (lock.opened === undefined) {
      lock.opened = false;
      fixed = true;
    }
    if (lock.lockMinutes === undefined) {
      lock.lockMinutes = 5;
      fixed = true;
    }
    
    if (fixed) issues.missingFields++;
  }
  
  // Check 3: Fix stuck recurring schedules with past times
  for (const lock of locks) {
    if (lock.recurring) {
      const unlockTime = new Date(lock.unlockTime).getTime();
      
      if (unlockTime < now) {
        let nextUnlock = new Date(lock.unlockTime);
        let safetyCounter = 0;
        
        while (nextUnlock.getTime() <= now && safetyCounter < 365) {
          const tempLock = { ...lock, unlockTime: nextUnlock.toISOString() };
          nextUnlock = calculateNextUnlockTime(tempLock);
          safetyCounter++;
        }
        
        console.log(`Health Check: Repairing stuck schedule "${lock.name || lock.url}"`);
        lock.unlockTime = nextUnlock.toISOString();
        lock.opened = false;
        lock.autoRelockAt = null;
        lock.manuallyUnlocked = false;
        issues.stuckRecurring++;
      }
    }
  }
  
  // Check 4: Fix non-recurring schedules marked opened but with future times
  for (const lock of locks) {
    if (!lock.recurring && lock.opened) {
      const unlockTime = new Date(lock.unlockTime).getTime();
      if (unlockTime > now) {
        console.log(`Health Check: Fixing incorrectly marked opened schedule "${lock.name || lock.url}"`);
        lock.opened = false;
        issues.fixedOpened++;
      }
    }
  }
  
  // Check 5: Clean up orphaned alarms
  const allAlarms = await chrome.alarms.getAll();
  for (const alarm of allAlarms) {
    if (alarm.name.startsWith('autoclose-')) {
      // Check if the tab still exists
      const tabId = parseInt(alarm.name.replace('autoclose-', ''));
      try {
        await chrome.tabs.get(tabId);
      } catch {
        // Tab doesn't exist, clear the alarm
        await chrome.alarms.clear(alarm.name);
        issues.orphanedAlarms++;
        console.log(`Health Check: Cleared orphaned alarm ${alarm.name}`);
      }
    }
  }
  
  // Filter out invalid URLs
  locks = locks.filter(l => l.url);
  
  // Save if any changes were made
  const totalIssues = Object.values(issues).reduce((a, b) => a + b, 0);
  if (totalIssues > 0) {
    await chrome.storage.local.set({ locks });
    
    // Store health check report
    const healthReport = {
      timestamp: new Date().toISOString(),
      issues,
      totalFixed: totalIssues
    };
    await chrome.storage.local.set({ lastHealthCheck: healthReport });
    
    console.log('TabTimer Health Check Complete:', issues);
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer Health Check',
      message: `Fixed ${totalIssues} issues: ${issues.stuckRecurring} stuck schedules, ${issues.duplicateIds} duplicates, ${issues.orphanedAlarms} orphaned alarms`,
      priority: 2
    });
  } else {
    console.log('TabTimer Health Check: All schedules healthy!');
  }
  
  return { success: true, issues, totalFixed: totalIssues };
}

// Legacy function - now calls the comprehensive health check
async function repairStuckSchedules() {
  return runScheduleHealthCheck();
}

function createContextMenus() {
  // Clear existing menus first
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'tabtimer-parent',
      title: '🕐 TabTimer',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'lock-page',
      parentId: 'tabtimer-parent',
      title: '📅 Schedule this page (Alt+L)',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'quick-schedule-tomorrow',
      parentId: 'tabtimer-parent',
      title: '⚡ Quick: Tomorrow 7:00 AM',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'quick-schedule-1hour',
      parentId: 'tabtimer-parent',
      title: '⚡ Quick: 1 hour from now',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'separator1',
      parentId: 'tabtimer-parent',
      type: 'separator',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'unlock-page',
      parentId: 'tabtimer-parent',
      title: '🔓 Unschedule this page (Alt+U)',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'relock-original',
      parentId: 'tabtimer-parent',
      title: '🔒 Re-lock (original schedule)',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'relock-24h',
      parentId: 'tabtimer-parent',
      title: '🔒 Re-lock (+24 hours from now)',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'separator2',
      parentId: 'tabtimer-parent',
      type: 'separator',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'open-options',
      parentId: 'tabtimer-parent',
      title: '⚙️ Open TabTimer (Alt+O)',
      contexts: ['page']
    });
  });
}

async function initializeStorage() {
  const result = await chrome.storage.local.get(['locks', 'settings', 'categories', 'folders', 'tags']);
  
  if (!result.locks) {
    await chrome.storage.local.set({ locks: [] });
  }
  
  if (!result.settings) {
    await chrome.storage.local.set({
      settings: {
        notificationSeconds: 10,
        notificationsEnabled: true,
        autoDeleteExpired: true,
        theme: 'light',
        defaultCategory: 'Daily',
        defaultLockMinutes: 0,
        autoCloseMinutes: 0, // 0 = disabled
        openInBackground: true,
        timezone: 'America/New_York'
      }
    });
  }
  
  // Default categories with colors
  if (!result.categories) {
    await chrome.storage.local.set({
      categories: [
        { id: 'daily', name: 'Daily', emoji: '📅', color: '#3b82f6' },
        { id: 'weekly', name: 'Weekly', emoji: '📆', color: '#8b5cf6' },
        { id: 'monthly', name: 'Monthly', emoji: '🗓️', color: '#06b6d4' },
        { id: 'once', name: 'Once', emoji: '🎯', color: '#f97316' },
        { id: 'other', name: 'Other', emoji: '📌', color: '#94a3b8' }
      ]
    });
  }
  
  // Default folders
  if (!result.folders) {
    await chrome.storage.local.set({
      folders: [
        { id: 'default', name: 'All Schedules', icon: '📁', color: '#64748b' }
      ]
    });
  }
  
  // Tags
  if (!result.tags) {
    await chrome.storage.local.set({ tags: [] });
  }
}

// ============================================
// ALARM HANDLER - Check for locks to open
// ============================================

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkLocks') {
    checkAndOpenLocks();
  } else if (alarm.name === 'autoBackup') {
    performAutoBackup();
  } else if (alarm.name.startsWith('autoclose-')) {
    const tabId = parseInt(alarm.name.replace('autoclose-', ''));
    chrome.tabs.remove(tabId).catch(() => {});
  }
});

// Auto-backup function
async function performAutoBackup() {
  const result = await chrome.storage.local.get(['autoBackupEnabled', 'locks', 'categories', 'folders', 'settings', 'savedBackups', 'autoBackupKeep', 'lastAutoBackup', 'autoBackupFrequency']);
  
  if (!result.autoBackupEnabled) return;
  
  // Check if it's time for backup based on frequency
  const lastBackup = result.lastAutoBackup ? new Date(result.lastAutoBackup) : null;
  const now = new Date();
  const frequency = result.autoBackupFrequency || 'daily';
  
  let shouldBackup = false;
  if (!lastBackup) {
    shouldBackup = true;
  } else {
    const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);
    switch (frequency) {
      case 'daily':
        shouldBackup = hoursSinceLastBackup >= 24;
        break;
      case 'weekly':
        shouldBackup = hoursSinceLastBackup >= 168;
        break;
      case 'monthly':
        shouldBackup = hoursSinceLastBackup >= 720;
        break;
    }
  }
  
  if (!shouldBackup) return;
  
  // Create backup
  const backup = {
    timestamp: now.toISOString(),
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
  
  console.log('Auto-backup created:', backup.timestamp);
}

async function checkAndOpenLocks() {
  // First, ensure the alarm still exists (service workers can be killed)
  ensureAlarmExists();
  
  const result = await chrome.storage.local.get(['locks', 'settings', 'pauseAll']);
  let locks = result.locks || [];
  const settings = result.settings || {};
  const pauseAll = result.pauseAll || false;
  const now = Date.now();
  
  // If paused, skip opening any new tabs
  if (pauseAll) {
    console.log('TabTimer: All schedules paused, skipping checks');
    return;
  }
  
  // Grace period: configurable, default 60 minutes (1 hour)
  const gracePeriodMinutes = settings.gracePeriodMinutes || 60;
  const GRACE_PERIOD_MS = gracePeriodMinutes * 60 * 1000;
  
  // Stagger interval for missed tabs (in milliseconds) - default 15 seconds
  const staggerIntervalMs = (settings.missedTabStaggerSeconds || 15) * 1000;
  
  let updated = false;
  
  // Collect tabs that need to be opened (within grace period)
  const tabsToOpen = [];
  
  // Advance reminder window: fire once per schedule when we enter the reminder window
  const notifSeconds = settings.notificationSeconds !== undefined ? settings.notificationSeconds : 10;
  const REMINDER_WINDOW_MS = notifSeconds * 1000;

  for (const lock of locks) {
    // Skip if manually unlocked (user explicitly unlocked it)
    if (lock.manuallyUnlocked) continue;
    
    const unlockTime = new Date(lock.unlockTime).getTime();

    // ── Advance reminder notification ──────────────────────────────────
    // Fire when we are within the reminder window BEFORE the tab opens
    // Uses lock.reminderSent flag to fire only once per occurrence
    if (settings.notificationsEnabled && notifSeconds > 0 && !lock.opened && !lock.reminderSent) {
      const timeUntilOpen = unlockTime - now;
      if (timeUntilOpen > 0 && timeUntilOpen <= REMINDER_WINDOW_MS) {
        chrome.notifications.create(`reminder-${lock.id}`, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '⏰ TabTimer Reminder',
          message: `"${lock.name || lock.url}" opens in ${notifSeconds} second${notifSeconds !== 1 ? 's' : ''}`,
          priority: 2
        });
        lock.reminderSent = true;
        updated = true;
      }
    }

    // Reset reminderSent after the tab has opened so next occurrence gets a reminder too
    if (lock.opened && lock.reminderSent) {
      lock.reminderSent = false;
      updated = true;
    }
    // ────────────────────────────────────────────────────────────────────
    
    // Check if it's time to open (and not already opened)
    if (now >= unlockTime && !lock.opened) {
      // Check if we're within the grace period
      const timeSinceScheduled = now - unlockTime;
      
      if (timeSinceScheduled > GRACE_PERIOD_MS) {
        // Missed the window - don't open the tab
        // For recurring schedules, reschedule for next occurrence AT THE ORIGINAL TIME
        if (lock.recurring) {
          // Calculate next occurrence keeping the ORIGINAL time of day
          let nextUnlock = calculateNextUnlockTime(lock);
          let safetyCounter = 0;
          while (nextUnlock.getTime() <= now && safetyCounter < 365) {
            lock.unlockTime = nextUnlock.toISOString();
            nextUnlock = calculateNextUnlockTime(lock);
            safetyCounter++;
          }
          lock.unlockTime = nextUnlock.toISOString();
          lock.opened = false;
          updated = true;
          console.log(`Missed schedule for ${lock.name || lock.url}, rescheduled to ${nextUnlock}`);
        } else {
          // For non-recurring, mark as missed (opened but without actually opening)
          lock.opened = true;
          lock.missedSchedule = true;
          lock.openedAt = new Date().toISOString();
          updated = true;
          console.log(`Missed one-time schedule for ${lock.name || lock.url}`);
        }
        continue;
      }
      
      // Within grace period - add to list of tabs to open
      tabsToOpen.push({
        lock,
        originalUnlockTime: unlockTime,
        timeSinceScheduled
      });
    }
    
    // Check for auto-relock after manual unlock
    if (lock.manuallyUnlocked && lock.unlockedAt && lock.lockMinutes !== 0) {
      const lockMinutes = lock.lockMinutes || 5;
      const unlockedTime = new Date(lock.unlockedAt).getTime();
      const autoRelockTime = unlockedTime + lockMinutes * 60 * 1000;
      
      if (now >= autoRelockTime) {
        lock.manuallyUnlocked = false;
        lock.unlockedAt = null;
        
        if (lock.recurring && lock.opened) {
          const nextUnlock = calculateNextUnlockTime(lock);
          lock.unlockTime = nextUnlock.toISOString();
          lock.opened = false;
        }
        
        updated = true;
        
        if (settings.notificationsEnabled) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'TabTimer',
            message: `Auto re-locked: ${lock.name || lock.url}`,
            priority: 1
          });
        }
      }
    }
    
    // Check for auto-relock after page opens (for recurring schedules)
    if (lock.opened && !lock.manuallyUnlocked && lock.autoRelockAt && lock.recurring) {
      const relockTime = new Date(lock.autoRelockAt).getTime();
      if (now >= relockTime) {
        let nextUnlock = calculateNextUnlockTime(lock);
        let safetyCounter = 0;
        while (nextUnlock.getTime() <= now && safetyCounter < 365) {
          lock.unlockTime = nextUnlock.toISOString();
          nextUnlock = calculateNextUnlockTime(lock);
          safetyCounter++;
        }
        
        if (lock.expirationDate) {
          const expiry = new Date(lock.expirationDate).getTime();
          if (nextUnlock.getTime() > expiry) {
            continue;
          }
        }
        
        const dateMatch = lock.name?.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const expirationTime = settings.expirationTime || '23:59';
          const timezone = settings.timezone || 'America/New_York';
          const expDateStr = `${dateMatch[1]}T${expirationTime}:00`;
          const expDate = new Date(new Date(expDateStr).toLocaleString('en-US', { timeZone: timezone }));
          if (now > expDate.getTime()) {
            continue;
          }
        }
        
        lock.unlockTime = nextUnlock.toISOString();
        lock.opened = false;
        lock.manuallyUnlocked = false;
        lock.autoRelockAt = null;
        updated = true;
      }
    }
    
    // Auto-relock for NON-recurring schedules
    if (lock.opened && !lock.manuallyUnlocked && lock.autoRelockAt && !lock.recurring) {
      const relockTime = new Date(lock.autoRelockAt).getTime();
      if (now >= relockTime) {
        lock.opened = false;
        lock.autoRelockAt = null;
        updated = true;
        
        if (settings.notificationsEnabled) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'TabTimer',
            message: `Re-locked: ${lock.name || lock.url}`,
            priority: 1
          });
        }
      }
    }
  }
  
  // Sort tabs by their original scheduled time
  tabsToOpen.sort((a, b) => a.originalUnlockTime - b.originalUnlockTime);
  
  // Open tabs with staggered timing
  if (tabsToOpen.length > 0) {
    console.log(`TabTimer: Opening ${tabsToOpen.length} tabs with ${staggerIntervalMs/1000}s stagger`);
    
    for (let i = 0; i < tabsToOpen.length; i++) {
      const { lock } = tabsToOpen[i];
      const delayMs = i * staggerIntervalMs;
      
      if (delayMs === 0) {
        // Open first tab immediately
        await openScheduledTab(lock, locks, settings, now);
        updated = true;
      } else {
        // Schedule remaining tabs to open with delay
        // Use a closure to capture the lock
        ((lockToOpen, delay) => {
          setTimeout(async () => {
            const freshResult = await chrome.storage.local.get(['locks', 'settings']);
            const freshLocks = freshResult.locks || [];
            const freshSettings = freshResult.settings || {};
            const freshLock = freshLocks.find(l => l.id === lockToOpen.id);
            
            if (freshLock && !freshLock.opened) {
              await openScheduledTab(freshLock, freshLocks, freshSettings, Date.now());
              await chrome.storage.local.set({ locks: freshLocks });
            }
          }, delay);
        })(lock, delayMs);
        
        // Mark as pending so it won't be picked up again
        lock.opened = true;
        lock.openedAt = new Date(now + delayMs).toISOString();
        lock.openCount = (lock.openCount || 0) + 1;
        lock.staggeredOpen = true;
        updated = true;
      }
    }
  }
  
  // Auto-delete expired locks (based on date in name)
  if (settings.autoDeleteExpired) {
    const expirationTime = settings.expirationTime || '23:59';
    const timezone = settings.timezone || 'America/New_York';
    
    const filtered = locks.filter(lock => {
      const dateMatch = lock.name?.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const expDateStr = `${dateMatch[1]}T${expirationTime}:00`;
        try {
          const localExpDate = new Date(`${dateMatch[1]}T${expirationTime}:00`);
          const tzDate = new Date(localExpDate.toLocaleString('en-US', { timeZone: timezone }));
          const offset = localExpDate.getTime() - tzDate.getTime();
          const expDate = new Date(localExpDate.getTime() + offset);
          
          if (now > expDate.getTime()) {
            console.log(`Auto-deleting expired schedule: ${lock.name}`);
            return false;
          }
        } catch (e) {
          const expDate = new Date(dateMatch[1] + 'T' + expirationTime + ':00');
          if (now > expDate.getTime()) {
            return false;
          }
        }
      }
      return true;
    });
    
    if (filtered.length !== locks.length) {
      await chrome.storage.local.set({ locks: filtered });
      return;
    }
  }
  
  if (updated) {
    await chrome.storage.local.set({ locks });
  }
}

// Helper function to open a single scheduled tab
async function openScheduledTab(lock, locks, settings, now) {
  try {
    const tab = await chrome.tabs.create({ 
      url: lock.url, 
      active: !settings.openInBackground 
    });
    
    trackTabForResolvedUrl(tab.id, lock.id);
    
    const autoCloseMinutes = lock.autoClose ? lock.autoCloseMinutes : (settings.autoCloseMinutes || 0);
    if (autoCloseMinutes > 0) {
      chrome.alarms.create(`autoclose-${tab.id}`, { 
        delayInMinutes: autoCloseMinutes 
      });
    }
    
    lock.opened = true;
    lock.openedAt = new Date().toISOString();
    lock.openCount = (lock.openCount || 0) + 1;
    lock.staggeredOpen = false;
    
    const lockMinutes = lock.lockMinutes;
    if (lockMinutes === 0) {
      lock.autoRelockAt = null;
    } else {
      lock.autoRelockAt = new Date(now + (lockMinutes || 5) * 60 * 1000).toISOString();
    }
    
    if (settings.notificationsEnabled) {
      // Only show the "Opened" notification if no advance reminder was sent for this occurrence.
      // If the user set a reminder (notificationSeconds > 0) and it already fired, skip this
      // so the user only ever gets ONE notification per tab open.
      const notifSecs = settings.notificationSeconds !== undefined ? settings.notificationSeconds : 10;
      const reminderAlreadySent = lock.reminderSent === true;
      if (notifSecs === 0 || !reminderAlreadySent) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'TabTimer',
          message: `Opened: ${lock.name || lock.url}`,
          priority: 1
        });
      }
    }
    
    if (lock.playSound) {
      try {
        await playNotificationSound();
      } catch (e) {
        console.log('Could not play sound:', e);
      }
    }
    
    if (lock.chainTo) {
      const chainedLock = locks.find(l => l.id === lock.chainTo);
      if (chainedLock && !chainedLock.opened) {
        const chainDelay = lock.chainDelayMinutes || 5;
        chainedLock.unlockTime = new Date(now + chainDelay * 60 * 1000).toISOString();
      }
    }
    
    console.log(`Opened tab for: ${lock.name || lock.url}`);
    return true;
  } catch (error) {
    console.error(`Failed to open tab for ${lock.name || lock.url}:`, error);
    return false;
  }
}


// ============================================
// RESOLVED URL TRACKING
// ============================================

// Map to track which tabs we're watching for URL resolution
const pendingUrlResolution = new Map();

function trackTabForResolvedUrl(tabId, lockId) {
  pendingUrlResolution.set(tabId, { lockId, startTime: Date.now() });
  
  // Clean up after 30 seconds if not resolved
  setTimeout(() => {
    pendingUrlResolution.delete(tabId);
  }, 30000);
}

// Listen for tab URL changes to capture resolved URLs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check if this is a tab we're tracking
  if (!pendingUrlResolution.has(tabId)) return;
  
  // Only process when the tab has finished loading
  if (changeInfo.status !== 'complete') return;
  
  const tracking = pendingUrlResolution.get(tabId);
  pendingUrlResolution.delete(tabId);
  
  // Get the final URL
  const resolvedUrl = tab.url;
  if (!resolvedUrl) return;
  
  // Update the lock with the resolved URL
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const lock = locks.find(l => l.id === tracking.lockId);
  if (!lock) return;
  
  // Only save if the resolved URL is different from the original
  if (resolvedUrl !== lock.url && !resolvedUrl.startsWith('chrome://')) {
    // Store resolved URLs as an array (in case a URL redirects to different places over time)
    if (!lock.resolvedUrls) {
      lock.resolvedUrls = [];
    }
    
    // Add if not already in the list
    if (!lock.resolvedUrls.includes(resolvedUrl)) {
      lock.resolvedUrls.push(resolvedUrl);
      
      // Keep only the last 5 resolved URLs
      if (lock.resolvedUrls.length > 5) {
        lock.resolvedUrls = lock.resolvedUrls.slice(-5);
      }
      
      await chrome.storage.local.set({ locks });
      console.log(`Captured resolved URL for ${lock.url}: ${resolvedUrl}`);
    }
  }
});

// Manual URL resolution - opens tab, waits for redirect, captures URL, closes tab
async function manualResolveUrl(lockId, url) {
  return new Promise(async (resolve) => {
    try {
      // Open the tab in background
      const tab = await chrome.tabs.create({ 
        url: url, 
        active: false 
      });
      
      const tabId = tab.id;
      let resolved = false;
      
      // Set up listener for this specific tab
      const listener = async (updatedTabId, changeInfo, updatedTab) => {
        if (updatedTabId !== tabId) return;
        if (changeInfo.status !== 'complete') return;
        if (resolved) return;
        
        resolved = true;
        
        // Get the final URL
        const resolvedUrl = updatedTab.url;
        
        // Close the tab
        try {
          await chrome.tabs.remove(tabId);
        } catch (e) {
          // Tab might already be closed
        }
        
        // Remove listener
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Update the lock with resolved URL
        if (resolvedUrl && !resolvedUrl.startsWith('chrome://')) {
          const result = await chrome.storage.local.get(['locks']);
          const locks = result.locks || [];
          
          const lock = locks.find(l => l.id === lockId);
          if (lock) {
            // Only save if different from original
            if (resolvedUrl !== lock.url) {
              if (!lock.resolvedUrls) {
                lock.resolvedUrls = [];
              }
              
              if (!lock.resolvedUrls.includes(resolvedUrl)) {
                lock.resolvedUrls.push(resolvedUrl);
                
                // Keep only last 5
                if (lock.resolvedUrls.length > 5) {
                  lock.resolvedUrls = lock.resolvedUrls.slice(-5);
                }
                
                await chrome.storage.local.set({ locks });
                console.log(`Manually resolved URL for ${lock.url}: ${resolvedUrl}`);
              }
            }
            
            resolve({ success: true, resolvedUrl: resolvedUrl });
            return;
          }
        }
        
        resolve({ success: true, resolvedUrl: resolvedUrl });
      };
      
      chrome.tabs.onUpdated.addListener(listener);
      
      // Timeout after 15 seconds
      setTimeout(async () => {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(listener);
          try {
            await chrome.tabs.remove(tabId);
          } catch (e) {}
          resolve({ success: false, error: 'Timeout waiting for page to load' });
        }
      }, 15000);
      
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

function calculateNextUnlockTime(lock) {
  const currentUnlock = new Date(lock.unlockTime);
  const repeatType = lock.repeatType || 'daily';
  const repeatDays = lock.repeatDays || []; // For specific days of week
  
  switch (repeatType) {
    case 'daily':
      currentUnlock.setDate(currentUnlock.getDate() + 1);
      break;
    case 'minutes':
      // Repeat every X minutes
      const minuteInterval = lock.minuteInterval || 10;
      currentUnlock.setMinutes(currentUnlock.getMinutes() + minuteInterval);
      break;
    case 'hourly':
      // Repeat every X hours
      const hourlyInterval = lock.hourlyInterval || 6;
      currentUnlock.setHours(currentUnlock.getHours() + hourlyInterval);
      break;
    case 'weekdays':
      do {
        currentUnlock.setDate(currentUnlock.getDate() + 1);
      } while (currentUnlock.getDay() === 0 || currentUnlock.getDay() === 6);
      break;
    case 'weekends':
      do {
        currentUnlock.setDate(currentUnlock.getDate() + 1);
      } while (currentUnlock.getDay() !== 0 && currentUnlock.getDay() !== 6);
      break;
    case 'specific-days':
      // repeatDays is array like [1, 3, 5] for Mon, Wed, Fri
      do {
        currentUnlock.setDate(currentUnlock.getDate() + 1);
      } while (!repeatDays.includes(currentUnlock.getDay()));
      break;
    case 'weekly':
      currentUnlock.setDate(currentUnlock.getDate() + 7);
      break;
    case 'biweekly':
      currentUnlock.setDate(currentUnlock.getDate() + 14);
      break;
    case 'every3weeks':
      currentUnlock.setDate(currentUnlock.getDate() + 21);
      break;
    case 'monthly':
      currentUnlock.setMonth(currentUnlock.getMonth() + 1);
      break;
    case 'bimonthly':
      currentUnlock.setMonth(currentUnlock.getMonth() + 2);
      break;
    case 'quarterly':
      currentUnlock.setMonth(currentUnlock.getMonth() + 3);
      break;
    case 'every6months':
      currentUnlock.setMonth(currentUnlock.getMonth() + 6);
      break;
    case 'yearly':
      currentUnlock.setFullYear(currentUnlock.getFullYear() + 1);
      break;
    case 'leapyear':
      currentUnlock.setFullYear(currentUnlock.getFullYear() + 4);
      break;
    case 'custom-days':
      // Custom interval in days (new format)
      const customDays = lock.customDays || 3;
      currentUnlock.setDate(currentUnlock.getDate() + customDays);
      break;
    case 'custom':
      // Legacy custom interval in days
      const intervalDays = lock.customIntervalDays || 1;
      currentUnlock.setDate(currentUnlock.getDate() + intervalDays);
      break;
    default:
      currentUnlock.setDate(currentUnlock.getDate() + 1);
  }
  
  return currentUnlock;
}

// ============================================
// CONTEXT MENU HANDLER
// ============================================

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'lock-page':
      chrome.tabs.sendMessage(tab.id, { action: 'showLockDialog', url: tab.url, title: tab.title });
      break;
    case 'quick-schedule-tomorrow':
      quickScheduleTomorrow(tab.url, tab.title, tab.id);
      break;
    case 'quick-schedule-1hour':
      quickSchedule1Hour(tab.url, tab.title, tab.id);
      break;
    case 'unlock-page':
      unlockPage(tab.url);
      break;
    case 'relock-original':
      relockPageOriginal(tab.url, tab.id);
      break;
    case 'relock-24h':
      relockPage24Hours(tab.url, tab.id);
      break;
    case 'open-options':
      chrome.runtime.openOptionsPage();
      break;
  }
});

// Quick schedule functions
async function quickScheduleTomorrow(url, title, tabId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0);
  
  const settings = await getSettings();
  const defaultLock = (settings.defaultLockMinutes !== undefined) ? settings.defaultLockMinutes : 0;
  
  const result = await createLock({
    url: url,
    name: title || url,
    category: 'Daily',
    unlockTime: tomorrow.toISOString(),
    recurring: true,
    repeatType: 'daily',
    lockMinutes: defaultLock
  });
  
  if (result.success) {
    chrome.tabs.sendMessage(tabId, { action: 'checkLock' });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: `Scheduled for tomorrow 7:00 AM`,
      priority: 1
    });
  }
}

async function quickSchedule1Hour(url, title, tabId) {
  const oneHour = new Date(Date.now() + 60 * 60 * 1000);
  
  const settings = await getSettings();
  const defaultLock = (settings.defaultLockMinutes !== undefined) ? settings.defaultLockMinutes : 0;
  
  const result = await createLock({
    url: url,
    name: title || url,
    category: 'Once',
    unlockTime: oneHour.toISOString(),
    recurring: false,
    lockMinutes: defaultLock
  });
  
  if (result.success) {
    chrome.tabs.sendMessage(tabId, { action: 'checkLock' });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: `Scheduled for 1 hour from now`,
      priority: 1
    });
  }
}

// ============================================
// KEYBOARD SHORTCUT HANDLER
// ============================================

chrome.commands.onCommand.addListener((command, tab) => {
  switch (command) {
    case 'lock-page':
      chrome.tabs.sendMessage(tab.id, { action: 'showLockDialog', url: tab.url, title: tab.title });
      break;
    case 'unlock-page':
      unlockPage(tab.url);
      break;
    case 'open-options':
      chrome.runtime.openOptionsPage();
      break;
  }
});

// ============================================
// MESSAGE HANDLER
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'createLock':
        sendResponse(await createLock(message.lock));
        break;
      case 'getLocks':
        const locksResult = await chrome.storage.local.get(['locks']);
        sendResponse(locksResult.locks || []);
        break;
      case 'updateLock':
        sendResponse(await updateLock(message.lock));
        break;
      case 'saveLocks':
        // Bulk replace all locks (used for batch operations like downgrading repeat types)
        await chrome.storage.local.set({ locks: message.locks });
        await scheduleAlarms();
        sendResponse({ success: true });
        break;
      case 'deleteLock':
        sendResponse(await deleteLock(message.id));
        break;
      case 'deleteLocks':
        sendResponse(await deleteLocks(message.ids));
        break;
      case 'duplicateLock':
        sendResponse(await duplicateLock(message.id, message.customTime));
        break;
      case 'bulkUpdateLocks':
        sendResponse(await bulkUpdateLocks(message.ids, message.updates));
        break;
      case 'bulkShiftTime':
        sendResponse(await bulkShiftTime(message.ids, message.minutes));
        break;
      case 'checkConflict':
        sendResponse(await checkTimeConflict(message.time, message.excludeId));
        break;
      case 'findNextAvailableSlot':
        sendResponse(await findNextAvailableSlot(message.startTime, message.intervalMinutes));
        break;
      case 'getSettings':
        const settingsResult = await chrome.storage.local.get(['settings']);
        sendResponse(settingsResult.settings || {});
        break;
      case 'updateSettings':
        await chrome.storage.local.set({ settings: message.settings });
        sendResponse({ success: true });
        break;
      case 'getCategories':
        const catResult = await chrome.storage.local.get(['categories']);
        sendResponse(catResult.categories || []);
        break;
      case 'getLicense':
        const licResult = await chrome.storage.local.get(['license']);
        const lic = licResult.license || {};
        let licStatus = 'free';
        if (lic.key && lic.validated) {
          licStatus = 'premium';
        } else if (lic.trialStarted) {
          const trialEnd = lic.trialStarted + (lic.trialDays || 7) * 24 * 60 * 60 * 1000;
          licStatus = Date.now() < trialEnd ? 'trial' : 'trialExpired';
        }
        sendResponse({ status: licStatus, isPremium: licStatus === 'premium' || licStatus === 'trial' });
        break;
      case 'updateCategories':
        await chrome.storage.local.set({ categories: message.categories });
        sendResponse({ success: true });
        break;
      case 'getFolders':
        const foldersResult = await chrome.storage.local.get(['folders']);
        sendResponse(foldersResult.folders || []);
        break;
      case 'updateFolders':
        await chrome.storage.local.set({ folders: message.folders });
        sendResponse({ success: true });
        break;
      case 'getTags':
        const tagsResult = await chrome.storage.local.get(['tags']);
        sendResponse(tagsResult.tags || []);
        break;
      case 'updateTags':
        await chrome.storage.local.set({ tags: message.tags });
        sendResponse({ success: true });
        break;
      case 'importLocks':
        sendResponse(await importLocks(message.locks));
        break;
      case 'exportLocks':
        sendResponse(await exportAllData());
        break;
      case 'importFullBackup':
        sendResponse(await importFullBackup(message.data));
        break;
      case 'getStats':
        sendResponse(await getStats());
        break;
      case 'resolveUrl':
        sendResponse(await manualResolveUrl(message.id, message.url));
        break;
      case 'repairSchedules':
        const repairResult = await repairStuckSchedules();
        sendResponse({ success: true, repaired: repairResult.repaired });
        break;
      case 'runHealthCheck':
        const healthResult = await runScheduleHealthCheck();
        sendResponse(healthResult);
        break;
      case 'getHealthReport':
        const healthReport = await chrome.storage.local.get(['lastHealthCheck']);
        sendResponse(healthReport.lastHealthCheck || null);
        break;
      case 'cloudSync':
        sendResponse(await handleCloudSync(message.operation, message.data));
        break;
      case 'updateSortOrder':
        sendResponse(await updateSortOrder(message.order));
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({ error: error.message });
  }
}

// ============================================
// LOCK CRUD FUNCTIONS
// ============================================

async function createLock(lockData) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const newLock = {
    id: Date.now().toString(),
    url: lockData.url,
    name: lockData.name || '',
    category: lockData.category || 'Other',
    folder: lockData.folder || 'default',
    tags: lockData.tags || [],
    color: lockData.color || null,
    lockedAt: new Date().toISOString(),
    unlockTime: lockData.unlockTime,
    recurring: lockData.recurring || false,
    repeatType: lockData.repeatType || 'daily',
    repeatDays: lockData.repeatDays || [],
    customIntervalDays: lockData.customIntervalDays || 1,
    minuteInterval: lockData.minuteInterval || 10,
    hourlyInterval: lockData.hourlyInterval || 1,
    customDays: lockData.customDays || 2,
    specificDates: lockData.specificDates || '',
    lockMinutes: lockData.lockMinutes !== undefined ? lockData.lockMinutes : 0,
    expirationDate: lockData.expirationDate || null,
    chainTo: lockData.chainTo || null,
    chainDelayMinutes: lockData.chainDelayMinutes || 5,
    autoClose: lockData.autoClose || false,
    autoCloseMinutes: lockData.autoCloseMinutes || 0,
    playSound: lockData.playSound || false,
    opened: false,
    openCount: 0,
    manuallyUnlocked: false,
    notes: lockData.notes || '',
    reminderSent: false
  };
  
  locks.push(newLock);
  await chrome.storage.local.set({ locks });
  
  return { success: true, lock: newLock };
}

async function updateLock(updatedLock) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const index = locks.findIndex(l => l.id === updatedLock.id);
  if (index !== -1) {
    const oldLock = locks[index];
    const newLock = { ...oldLock, ...updatedLock };
    
    // If unlockTime changed and new time is in the future, reset opened status
    if (updatedLock.unlockTime && updatedLock.unlockTime !== oldLock.unlockTime) {
      const newUnlockTime = new Date(updatedLock.unlockTime).getTime();
      if (newUnlockTime > Date.now()) {
        newLock.opened = false;
        newLock.manuallyUnlocked = false;
        newLock.autoRelockAt = null;
        console.log(`TabTimer: Reset opened status for "${newLock.name}" - rescheduled to future time`);
      }
    }
    
    locks[index] = newLock;
    await chrome.storage.local.set({ locks });
    return { success: true };
  }
  
  return { success: false, error: 'Lock not found' };
}

async function deleteLock(id) {
  const result = await chrome.storage.local.get(['locks']);
  let locks = result.locks || [];
  
  locks = locks.filter(l => l.id !== id);
  await chrome.storage.local.set({ locks });
  
  return { success: true };
}

async function deleteLocks(ids) {
  const result = await chrome.storage.local.get(['locks']);
  let locks = result.locks || [];
  
  locks = locks.filter(l => !ids.includes(l.id));
  await chrome.storage.local.set({ locks });
  
  return { success: true, deleted: ids.length };
}

async function duplicateLock(id, customTime = null) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const original = locks.find(l => l.id === id);
  if (!original) {
    return { success: false, error: 'Lock not found' };
  }
  
  // Generate smart copy name
  // Remove ALL existing "(copy N)" or "(copy)" suffixes to get base name
  let baseName = original.name;
  // Keep removing (copy) or (copy N) patterns until none left
  let previousName = '';
  while (previousName !== baseName) {
    previousName = baseName;
    baseName = baseName.replace(/\s*\(copy(?:\s+\d+)?\)\s*$/i, '').trim();
  }
  
  // Find the highest copy number for this base name
  let highestCopyNum = 0;
  for (const lock of locks) {
    // Check if this lock's name starts with the base name
    if (lock.name === baseName || lock.name.startsWith(baseName + ' (copy')) {
      // Check for (copy N) pattern - get the last one
      const copyMatches = lock.name.match(/\(copy\s+(\d+)\)/gi);
      if (copyMatches) {
        // Get the last match
        const lastMatch = copyMatches[copyMatches.length - 1];
        const numMatch = lastMatch.match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0]);
          if (num > highestCopyNum) {
            highestCopyNum = num;
          }
        }
      } else if (lock.name.includes('(copy)')) {
        // Plain "(copy)" counts as 1
        // Count how many (copy) there are
        const copyCount = (lock.name.match(/\(copy\)/gi) || []).length;
        if (copyCount > highestCopyNum) {
          highestCopyNum = copyCount;
        }
      }
    }
  }
  
  // New copy number is highest + 1, minimum 1
  const newCopyNum = highestCopyNum + 1;
  const newName = `${baseName} (copy ${newCopyNum})`;
  
  // Use custom time if provided, otherwise use original time
  const unlockTime = customTime || original.unlockTime;
  
  const duplicate = {
    ...original,
    id: Date.now().toString(),
    name: newName,
    unlockTime: unlockTime,
    lockedAt: new Date().toISOString(),
    opened: false,
    openCount: 0,
    manuallyUnlocked: false
  };
  
  locks.push(duplicate);
  await chrome.storage.local.set({ locks });
  
  return { success: true, lock: duplicate };
}

async function bulkUpdateLocks(ids, updates) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  let updatedCount = 0;
  for (const lock of locks) {
    if (ids.includes(lock.id)) {
      Object.assign(lock, updates);
      updatedCount++;
    }
  }
  
  await chrome.storage.local.set({ locks });
  return { success: true, updated: updatedCount };
}

async function bulkShiftTime(ids, minutes) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  const now = Date.now();
  
  let updatedCount = 0;
  for (const lock of locks) {
    if (ids.includes(lock.id)) {
      const currentTime = new Date(lock.unlockTime);
      currentTime.setMinutes(currentTime.getMinutes() + minutes);
      lock.unlockTime = currentTime.toISOString();
      
      // If new time is in the future, reset opened status
      if (currentTime.getTime() > now) {
        lock.opened = false;
        lock.manuallyUnlocked = false;
        lock.autoRelockAt = null;
      }
      updatedCount++;
    }
  }
  
  await chrome.storage.local.set({ locks });
  return { success: true, updated: updatedCount };
}

// ============================================
// UNLOCK/RELOCK FUNCTIONS
// ============================================

async function unlockPage(url) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const lock = locks.find(l => {
    try {
      const lockUrl = new URL(l.url);
      const pageUrl = new URL(url);
      return lockUrl.origin + lockUrl.pathname === pageUrl.origin + pageUrl.pathname && !l.opened;
    } catch {
      return l.url === url && !l.opened;
    }
  });
  
  if (lock) {
    lock.manuallyUnlocked = true;
    lock.opened = true;
    await chrome.storage.local.set({ locks });
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: `Unscheduled: ${lock.name || lock.url}`,
      priority: 1
    });
  }
}

// Helper function for flexible URL matching
function urlsMatch(lockUrl, pageUrl) {
  try {
    const lock = new URL(lockUrl);
    const page = new URL(pageUrl);
    
    // Must be same origin
    if (lock.origin !== page.origin) return false;
    
    // Exact pathname match
    if (lock.pathname === page.pathname) return true;
    
    // Check if page URL starts with lock URL (handles /thanks, /confirmation, etc.)
    if (page.pathname.startsWith(lock.pathname)) return true;
    
    // Check if lock URL starts with page URL
    if (lock.pathname.startsWith(page.pathname)) return true;
    
    return false;
  } catch {
    return lockUrl === pageUrl || pageUrl.startsWith(lockUrl) || lockUrl.startsWith(pageUrl);
  }
}

async function relockPageOriginal(url, tabId) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  // Find the lock for this URL - flexible matching
  const lock = locks.find(l => urlsMatch(l.url, url));
  
  if (lock) {
    lock.manuallyUnlocked = false;
    lock.unlockedAt = null;
    lock.opened = false;
    await chrome.storage.local.set({ locks });
    
    chrome.tabs.sendMessage(tabId, { action: 'checkLock' });
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: `Re-locked: ${lock.name || lock.url}`,
      priority: 1
    });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: 'No schedule found for this page',
      priority: 1
    });
  }
}

async function relockPage24Hours(url, tabId) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  // Find the lock for this URL - flexible matching
  const lock = locks.find(l => urlsMatch(l.url, url));
  
  if (lock) {
    const newUnlockTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    lock.unlockTime = newUnlockTime.toISOString();
    lock.manuallyUnlocked = false;
    lock.unlockedAt = null;
    lock.opened = false;
    await chrome.storage.local.set({ locks });
    
    chrome.tabs.sendMessage(tabId, { action: 'checkLock' });
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: `Re-locked for 24 hours: ${lock.name || lock.url}`,
      priority: 1
    });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'TabTimer',
      message: 'No schedule found for this page',
      priority: 1
    });
  }
}

// ============================================
// CONFLICT RESOLUTION
// ============================================

async function checkTimeConflict(targetTime, excludeId = null) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const targetDate = new Date(targetTime);
  const targetMs = targetDate.getTime();
  
  // Check for conflicts within 1 minute
  const conflicts = locks.filter(lock => {
    if (excludeId && lock.id === excludeId) return false;
    if (lock.opened || lock.manuallyUnlocked) return false;
    const lockTime = new Date(lock.unlockTime).getTime();
    return Math.abs(lockTime - targetMs) < 60000;
  });
  
  if (conflicts.length === 0) {
    return { hasConflict: false };
  }
  
  return {
    hasConflict: true,
    conflicts: conflicts.map(c => ({
      id: c.id,
      name: c.name,
      url: c.url,
      unlockTime: c.unlockTime
    }))
  };
}

async function findNextAvailableSlot(startTime, intervalMinutes = 1) {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  // Get all active lock times
  const activeTimes = locks
    .filter(l => !l.opened && !l.manuallyUnlocked)
    .map(l => new Date(l.unlockTime).getTime())
    .sort((a, b) => a - b);
  
  let candidate = new Date(startTime).getTime();
  const interval = intervalMinutes * 60 * 1000;
  
  // Find a slot that doesn't conflict
  while (activeTimes.some(t => Math.abs(t - candidate) < 60000)) {
    candidate += interval;
  }
  
  return { time: new Date(candidate).toISOString() };
}

// ============================================
// IMPORT/EXPORT
// ============================================

async function importLocks(locksToImport) {
  const result = await chrome.storage.local.get(['locks']);
  const existingLocks = result.locks || [];
  
  let imported = 0;
  for (const lock of locksToImport) {
    // Generate new ID
    const newLock = {
      ...lock,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      lockedAt: new Date().toISOString(),
      opened: false,
      openCount: 0,
      manuallyUnlocked: false
    };
    existingLocks.push(newLock);
    imported++;
  }
  
  await chrome.storage.local.set({ locks: existingLocks });
  return { success: true, imported };
}

async function exportAllData() {
  const result = await chrome.storage.local.get(['locks', 'settings', 'categories', 'folders', 'tags', 'license']);
  
  return {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    locks: result.locks || [],
    settings: result.settings || {},
    categories: result.categories || [],
    folders: result.folders || [],
    tags: result.tags || [],
    license: result.license || {}
  };
}

async function importFullBackup(data) {
  try {
    if (data.locks) {
      // Fix any schedules based on their time relative to now
      const now = Date.now();
      const fixedLocks = data.locks.map(lock => {
        const unlockTime = new Date(lock.unlockTime).getTime();
        
        // CASE 1: Future unlock time - should NOT be marked as opened
        // Reset opened/manuallyUnlocked so it will open at the scheduled time
        if (unlockTime > now) {
          console.log(`TabTimer: Import - "${lock.name || lock.url}" has future time, ensuring it's active`);
          return {
            ...lock,
            opened: false,
            manuallyUnlocked: false,
            autoRelockAt: null,
            missedSchedule: false
          };
        }
        
        // CASE 2: Past time, recurring - needs to be rescheduled to next occurrence
        if (unlockTime <= now && lock.recurring) {
          console.log(`TabTimer: Import - "${lock.name || lock.url}" is past recurring, will be rescheduled`);
          // Calculate the next future occurrence
          let nextUnlock = new Date(lock.unlockTime);
          let tempLock = { ...lock };
          let safetyCounter = 0;
          
          while (nextUnlock.getTime() <= now && safetyCounter < 365) {
            tempLock.unlockTime = nextUnlock.toISOString();
            nextUnlock = calculateNextUnlockTime(tempLock);
            safetyCounter++;
          }
          
          return {
            ...lock,
            unlockTime: nextUnlock.toISOString(),
            opened: false,
            manuallyUnlocked: false,
            autoRelockAt: null,
            missedSchedule: false
          };
        }
        
        // CASE 3: Past time, non-recurring - mark as opened (already happened)
        if (unlockTime <= now && !lock.recurring) {
          console.log(`TabTimer: Import - "${lock.name || lock.url}" is past non-recurring, marking as opened`);
          return {
            ...lock,
            opened: true,
            manuallyUnlocked: false
          };
        }
        
        return lock;
      });
      await chrome.storage.local.set({ locks: fixedLocks });
    }
    if (data.settings) {
      await chrome.storage.local.set({ settings: data.settings });
    }
    if (data.categories) {
      await chrome.storage.local.set({ categories: data.categories });
    }
    if (data.folders) {
      await chrome.storage.local.set({ folders: data.folders });
    }
    if (data.tags) {
      await chrome.storage.local.set({ tags: data.tags });
    }
    
    // Restore license/trial info to prevent trial abuse
    if (data.license && data.license.trialStarted) {
      console.log('TabTimer: Restoring trial info from backup - trialStarted:', data.license.trialStarted);
      
      // Always restore the trial start date from backup to prevent abuse
      // This ensures users can't get a new trial by reinstalling and importing
      await chrome.storage.local.set({ 
        license: {
          trialStarted: data.license.trialStarted,
          trialDays: data.license.trialDays || 7
        }
      });
      
      console.log('TabTimer: Trial info restored successfully');
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// STATISTICS
// ============================================

async function getStats() {
  const result = await chrome.storage.local.get(['locks']);
  const locks = result.locks || [];
  
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    total: locks.length,
    active: locks.filter(l => !l.opened && !l.manuallyUnlocked).length,
    opened: locks.filter(l => l.opened || l.manuallyUnlocked).length,
    recurring: locks.filter(l => l.recurring).length,
    totalOpens: locks.reduce((sum, l) => sum + (l.openCount || 0), 0),
    todayScheduled: locks.filter(l => {
      const unlockDate = new Date(l.unlockTime);
      return unlockDate >= today && unlockDate < new Date(today.getTime() + 86400000);
    }).length,
    byCategory: locks.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {}),
    byFolder: locks.reduce((acc, l) => {
      const folder = l.folder || 'default';
      acc[folder] = (acc[folder] || 0) + 1;
      return acc;
    }, {})
  };
}

// ============================================
// CLOUD SYNC (PREMIUM)
// ============================================

async function handleCloudSync(operation, data) {
  // Check for premium access
  const licenseResult = await chrome.storage.local.get(['license']);
  const license = licenseResult.license || {};
  
  if (!license.key && !license.trialStarted) {
    return { success: false, error: 'Cloud sync requires Premium' };
  }
  
  // Check if trial is expired
  if (license.trialStarted && !license.key) {
    const trialStart = new Date(license.trialStarted);
    const trialDays = license.trialDays || 7;
    const trialEnd = new Date(trialStart.getTime() + trialDays * 24 * 60 * 60 * 1000);
    if (new Date() > trialEnd) {
      return { success: false, error: 'Trial expired. Please upgrade to Premium.' };
    }
  }
  
  switch (operation) {
    case 'export':
      return await exportForCloudSync();
    case 'import':
      return await importFromCloudSync(data);
    case 'getLastSync':
      const syncResult = await chrome.storage.local.get(['lastCloudSync']);
      return { success: true, lastSync: syncResult.lastCloudSync || null };
    default:
      return { success: false, error: 'Unknown sync operation' };
  }
}

async function exportForCloudSync() {
  const result = await chrome.storage.local.get(['locks', 'categories', 'folders', 'settings']);
  
  const exportData = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    deviceId: await getDeviceId(),
    data: {
      locks: result.locks || [],
      categories: result.categories || [],
      folders: result.folders || [],
      settings: result.settings || {}
    }
  };
  
  // Store last sync time
  await chrome.storage.local.set({ lastCloudSync: new Date().toISOString() });
  
  return { success: true, exportData };
}

async function importFromCloudSync(importData) {
  if (!importData || !importData.data) {
    return { success: false, error: 'Invalid sync data' };
  }
  
  const currentResult = await chrome.storage.local.get(['locks']);
  const currentLocks = currentResult.locks || [];
  const incomingLocks = importData.data.locks || [];
  
  // Merge strategy: keep both, but deduplicate by URL + unlockTime
  const mergedLocks = [...currentLocks];
  let added = 0;
  
  for (const incoming of incomingLocks) {
    const exists = mergedLocks.some(l => 
      l.url === incoming.url && 
      l.unlockTime === incoming.unlockTime
    );
    
    if (!exists) {
      // Generate new ID to avoid conflicts
      incoming.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      mergedLocks.push(incoming);
      added++;
    }
  }
  
  await chrome.storage.local.set({
    locks: mergedLocks,
    categories: importData.data.categories || [],
    folders: importData.data.folders || [],
    lastCloudSync: new Date().toISOString()
  });
  
  return { success: true, added, total: mergedLocks.length };
}

async function getDeviceId() {
  const result = await chrome.storage.local.get(['deviceId']);
  if (result.deviceId) {
    return result.deviceId;
  }
  
  const newId = 'device_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  await chrome.storage.local.set({ deviceId: newId });
  return newId;
}

// ============================================
// DRAG AND DROP SORT ORDER
// ============================================

async function updateSortOrder(orderArray) {
  const result = await chrome.storage.local.get(['locks']);
  let locks = result.locks || [];
  
  // Create a map for quick lookup
  const lockMap = new Map(locks.map(l => [l.id, l]));
  
  // Reorder based on the provided order
  const reorderedLocks = [];
  for (const id of orderArray) {
    if (lockMap.has(id)) {
      const lock = lockMap.get(id);
      lock.sortOrder = reorderedLocks.length;
      reorderedLocks.push(lock);
      lockMap.delete(id);
    }
  }
  
  // Add any remaining locks that weren't in the order array
  for (const lock of lockMap.values()) {
    lock.sortOrder = reorderedLocks.length;
    reorderedLocks.push(lock);
  }
  
  await chrome.storage.local.set({ locks: reorderedLocks });
  
  return { success: true, count: reorderedLocks.length };
}
