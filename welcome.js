document.getElementById('openManagement').addEventListener('click', (e) => {
  e.preventDefault();
  // Open options.html directly as a new tab - no message handler needed
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  window.close();
});
