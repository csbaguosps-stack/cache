/**
 * Auto History Wipe - Options Script
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const timeRangeButtons = document.querySelectorAll('#timeRangeGroup .pill-btn');
  const customDaysBtn = document.getElementById('customDaysBtn');
  const customDaysInput = document.getElementById('customDaysInput');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const enableAutoClear = document.getElementById('enableAutoClear');
  const enableTimedClear = document.getElementById('enableTimedClear');
  const timedInputsBox = document.getElementById('timedInputsBox');
  const timedInterval = document.getElementById('timedInterval');
  const timedUnit = document.getElementById('timedUnit');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const clearDataNowBtn = document.getElementById('clearDataNowBtn');

  // Help Modal Elements
  const helpSupportLink = document.getElementById('helpSupportLink');
  const helpModal = document.getElementById('helpModal');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const helpCloseActionBtn = document.getElementById('helpCloseActionBtn');

  // Toast Elements
  const toast = document.getElementById('toastNotification');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  let selectedTimeRange = 'all';

  // Show Toast Helper
  let toastTimer = null;
  function showToast(message, isError = false) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toastIcon.textContent = isError ? '✕' : '✓';
    toast.className = `toast show ${isError ? 'toast-danger' : 'toast-success'}`;
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  const isExtensionEnv = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.sendMessage;

  // Load Settings
  async function loadSettings() {
    if (!isExtensionEnv) {
      // Standalone browser preview defaults matching screenshot
      selectedTimeRange = 'all';
      timeRangeButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-range') === 'all');
      });
      document.getElementById('dtype-cache').checked = true;
      enableTimedClear.checked = true;
      timedInterval.value = 5;
      timedUnit.value = 'minutes';
      toggleTimedInputs(true);
      return;
    }

    try {
      chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (response) => {
        if (!response || !response.settings) return;
        const s = response.settings;

        // Time Range
        selectedTimeRange = s.timeRange || 'all';
        timeRangeButtons.forEach((btn) => {
          btn.classList.toggle('active', btn.getAttribute('data-range') === selectedTimeRange);
        });
        if (selectedTimeRange === 'custom') {
          customDaysBtn.classList.add('active');
        } else {
          customDaysBtn.classList.remove('active');
        }
        if (s.customDays) {
          customDaysInput.value = s.customDays;
        }

        // Data Types
        const d = s.dataTypes || {};
        ['history', 'downloads', 'cache', 'cookies', 'localStorage', 'passwords', 'formData'].forEach((type) => {
          const el = document.getElementById(`dtype-${type}`);
          if (el) el.checked = !!d[type];
        });

        // Auto Clear Settings
        enableAutoClear.checked = !!s.autoClearOnClose;
        enableTimedClear.checked = !!s.enableTimed;
        timedInterval.value = s.timedInterval || 5;
        if (s.timedUnit) timedUnit.value = s.timedUnit;

        toggleTimedInputs(enableTimedClear.checked);
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  // Time Range selection
  timeRangeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      timeRangeButtons.forEach((b) => b.classList.remove('active'));
      customDaysBtn.classList.remove('active');
      btn.classList.add('active');
      selectedTimeRange = btn.getAttribute('data-range');
    });
  });

  // Custom Days selection
  customDaysBtn.addEventListener('click', () => {
    timeRangeButtons.forEach((b) => b.classList.remove('active'));
    customDaysBtn.classList.add('active');
    selectedTimeRange = 'custom';
    customDaysInput.focus();
  });

  customDaysInput.addEventListener('input', () => {
    if (customDaysInput.value && Number(customDaysInput.value) > 0) {
      timeRangeButtons.forEach((b) => b.classList.remove('active'));
      customDaysBtn.classList.add('active');
      selectedTimeRange = 'custom';
    }
  });

  // Select / Deselect All
  selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.data-types-grid input[type="checkbox"]').forEach((cb) => {
      cb.checked = true;
    });
  });

  deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.data-types-grid input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
  });

  // Enable Timed Auto-Clear toggle
  function toggleTimedInputs(enabled) {
    timedInputsBox.style.opacity = enabled ? '1' : '0.4';
    timedInterval.disabled = !enabled;
    timedUnit.disabled = !enabled;
  }

  enableTimedClear.addEventListener('change', () => {
    toggleTimedInputs(enableTimedClear.checked);
  });

  // Save Settings Handler
  saveSettingsBtn.addEventListener('click', () => {
    const dataTypes = {
      history: document.getElementById('dtype-history').checked,
      downloads: document.getElementById('dtype-downloads').checked,
      cache: document.getElementById('dtype-cache').checked,
      cookies: document.getElementById('dtype-cookies').checked,
      localStorage: document.getElementById('dtype-localStorage').checked,
      passwords: document.getElementById('dtype-passwords').checked,
      formData: document.getElementById('dtype-formData').checked
    };

    const payload = {
      timeRange: selectedTimeRange,
      customDays: Math.max(1, parseInt(customDaysInput.value, 10) || 1),
      dataTypes,
      autoClearOnClose: enableAutoClear.checked,
      enableTimed: enableTimedClear.checked,
      timedInterval: Math.max(1, parseInt(timedInterval.value, 10) || 5),
      timedUnit: timedUnit.value
    };

    saveSettingsBtn.disabled = true;
    saveSettingsBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
      Saving...
    `;

    if (!isExtensionEnv) {
      setTimeout(() => {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Save Settings
        `;
        showToast('Settings saved successfully!');
      }, 500);
      return;
    }

    chrome.runtime.sendMessage({ action: 'SAVE_SETTINGS', settings: payload }, (res) => {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Save Settings
      `;

      if (res && res.success) {
        showToast('Settings saved successfully!');
      } else {
        showToast('Failed to save settings.', true);
      }
    });
  });

  // Clear Data Now Handler
  clearDataNowBtn.addEventListener('click', () => {
    clearDataNowBtn.disabled = true;
    clearDataNowBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      Clearing...
    `;

    if (!isExtensionEnv) {
      setTimeout(() => {
        clearDataNowBtn.disabled = false;
        clearDataNowBtn.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          Clear Data Now
        `;
        showToast('Browsing data cleared successfully!');
      }, 500);
      return;
    }

    chrome.runtime.sendMessage({ action: 'CLEAR_NOW' }, (response) => {
      clearDataNowBtn.disabled = false;
      clearDataNowBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Clear Data Now
      `;

      if (response && response.success) {
        showToast('Browsing data cleared successfully!');
      } else {
        showToast(response?.message || 'Failed to clear data.', true);
      }
    });
  });

  // Modal handlers
  function openHelp() {
    helpModal.style.display = 'flex';
  }

  function closeHelp() {
    helpModal.style.display = 'none';
  }

  helpSupportLink.addEventListener('click', (e) => {
    e.preventDefault();
    openHelp();
  });

  closeHelpBtn.addEventListener('click', closeHelp);
  helpCloseActionBtn.addEventListener('click', closeHelp);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelp();
  });

  // Manual Sync button handler
  const manualSyncBtn = document.getElementById('manualSyncBtn');
  if (manualSyncBtn) {
    manualSyncBtn.addEventListener('click', () => {
      manualSyncBtn.disabled = true;
      manualSyncBtn.textContent = '⏳ Menyinkronkan...';

      if (!isExtensionEnv) {
        setTimeout(() => {
          manualSyncBtn.disabled = false;
          manualSyncBtn.textContent = '🔄 Sync dari Server';
          showToast('Tersinkronisasi dengan server cache.app.winseeoptik.com!');
        }, 600);
        return;
      }

      chrome.runtime.sendMessage({ action: 'TRIGGER_REMOTE_SYNC' }, () => {
        setTimeout(() => {
          manualSyncBtn.disabled = false;
          manualSyncBtn.textContent = '🔄 Sync dari Server';
          showToast('Pengaturan terbaru berhasil ditarik dari dashboard server!');
          loadSettings();
        }, 500);
      });
    });
  }

  // Version display
  const optionsVersionChip = document.getElementById('optionsVersionChip');
  if (optionsVersionChip) {
    const v = (isExtensionEnv && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : '1.0.0';
    optionsVersionChip.textContent = `v${v}`;
  }

  // Manual Reload button handler (Chrome extension reload)
  const manualReloadBtn = document.getElementById('manualReloadBtn');
  if (manualReloadBtn) {
    manualReloadBtn.addEventListener('click', () => {
      manualReloadBtn.disabled = true;
      manualReloadBtn.textContent = '⚡ Reloading...';
      showToast('Memuat ulang ekstensi dari berkas...');

      if (!isExtensionEnv) {
        setTimeout(() => {
          manualReloadBtn.disabled = false;
          manualReloadBtn.textContent = '⚡ Reload Ekstensi';
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
  loadSettings();
});
