// popup.js - TabTimer v1.0.0

document.addEventListener('DOMContentLoaded', async () => {
  // Load theme
  const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
  if (settings.theme === 'dark') {
    document.body.classList.add('dark');
  }
  
  // Load stats
  const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
  document.getElementById('activeCount').textContent = stats.active || 0;
  document.getElementById('recurringCount').textContent = stats.recurring || 0;
  document.getElementById('totalOpens').textContent = stats.totalOpens || 0;
  
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', async () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const currentSettings = await chrome.runtime.sendMessage({ action: 'getSettings' });
    await chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: { ...currentSettings, theme: isDark ? 'dark' : 'light' }
    });
  });
  
  // Schedule page button
  document.getElementById('schedulePage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'showLockDialog', url: tab.url, title: tab.title });
    window.close();
  });
  
  // Unschedule page button
  document.getElementById('unschedulePage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const locks = await chrome.runtime.sendMessage({ action: 'getLocks' });
    const lock = locks.find(l => l.url === tab.url && !l.opened);
    
    if (lock) {
      await chrome.runtime.sendMessage({ action: 'deleteLock', id: lock.id });
      alert('Page unscheduled!');
    } else {
      alert('This page is not scheduled.');
    }
    window.close();
  });
  
  // Open options button
  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
  
  // View all link
  document.getElementById('viewAll').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
    window.close();
  });
});
