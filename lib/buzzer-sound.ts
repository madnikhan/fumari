/**
 * Generate and play an iPhone-like ping sound using Web Audio API
 */
export function playBuzzerSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create oscillator for ping sound (iPhone message-like)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // iPhone-like ping: sine wave, higher frequency, pleasant tone
    oscillator.type = 'sine'; // Sine wave for smooth, pleasant sound
    oscillator.frequency.setValueAtTime(800, now); // Start at 800Hz
    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.05); // Rise to 1000Hz
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15); // Drop to 600Hz
    
    // Volume envelope - quick attack, smooth decay (like iPhone ping)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1); // Smooth decay
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2); // Fade out
    
    // Play the sound
    oscillator.start(now);
    oscillator.stop(now + 0.2); // 200ms duration
    
    // Optional: Add a subtle second ping for emphasis (like iPhone double ping)
    setTimeout(() => {
      try {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(900, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(1100, audioContext.currentTime + 0.03);
        oscillator2.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.12);
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.08);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.15);
      } catch (e) {
        // Ignore errors for second ping
      }
    }, 100);
  } catch (error) {
    console.error('Error playing buzzer sound:', error);
    // Fallback: try using a simple beep if Web Audio API fails
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGH0fPTgjMGHm7A7+OZ');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't play (user interaction required)
      });
    } catch (e) {
      // Silently fail if audio is not available
    }
  }
}

/**
 * Play a softer notification sound (for acknowledgments)
 */
export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Softer, pleasant notification sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    // Silently fail if audio is not available
  }
}

