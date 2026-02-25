// offscreen.js - Handles audio playback for TabTimer

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playNotificationSound') {
    playNotificationSound();
    sendResponse({ success: true });
  }
  return true;
});

function playNotificationSound() {
  try {
    // Use Web Audio API to create a pleasant notification chime
    const audioContext = new AudioContext();
    
    // Create a pleasant two-tone chime
    playTone(audioContext, 523.25, 0, 0.15);    // C5
    playTone(audioContext, 659.25, 0.15, 0.15); // E5
    playTone(audioContext, 783.99, 0.3, 0.2);   // G5
    
    console.log('TabTimer: Played notification sound');
  } catch (e) {
    console.error('TabTimer: Could not play sound', e);
  }
}

function playTone(audioContext, frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  const now = audioContext.currentTime;
  
  // Fade in and out for smooth sound
  gainNode.gain.setValueAtTime(0, now + startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, now + startTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration);
  
  oscillator.start(now + startTime);
  oscillator.stop(now + startTime + duration);
}
