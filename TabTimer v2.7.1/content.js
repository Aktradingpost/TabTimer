// content.js - TabTimer v1.0.0

let currentDialog = null;
let lockOverlay = null;
let countdownInterval = null;

// Helper to escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Helper function to check if URLs match (flexible matching)
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
    // Fallback: simple string comparison
    return lockUrl === pageUrl || pageUrl.startsWith(lockUrl) || lockUrl.startsWith(pageUrl);
  }
}

// ============================================
// CHECK FOR LOCK ON PAGE LOAD
// ============================================

async function checkPageLock() {
  const currentUrl = window.location.href;
  const locks = await chrome.runtime.sendMessage({ action: 'getLocks' });
  
  // Find if this URL is locked - using flexible matching
  const activeLock = locks.find(l => {
    if (l.opened || l.manuallyUnlocked) return false;
    return urlsMatch(l.url, currentUrl);
  });
  
  if (activeLock) {
    showLockOverlay(activeLock);
  }
}

// Run check when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkPageLock);
} else {
  checkPageLock();
}

// ============================================
// LOCK OVERLAY
// ============================================

function showLockOverlay(lock) {
  // Remove existing overlay
  if (lockOverlay) {
    lockOverlay.remove();
    if (countdownInterval) clearInterval(countdownInterval);
  }
  
  const unlockTime = new Date(lock.unlockTime);
  
  // Create overlay
  lockOverlay = document.createElement('div');
  lockOverlay.id = 'tabtimer-lock-overlay';
  lockOverlay.innerHTML = `
    <div class="tabtimer-lock-box">
      <div class="tabtimer-lock-header">
        <span class="tabtimer-lock-icon">🔒</span>
        <span class="tabtimer-lock-title">SCHEDULED</span>
      </div>
      <div class="tabtimer-lock-name">${escapeHtml(lock.name || 'Scheduled Page')}</div>
      <div class="tabtimer-lock-countdown">
        <span class="tabtimer-clock-icon">🕐</span>
        <span id="tabtimer-countdown-text">Calculating...</span>
      </div>
      <div class="tabtimer-lock-ready">
        Opens: ${unlockTime.toLocaleDateString()} at ${unlockTime.toLocaleTimeString()}
      </div>
      <div class="tabtimer-lock-buttons">
        <button class="tabtimer-lock-btn tabtimer-unlock-btn" id="tabtimer-unlock-now">
          🔓 Unlock Now
        </button>
        <button class="tabtimer-lock-btn tabtimer-hide-btn" id="tabtimer-hide-overlay">
          👁️ Hide Overlay
        </button>
      </div>
      <div class="tabtimer-snooze-section" style="margin-top: 12px;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">🔓 Unlock temporarily for:</div>
        <div class="tabtimer-lock-buttons">
          <button class="tabtimer-lock-btn tabtimer-snooze-btn" data-minutes="5">5 min</button>
          <button class="tabtimer-lock-btn tabtimer-snooze-btn" data-minutes="15">15 min</button>
          <button class="tabtimer-lock-btn tabtimer-snooze-btn" data-minutes="30">30 min</button>
          <button class="tabtimer-lock-btn tabtimer-snooze-btn" data-minutes="60">1 hr</button>
        </div>
      </div>
      <div class="tabtimer-lock-buttons" style="margin-top: 10px;">
        <button class="tabtimer-lock-btn tabtimer-extend-btn" id="tabtimer-lock-24h">
          ⏰ Lock for 24 More Hours
        </button>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.id = 'tabtimer-lock-styles';
  style.textContent = `
    #tabtimer-lock-overlay {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: tabtimer-slideDown 0.3s ease;
    }
    
    @keyframes tabtimer-slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    
    .tabtimer-lock-box {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px;
      padding: 24px 32px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      min-width: 320px;
      text-align: center;
      border: 2px solid #475569;
    }
    
    .tabtimer-lock-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .tabtimer-lock-icon {
      font-size: 24px;
    }
    
    .tabtimer-lock-title {
      font-size: 14px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 2px;
    }
    
    .tabtimer-lock-name {
      font-size: 18px;
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 16px;
      word-break: break-word;
    }
    
    .tabtimer-lock-countdown {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .tabtimer-clock-icon {
      font-size: 32px;
      animation: tabtimer-pulse 2s infinite;
    }
    
    @keyframes tabtimer-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    #tabtimer-countdown-text {
      font-size: 36px;
      font-weight: 700;
      color: #4ade80;
      font-variant-numeric: tabular-nums;
    }
    
    .tabtimer-lock-ready {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    
    .tabtimer-lock-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    
    .tabtimer-lock-btn {
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }
    
    .tabtimer-unlock-btn {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .tabtimer-unlock-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
    
    .tabtimer-hide-btn {
      background: transparent;
      color: #94a3b8;
      border-color: #475569;
    }
    
    .tabtimer-hide-btn:hover {
      background: #475569;
      color: white;
    }
    
    .tabtimer-extend-btn {
      background: #f59e0b;
      color: white;
      border-color: #f59e0b;
      flex: 1;
    }
    
    .tabtimer-extend-btn:hover {
      background: #d97706;
      transform: translateY(-2px);
    }
    
    .tabtimer-snooze-btn {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
      padding: 8px 12px;
      font-size: 12px;
    }
    
    .tabtimer-snooze-btn:hover {
      background: #4f46e5;
      transform: translateY(-2px);
    }
  `;
  
  // Remove existing styles if any
  const existingStyle = document.getElementById('tabtimer-lock-styles');
  if (existingStyle) existingStyle.remove();
  
  document.head.appendChild(style);
  document.body.appendChild(lockOverlay);
  
  // Start countdown
  updateCountdown(lock);
  countdownInterval = setInterval(() => updateCountdown(lock), 1000);
  
  // Setup button handlers using event delegation on the overlay
  lockOverlay.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    
    if (target.id === 'tabtimer-unlock-now') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Unlock Now clicked');
      await unlockNow(lock);
    } else if (target.id === 'tabtimer-hide-overlay') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hide Overlay clicked');
      lockOverlay.style.display = 'none';
    } else if (target.id === 'tabtimer-lock-24h') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Lock 24h clicked');
      await lockFor24Hours(lock);
    } else if (target.classList.contains('tabtimer-snooze-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const minutes = parseInt(target.dataset.minutes);
      console.log(`Snooze for ${minutes} minutes clicked`);
      await snoozeLock(lock, minutes);
    }
  });
}

function updateCountdown(lock) {
  const now = Date.now();
  const unlockTime = new Date(lock.unlockTime).getTime();
  const diff = unlockTime - now;
  
  const countdownEl = document.getElementById('tabtimer-countdown-text');
  if (!countdownEl) return;
  
  if (diff <= 0) {
    countdownEl.textContent = 'Ready!';
    countdownEl.style.color = '#4ade80';
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    // Remove overlay after a short delay
    setTimeout(() => {
      if (lockOverlay) {
        lockOverlay.remove();
        lockOverlay = null;
      }
    }, 2000);
    return;
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    countdownEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    countdownEl.textContent = `${minutes}m ${seconds}s`;
  } else {
    countdownEl.textContent = `${seconds}s`;
  }
}

async function unlockNow(lock) {
  console.log('unlockNow called with lock:', lock.id);
  
  try {
    // Mark as manually unlocked
    const result = await chrome.runtime.sendMessage({
      action: 'updateLock',
      lock: {
        id: lock.id,
        manuallyUnlocked: true,
        unlockedAt: new Date().toISOString()
      }
    });
    
    console.log('unlockNow result:', result);
    
    if (result && result.success) {
      // Stop the countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      
      // Just remove the overlay completely
      if (lockOverlay) {
        lockOverlay.remove();
        lockOverlay = null;
      }
      
      showNotification('Page unlocked! Right-click to re-lock when done.', true);
    } else {
      showNotification('Failed to unlock: ' + (result?.error || 'Unknown error'), true);
    }
  } catch (error) {
    console.error('unlockNow error:', error);
    showNotification('Error: ' + error.message, true);
  }
}

async function lockFor24Hours(lock) {
  console.log('lockFor24Hours called with lock:', lock.id);
  
  try {
    // Extend the lock time by 24 hours
    const currentUnlockTime = new Date(lock.unlockTime);
    const newUnlockTime = new Date(currentUnlockTime.getTime() + 24 * 60 * 60 * 1000);
    
    const result = await chrome.runtime.sendMessage({
      action: 'updateLock',
      lock: {
        id: lock.id,
        unlockTime: newUnlockTime.toISOString()
      }
    });
    
    console.log('lockFor24Hours result:', result);
    
    if (result && result.success) {
      // Update the lock object for countdown
      lock.unlockTime = newUnlockTime.toISOString();
      
      // Update the "Opens" text
      const readyEl = lockOverlay.querySelector('.tabtimer-lock-ready');
      if (readyEl) {
        readyEl.textContent = `Opens: ${newUnlockTime.toLocaleDateString()} at ${newUnlockTime.toLocaleTimeString()}`;
      }
      
      showNotification('Extended by 24 hours!', true);
    } else {
      showNotification('Failed to extend: ' + (result?.error || 'Unknown error'), true);
    }
  } catch (error) {
    console.error('lockFor24Hours error:', error);
    showNotification('Error: ' + error.message, true);
  }
}

async function snoozeLock(lock, minutes) {
  console.log(`snoozeLock called with lock: ${lock.id}, minutes: ${minutes}`);
  
  try {
    // Snooze = temporarily UNLOCK the page for X minutes
    // After the snooze period, the lock will re-engage
    const snoozeEndTime = new Date(Date.now() + minutes * 60 * 1000);
    
    const result = await chrome.runtime.sendMessage({
      action: 'updateLock',
      lock: {
        id: lock.id,
        manuallyUnlocked: true,
        unlockedAt: new Date().toISOString(),
        lockMinutes: minutes, // This will cause auto-relock after X minutes
        snoozeUntil: snoozeEndTime.toISOString() // Track when snooze ends
      }
    });
    
    console.log('snoozeLock result:', result);
    
    if (result && result.success) {
      // Hide the overlay since page is now unlocked
      if (lockOverlay) {
        lockOverlay.style.display = 'none';
      }
      
      // Stop the countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      
      showNotification(`🔓 Unlocked for ${minutes} minutes! Will re-lock at ${snoozeEndTime.toLocaleTimeString()}`, true);
    } else {
      showNotification('Failed to snooze: ' + (result?.error || 'Unknown error'), true);
    }
  } catch (error) {
    console.error('snoozeLock error:', error);
    showNotification('Error: ' + error.message, true);
  }
}

// ============================================
// LISTEN FOR MESSAGES
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showLockDialog') {
    showLockDialog(message.url, message.title);
  } else if (message.action === 'checkLock') {
    checkPageLock();
  } else if (message.action === 'playSound') {
    playNotificationSound();
  }
});

// Play notification sound
function playNotificationSound() {
  try {
    // Use Web Audio API to create a pleasant notification chime
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the chime
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification frequencies (C5, E5, G5 chord)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log('TabTimer: Played notification sound');
  } catch (e) {
    console.log('TabTimer: Could not play sound', e);
  }
}

// ============================================
// SCHEDULE DIALOG
// ============================================

async function showLockDialog(url, title) {
  // Remove existing dialog if any
  if (currentDialog) {
    currentDialog.remove();
  }
  
  // Get theme setting
  const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
  const isDark = settings.theme === 'dark';
  
  // Get existing locks for duplicate detection and time suggestions
  const existingLocks = await chrome.runtime.sendMessage({ action: 'getLocks' });
  
  // Check for duplicate URL
  const duplicateLock = existingLocks.find(l => l.url === url && !l.opened && !l.manuallyUnlocked);
  
  // Find smart available times
  const suggestions = findSmartAvailableTimes(existingLocks);
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'tabtimer-overlay';
  
  // Build time suggestion buttons
  let timeSuggestionsHTML = '';
  if (suggestions.length > 0) {
    timeSuggestionsHTML = suggestions.map((s, i) => `
      <div class="tabtimer-time-suggestion" data-time="${s.time.toISOString()}" data-index="${i}">
        <div class="time-label">${s.label}</div>
        <div class="time-value">${formatTimeWithSeconds(s.time)}</div>
      </div>
    `).join('');
  } else {
    // Default to tomorrow 7am if no schedules exist
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    timeSuggestionsHTML = `
      <div class="tabtimer-time-suggestion" data-time="${tomorrow.toISOString()}" data-index="0">
        <div class="time-label">📅 Tomorrow</div>
        <div class="time-value">${formatTimeWithSeconds(tomorrow)}</div>
      </div>
    `;
  }
  
  // Create dialog HTML
  overlay.innerHTML = `
    <div class="tabtimer-dialog ${isDark ? 'dark' : ''}">
      <div class="tabtimer-header">
        <h2>🕐 Schedule Page</h2>
        <button class="tabtimer-close" id="tabtimer-close">×</button>
      </div>
      
      <div class="tabtimer-body">
        <div class="tabtimer-url">${escapeHtml(url)}</div>
        
        ${duplicateLock ? `
          <div class="tabtimer-warning">
            <h4>⚠️ Duplicate Detected</h4>
            This URL is already scheduled for ${formatTimeWithSeconds(new Date(duplicateLock.unlockTime))}
          </div>
        ` : ''}
        
        <div id="tabtimer-errors"></div>
        <div id="tabtimer-conflict-warning"></div>
        
        <!-- Category Selection -->
        <div class="tabtimer-field">
          <label>Category</label>
          <div class="tabtimer-btn-group" id="tabtimer-categories">
            <button type="button" class="tabtimer-btn-option" data-value="Daily">📅 Daily</button>
            <button type="button" class="tabtimer-btn-option" data-value="Weekly">📆 Weekly</button>
            <button type="button" class="tabtimer-btn-option" data-value="Monthly">🗓️ Monthly</button>
            <button type="button" class="tabtimer-btn-option" data-value="Once">🎯 Once</button>
            <button type="button" class="tabtimer-btn-option" data-value="Other">📌 Other</button>
          </div>
          <input type="hidden" id="tabtimer-category" value="">
        </div>
        
        <!-- Simple Name Field -->
        <div class="tabtimer-field">
          <label>Name (with or without expiration date)</label>
          <input type="text" id="tabtimer-name" placeholder="e.g., 2026-01-31 My Task or just My Task" value="${escapeHtml(title || '')}">
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            💡 Names starting with YYYY-MM-DD will auto-delete after that date
          </div>
        </div>
        
        <!-- Open At with Smart Suggestions -->
        <div class="tabtimer-field">
          <label>Open at (click a suggestion or enter custom time)</label>
          <div class="tabtimer-time-suggestions" id="tabtimer-suggestions">
            ${timeSuggestionsHTML}
          </div>
          <div style="margin-top: 12px;">
            <label style="font-size: 12px; color: #64748b;">Custom time (with seconds):</label>
            <div style="display: flex; gap: 8px; margin-top: 6px; align-items: center;">
              <input type="date" id="tabtimer-date" style="flex: 1;">
              <input type="time" id="tabtimer-time" step="1" style="width: 130px;">
            </div>
          </div>
        </div>
        
        <!-- Repeat Options -->
        <div class="tabtimer-field">
          <label>Repeat Schedule</label>
          <div class="tabtimer-btn-group" id="tabtimer-repeat">
            <button type="button" class="tabtimer-btn-option" data-value="none">🚫 No Repeat</button>
            <button type="button" class="tabtimer-btn-option active" data-value="daily">📅 Daily</button>
            <button type="button" class="tabtimer-btn-option" data-value="weekdays">💼 Weekdays</button>
            <button type="button" class="tabtimer-btn-option" data-value="weekly">📆 Weekly</button>
            <button type="button" class="tabtimer-btn-option" data-value="monthly">🗓️ Monthly</button>
            <button type="button" class="tabtimer-btn-option" data-value="other">⚙️ Other</button>
          </div>
          <div id="tabtimer-other-options" style="display: none; margin-top: 10px;">
            <select id="tabtimer-other-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <option value="biweekly">Every 2 Weeks</option>
              <option value="every3weeks">Every 3 Weeks</option>
              <option value="bimonthly">Every 2 Months</option>
              <option value="quarterly">Quarterly (Every 3 Months)</option>
              <option value="every6months">Every 6 Months</option>
              <option value="yearly">Yearly</option>
              <option value="leapyear">Leap Year (Every 4 Years)</option>
            </select>
          </div>
          <input type="hidden" id="tabtimer-repeat-value" value="daily">
        </div>
        
        <!-- Lock Duration -->
        <div class="tabtimer-field">
          <label>Auto re-lock after unlocking</label>
          <div class="tabtimer-lock-duration" id="tabtimer-lock-duration">
            <button type="button" class="tabtimer-lock-btn" data-value="0">Never</button>
            <button type="button" class="tabtimer-lock-btn" data-value="1">1 min</button>
            <button type="button" class="tabtimer-lock-btn" data-value="2">2 min</button>
            <button type="button" class="tabtimer-lock-btn active" data-value="5">5 min</button>
            <button type="button" class="tabtimer-lock-btn" data-value="10">10 min</button>
            <button type="button" class="tabtimer-lock-btn" data-value="15">15 min</button>
            <button type="button" class="tabtimer-lock-btn" data-value="30">30 min</button>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
            💡 If you manually unlock a page, it will auto re-lock after this time
          </div>
          <input type="hidden" id="tabtimer-lock-minutes" value="5">
        </div>
        
        <div class="tabtimer-field">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="tabtimer-play-sound" style="width: 18px; height: 18px;">
            🔊 Play sound when tab opens
          </label>
        </div>
      </div>
      
      <div class="tabtimer-footer">
        <button class="tabtimer-btn tabtimer-btn-secondary" id="tabtimer-cancel">Cancel</button>
        <button class="tabtimer-btn tabtimer-btn-primary" id="tabtimer-save">🕐 Schedule</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  currentDialog = overlay;
  
  // Setup event listeners
  setupDialogEvents(overlay, url, isDark, existingLocks);
}

function findSmartAvailableTimes(existingLocks) {
  const activeLocks = existingLocks.filter(l => !l.opened && !l.manuallyUnlocked);
  
  if (activeLocks.length === 0) {
    return [];
  }
  
  // Get all scheduled times sorted
  const scheduledTimes = activeLocks
    .map(l => new Date(l.unlockTime).getTime())
    .sort((a, b) => a - b);
  
  const suggestions = [];
  const now = Date.now();
  
  // Find time BEFORE the first scheduled time (1 minute before)
  const firstTime = scheduledTimes[0];
  const beforeFirst = new Date(firstTime - 60000);
  if (beforeFirst.getTime() > now) {
    suggestions.push({
      time: beforeFirst,
      label: '⬅️ Before first'
    });
  }
  
  // Find GAPS between scheduled times
  for (let i = 0; i < scheduledTimes.length - 1; i++) {
    const current = scheduledTimes[i];
    const next = scheduledTimes[i + 1];
    const gap = next - current;
    
    if (gap > 120000) {
      const middleTime = new Date(current + 60000);
      if (middleTime.getTime() > now) {
        suggestions.push({
          time: middleTime,
          label: '🕳️ Gap available'
        });
      }
    }
  }
  
  // Find time AFTER the last scheduled time
  const lastTime = scheduledTimes[scheduledTimes.length - 1];
  const afterLast = new Date(lastTime + 60000);
  suggestions.push({
    time: afterLast,
    label: 'After last ➡️'
  });
  
  return suggestions.slice(0, 3);
}

function formatTimeWithSeconds(date) {
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function checkTimeConflict(existingLocks, targetTime) {
  const targetMs = new Date(targetTime).getTime();
  
  for (const lock of existingLocks) {
    if (lock.opened || lock.manuallyUnlocked) continue;
    
    const lockTime = new Date(lock.unlockTime).getTime();
    if (Math.abs(lockTime - targetMs) < 30000) {
      return {
        hasConflict: true,
        conflictingLock: lock
      };
    }
  }
  
  return { hasConflict: false };
}

function setupDialogEvents(overlay, url, isDark, existingLocks) {
  const closeBtn = overlay.querySelector('#tabtimer-close');
  const cancelBtn = overlay.querySelector('#tabtimer-cancel');
  const saveBtn = overlay.querySelector('#tabtimer-save');
  const errorsDiv = overlay.querySelector('#tabtimer-errors');
  const conflictDiv = overlay.querySelector('#tabtimer-conflict-warning');
  const dateInput = overlay.querySelector('#tabtimer-date');
  const timeInput = overlay.querySelector('#tabtimer-time');
  
  // Close handlers
  closeBtn.addEventListener('click', closeDialog);
  cancelBtn.addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
  
  function closeDialog() {
    overlay.remove();
    currentDialog = null;
  }
  
  // Category buttons
  overlay.querySelectorAll('#tabtimer-categories .tabtimer-btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('#tabtimer-categories .tabtimer-btn-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      overlay.querySelector('#tabtimer-category').value = btn.dataset.value;
    });
  });
  
  // Time suggestion clicks
  overlay.querySelectorAll('.tabtimer-time-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.tabtimer-time-suggestion').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      const isoTime = btn.dataset.time;
      const localTime = new Date(isoTime);
      
      const year = localTime.getFullYear();
      const month = String(localTime.getMonth() + 1).padStart(2, '0');
      const day = String(localTime.getDate()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}`;
      
      const hours = String(localTime.getHours()).padStart(2, '0');
      const minutes = String(localTime.getMinutes()).padStart(2, '0');
      const seconds = String(localTime.getSeconds()).padStart(2, '0');
      timeInput.value = `${hours}:${minutes}:${seconds}`;
      
      conflictDiv.innerHTML = '';
    });
  });
  
  // Check for conflicts when custom time is entered
  function checkAndShowConflict() {
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;
    
    if (!dateVal || !timeVal) {
      conflictDiv.innerHTML = '';
      return;
    }
    
    overlay.querySelectorAll('.tabtimer-time-suggestion').forEach(b => b.classList.remove('selected'));
    
    const timeParts = timeVal.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const seconds = parseInt(timeParts[2]) || 0;
    
    const dateParts = dateVal.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    
    const targetDate = new Date(year, month, day, hours, minutes, seconds, 0);
    
    const conflict = checkTimeConflict(existingLocks, targetDate);
    
    if (conflict.hasConflict) {
      const conflictTime = formatTimeWithSeconds(new Date(conflict.conflictingLock.unlockTime));
      conflictDiv.innerHTML = `
        <div class="tabtimer-warning">
          <h4>⚠️ Time Conflict!</h4>
          Another page is scheduled at ${conflictTime}<br>
          <small>"${conflict.conflictingLock.name || conflict.conflictingLock.url}"</small>
        </div>
      `;
    } else {
      conflictDiv.innerHTML = '';
    }
  }
  
  dateInput.addEventListener('change', checkAndShowConflict);
  timeInput.addEventListener('change', checkAndShowConflict);
  timeInput.addEventListener('input', checkAndShowConflict);
  
  // Repeat buttons
  const otherOptionsDiv = overlay.querySelector('#tabtimer-other-options');
  const otherSelect = overlay.querySelector('#tabtimer-other-select');
  
  overlay.querySelectorAll('#tabtimer-repeat .tabtimer-btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('#tabtimer-repeat .tabtimer-btn-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (btn.dataset.value === 'other') {
        // Show the Other options dropdown
        otherOptionsDiv.style.display = 'block';
        overlay.querySelector('#tabtimer-repeat-value').value = otherSelect.value;
      } else {
        // Hide the Other options dropdown
        otherOptionsDiv.style.display = 'none';
        overlay.querySelector('#tabtimer-repeat-value').value = btn.dataset.value;
      }
    });
  });
  
  // When Other dropdown changes, update the hidden value
  if (otherSelect) {
    otherSelect.addEventListener('change', () => {
      overlay.querySelector('#tabtimer-repeat-value').value = otherSelect.value;
    });
  }
  
  // Lock duration buttons
  overlay.querySelectorAll('#tabtimer-lock-duration .tabtimer-lock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('#tabtimer-lock-duration .tabtimer-lock-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      overlay.querySelector('#tabtimer-lock-minutes').value = btn.dataset.value;
    });
  });
  
  // Save handler
  saveBtn.addEventListener('click', async () => {
    errorsDiv.innerHTML = '';
    const errors = [];
    
    const category = overlay.querySelector('#tabtimer-category').value;
    if (!category) {
      errors.push('Please select a category');
    }
    
    const name = overlay.querySelector('#tabtimer-name').value.trim();
    
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;
    
    if (!dateVal || !timeVal) {
      errors.push('Please select a date and time (click a suggestion or enter custom time)');
    }
    
    let unlockTime = null;
    if (dateVal && timeVal) {
      const timeParts = timeVal.split(':');
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      
      const dateParts = dateVal.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);
      
      unlockTime = new Date(year, month, day, hours, minutes, seconds, 0);
      
      if (unlockTime.getTime() <= Date.now()) {
        errors.push('Schedule time must be in the future');
      }
    }
    
    const repeatValue = overlay.querySelector('#tabtimer-repeat-value').value;
    const recurring = repeatValue !== 'none';
    
    const lockMinutes = parseInt(overlay.querySelector('#tabtimer-lock-minutes').value);
    
    if (errors.length > 0) {
      errorsDiv.innerHTML = `
        <div class="tabtimer-error">
          <strong>⚠️ Please fix the following:</strong><br>
          ${errors.map(e => `• ${e}`).join('<br>')}
        </div>
      `;
      return;
    }
    
    if (unlockTime) {
      const conflict = checkTimeConflict(existingLocks, unlockTime);
      if (conflict.hasConflict) {
        const proceed = confirm(`Another page is scheduled at this time:\n"${conflict.conflictingLock.name || conflict.conflictingLock.url}"\n\nSchedule anyway?`);
        if (!proceed) return;
      }
    
      // Check for duplicate URL and name (check ALL schedules, not just active ones)
      const duplicates = existingLocks.filter(l => 
        l.url.toLowerCase() === url.toLowerCase() && 
        (l.name || '').toLowerCase() === (name || '').toLowerCase()
      );
      
      if (duplicates.length > 0) {
        // Check if exact same time exists
        const exactMatch = duplicates.find(d => {
          const dTime = new Date(d.unlockTime);
          return dTime.getHours() === unlockTime.getHours() && 
                 dTime.getMinutes() === unlockTime.getMinutes();
        });
        
        if (exactMatch) {
          // Find next available time slot
          let nextTime = new Date(unlockTime);
          let attempts = 0;
          while (attempts < 60) {
            nextTime.setMinutes(nextTime.getMinutes() + 1);
            const hasConflict = duplicates.some(d => {
              const dTime = new Date(d.unlockTime);
              return dTime.getHours() === nextTime.getHours() && 
                     dTime.getMinutes() === nextTime.getMinutes();
            });
            if (!hasConflict) break;
            attempts++;
          }
          
          const currentTimeStr = unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const nextTimeStr = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          const proceed = confirm(
            `⚠️ Duplicate Schedule Detected!\n\n` +
            `You already have a schedule with this URL and name.\n\n` +
            `Current time selected: ${currentTimeStr}\n` +
            `Next available time: ${nextTimeStr}\n\n` +
            `Click OK to schedule at ${nextTimeStr} instead,\n` +
            `or Cancel to go back.`
          );
          
          if (!proceed) return;
          
          // Update to next available time
          unlockTime = nextTime;
        } else {
          // Different time but same URL/name - just warn
          const proceed = confirm(
            `⚠️ Similar Schedule Exists!\n\n` +
            `You already have ${duplicates.length} schedule(s) with this URL and name.\n\n` +
            `Do you want to create another schedule anyway?`
          );
          if (!proceed) return;
        }
      }
    }
    
    const playSound = overlay.querySelector('#tabtimer-play-sound').checked;
    
    const result = await chrome.runtime.sendMessage({
      action: 'createLock',
      lock: {
        url: url,
        name: name,
        category: category,
        unlockTime: unlockTime.toISOString(),
        recurring: recurring,
        repeatType: repeatValue,
        lockMinutes: lockMinutes,
        playSound: playSound
      }
    });
    
    if (result.success) {
      closeDialog();
      showNotification('Page scheduled!', isDark);
      // Show the lock overlay for this page
      checkPageLock();
    } else {
      errorsDiv.innerHTML = `
        <div class="tabtimer-error">
          <strong>⚠️ Error:</strong> ${result.error || 'Failed to create schedule'}
        </div>
      `;
    }
  });
}

function showNotification(message, isDark) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isDark ? '#1e293b' : '#ffffff'};
    color: ${isDark ? '#f1f5f9' : '#1e293b'};
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: tabtimer-slideIn 0.3s ease;
  `;
  notification.innerHTML = `🕐 ${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'tabtimer-slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes tabtimer-slideOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
