'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { showToast } from './Toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if app was previously installed
    if (window.localStorage.getItem('app-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was just installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.localStorage.setItem('app-installed', 'true');
      showToast('App installed successfully!', 'success');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        showToast('Installing app...', 'success');
        setDeferredPrompt(null);
        setShowPrompt(false);
      } else {
        showToast('Installation cancelled', 'info');
        // Hide prompt for this session
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      showToast('Failed to show install prompt', 'error');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    window.localStorage.setItem('install-prompt-dismissed', expiry.toString());
  };

  // Don't show if already installed or if dismissed recently
  useEffect(() => {
    if (isInstalled) return;

    const dismissedUntil = window.localStorage.getItem('install-prompt-dismissed');
    if (dismissedUntil && parseInt(dismissedUntil) > Date.now()) {
      setShowPrompt(false);
    }
  }, [isInstalled]);

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
      <div className="bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-lg shadow-2xl p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-[#800020] p-2 rounded-lg">
              <Download className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Install Fumari App</h3>
              <p className="text-sm text-gray-400 mt-1">
                Install for quick access and better experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleInstallClick}
            className="flex-1 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#f4c430] font-bold transition-colors"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#600018] transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

