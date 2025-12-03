'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { showToast } from './Toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standaloneCheck);
    
    if (standaloneCheck) {
      setIsInstalled(true);
      return;
    }

    // Check if app was previously installed
    if (window.localStorage.getItem('app-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // For iOS, show custom prompt (iOS doesn't support beforeinstallprompt)
    if (iOS && !standaloneCheck) {
      const dismissedUntil = window.localStorage.getItem('install-prompt-dismissed');
      if (!dismissedUntil || parseInt(dismissedUntil) < Date.now()) {
        setShowPrompt(true);
      }
      return;
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
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
    // iOS - show instructions
    if (isIOS) {
      showToast('Tap the Share button, then "Add to Home Screen"', 'info');
      setShowPrompt(false);
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      window.localStorage.setItem('install-prompt-dismissed', expiry.toString());
      return;
    }

    // Android/Chrome - use native prompt
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
        window.localStorage.setItem('app-installed', 'true');
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
    if (isInstalled || isStandalone) {
      setShowPrompt(false);
      return;
    }

    const dismissedUntil = window.localStorage.getItem('install-prompt-dismissed');
    if (dismissedUntil && parseInt(dismissedUntil) > Date.now()) {
      setShowPrompt(false);
    }
  }, [isInstalled, isStandalone]);

  // Don't show if already installed or dismissed
  if (isInstalled || isStandalone || !showPrompt) {
    return null;
  }

  // For iOS, show even without deferredPrompt
  if (isIOS && !deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[100] animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[#212226] border-2 border-[#FFE176] rounded-lg shadow-2xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-[#9B4E3F] p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-[#FFE176]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add to Home Screen</h3>
                <p className="text-sm text-[#E5E5E5] mt-1">
                  Tap the Share button <span className="text-[#FFE176]">□↑</span> then "Add to Home Screen"
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-[#E5E5E5] hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleInstallClick}
              className="flex-1 px-4 py-2 bg-[#FFE176] text-[#212226] rounded-lg hover:bg-[#FFE88A] font-bold transition-colors shadow-lg"
            >
              Show Instructions
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-[#9B4E3F] text-white rounded-lg hover:bg-[#B85E4F] transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For Android/Chrome - need deferredPrompt
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[100] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#212226] border-2 border-[#FFE176] rounded-lg shadow-2xl p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="bg-[#9B4E3F] p-2 rounded-lg">
              <Download className="w-5 h-5 text-[#FFE176]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Install Fumari App</h3>
              <p className="text-sm text-[#E5E5E5] mt-1">
                Install for quick access and better experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#E5E5E5] hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleInstallClick}
            className="flex-1 px-4 py-2 bg-[#FFE176] text-[#212226] rounded-lg hover:bg-[#FFE88A] font-bold transition-colors shadow-lg"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-[#9B4E3F] text-white rounded-lg hover:bg-[#B85E4F] transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

