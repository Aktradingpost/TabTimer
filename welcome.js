document.getElementById('openManagement').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.sendMessage({ action: 'openManagement' });
  window.close();
});
