/**
 * Auto History Wipe - Popup Script
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  const statusTimedText = document.getElementById('statusTimedText');
  const statusRangeText = document.getElementById('statusRangeText');
  const popupClearNowBtn = document.getElementById('popupClearNowBtn');
  const popupOpenSettingsBtn = document.getElementById('popupOpenSettingsBtn');
  const quickClearIconBtn = document.getElementById('quickClearIconBtn');
  const countdownText = document.getElementById('countdownText');
  const countdownBadge = document.getElementById('countdownBadge');
  const extensionToggle = document.getElementById('extensionToggle');
  const popupToast = document.getElementById('popupToast');

  const popupVersionBadge = document.getElementById('popupVersionBadge');
  const reloadStatusText = document.getElementById('reloadStatusText');
  const btnReloadExtension = document.getElementById('btnReloadExtension');
  const reloadCard = document.getElementById('reloadCard');

  const linkRate = document.getElementById('linkRate');
  const linkShare = document.getElementById('linkShare');
  const linkHelp = document.getElementById('linkHelp');

  let currentSettings = null;
  let countdownInterval = null;
  let targetTimestamp = null;

  const myVersion = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : '1.0.0';
  if (popupVersionBadge) {
    popupVersionBadge.textContent = 'v' + myVersion;
  }

  // Format seconds to MM:SS
  function formatTime(totalSeconds) {
    if (totalSeconds <= 0) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    return `${mm}:${ss}`;
  }

  // Toast helper
  let toastTimeout = null;
  function showToast(msg) {
    if (toastTimeout) clearTimeout(toastTimeout);
    popupToast.textContent = msg;
    popupToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      popupToast.classList.remove('show');
    }, 2400);
  }

  // Convert time range key to friendly text
  function getFriendlyRange(rangeKey, customDays) {
    switch (rangeKey) {
      case '1day': return '1 Day';
      case '3days': return '3 Days';
      case '1week': return '1 Week';
      case '1month': return '1 Month';
      case 'custom': return `Custom (${customDays || 1} Days)`;
      case 'all':
      default:
        return 'All Time';
    }
  }

  // Update Countdown Timer
  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    function tick() {
      if (!currentSettings || !currentSettings.extensionEnabled || !currentSettings.enableTimed) {
        countdownText.textContent = '--:--';
        countdownBadge.style.opacity = '0.6';
        return;
      }

      countdownBadge.style.opacity = '1';

      if (!targetTimestamp) {
        countdownText.textContent = '--:--';
        return;
      }

      const diffSecs = Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
      countdownText.textContent = formatTime(diffSecs);

      if (diffSecs <= 0) {
        // Recalculate target if elapsed
        refreshState();
      }
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  const isExtensionEnv = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.sendMessage;

  // Refresh State from Background
  function refreshState() {
    if (!isExtensionEnv) {
      currentSettings = {
        extensionEnabled: true,
        timeRange: 'all',
        enableTimed: true,
        timedInterval: 5,
        timedUnit: 'minutes'
      };
      statusTimedText.textContent = 'Every 5 minutes';
      statusRangeText.textContent = 'All Time';
      extensionToggle.checked = true;
      if (!targetTimestamp) {
        targetTimestamp = Date.now() + 606 * 1000; // ~10:06
      }
      startCountdown();
      return;
    }

    chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (response) => {
      if (!response || !response.settings) return;
      currentSettings = response.settings;

      // Update Timed Info
      if (!currentSettings.extensionEnabled) {
        statusTimedText.textContent = 'Disabled';
      } else if (currentSettings.enableTimed) {
        statusTimedText.textContent = `Every ${currentSettings.timedInterval || 5} ${currentSettings.timedUnit || 'minutes'}`;
      } else {
        statusTimedText.textContent = 'Disabled';
      }

      // Update Range Info
      statusRangeText.textContent = getFriendlyRange(currentSettings.timeRange, currentSettings.customDays);

      // Update Toggle
      extensionToggle.checked = !!currentSettings.extensionEnabled;

      // Update Scheduled Target Timestamp
      if (response.alarm && response.alarm.scheduledTime) {
        targetTimestamp = response.alarm.scheduledTime;
      } else if (currentSettings.nextScheduledTime) {
        targetTimestamp = currentSettings.nextScheduledTime;
      } else {
        targetTimestamp = null;
      }

      // Update Version alert if available from server
      if (currentSettings.version && currentSettings.version !== myVersion) {
        if (reloadCard) reloadCard.classList.add('update-available');
        if (reloadStatusText) reloadStatusText.textContent = `Update v${currentSettings.version} siap!`;
      } else {
        if (reloadCard) reloadCard.classList.remove('update-available');
        if (reloadStatusText) reloadStatusText.textContent = 'Versi terbaru';
      }

      startCountdown();
    });
  }

  // Clear Browsing Data Now
  function handleClearNow() {
    popupClearNowBtn.disabled = true;
    popupClearNowBtn.textContent = 'Clearing...';

    if (!isExtensionEnv) {
      setTimeout(() => {
        popupClearNowBtn.disabled = false;
        popupClearNowBtn.textContent = 'Clear Data Now';
        showToast('Data cleared successfully!');
        targetTimestamp = Date.now() + 606 * 1000;
        startCountdown();
      }, 500);
      return;
    }

    chrome.runtime.sendMessage({ action: 'CLEAR_NOW' }, (response) => {
      popupClearNowBtn.disabled = false;
      popupClearNowBtn.textContent = 'Clear Data Now';

      if (response && response.success) {
        showToast('Data cleared successfully!');
        refreshState();
      } else {
        showToast(response?.message || 'Failed to clear data.');
      }
    });
  }

  popupClearNowBtn.addEventListener('click', handleClearNow);
  quickClearIconBtn.addEventListener('click', handleClearNow);

  // Open Settings Page
  popupOpenSettingsBtn.addEventListener('click', () => {
    if (isExtensionEnv && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../options/options.html', '_blank');
    }
  });

  // Toggle Extension Status
  extensionToggle.addEventListener('change', () => {
    if (!isExtensionEnv) {
      currentSettings.extensionEnabled = extensionToggle.checked;
      showToast(extensionToggle.checked ? 'Extension Enabled' : 'Extension Disabled');
      if (extensionToggle.checked) {
        statusTimedText.textContent = 'Every 5 minutes';
      } else {
        statusTimedText.textContent = 'Disabled';
      }
      startCountdown();
      return;
    }

    chrome.runtime.sendMessage({ action: 'TOGGLE_STATUS' }, (res) => {
      if (res && res.success) {
        showToast(res.settings.extensionEnabled ? 'Extension Enabled' : 'Extension Disabled');
        refreshState();
      }
    });
  });

  // Rate link
  linkRate.addEventListener('click', () => {
    showToast('Terima kasih atas dukungan bintang 5 Anda!');
  });

  // Share link
  linkShare.addEventListener('click', () => {
    const textToCopy = 'Auto History Wipe - Jaga privasi penjelajahan browser secara otomatis! by cs.baguosps@gmail.com';
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Info ekstensi disalin ke clipboard!');
    }).catch(() => {
      showToast('Auto History Wipe by cs.baguosps@gmail.com');
    });
  });

  // Help link
  linkHelp.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html#help'));
    }
  });

  // Reload Extension button handler
  if (btnReloadExtension) {
    btnReloadExtension.addEventListener('click', () => {
      btnReloadExtension.classList.add('spinning');
      btnReloadExtension.disabled = true;
      showToast('Memuat ulang ekstensi...');

      if (!isExtensionEnv) {
        setTimeout(() => {
          btnReloadExtension.classList.remove('spinning');
          btnReloadExtension.disabled = false;
          showToast('Ekstensi berhasil di-reload!');
          window.location.reload();
        }, 600);
        return;
      }

      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'RELOAD_EXTENSION' }, () => {
          if (chrome.runtime.reload) {
            chrome.runtime.reload();
          }
        });
        if (chrome.runtime.reload) {
          chrome.runtime.reload();
        }
      }, 300);
    });
  }

  // Initial load
  refreshState();
});
