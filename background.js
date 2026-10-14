/**
 * Auto History Wipe - Background Service Worker
 * Copyright (c) 2026 by cs.baguosps@gmail.com
 * All rights reserved.
 */

const DEFAULT_SETTINGS = {
  extensionEnabled: true,
  timeRange: 'all', // '1day', '3days', '1week', '1month', 'all', 'custom'
  customDays: 1,
  dataTypes: {
    history: false,
    downloads: false,
    cache: true,
    cookies: false,
    localStorage: false,
    passwords: false,
    formData: false
  },
  autoClearOnClose: false,
  enableTimed: true,
  timedInterval: 5,
  timedUnit: 'minutes', // 'minutes', 'hours', 'days'
  lastCleared: null,
  nextScheduledTime: null,
  serverUpdatedAt: 0,
  lastForceWipe: 0,
  remoteServerUrl: ''
};

const ALARM_NAME = 'auto_history_wipe_alarm';
const SYNC_ALARM_NAME = 'auto_history_wipe_remote_sync';

// Retrieve settings from local storage with default fallback
async function getSettings() {
  try {
    const data = await chrome.storage.local.get('wipeSettings');
    if (data && data.wipeSettings) {
      return { ...DEFAULT_SETTINGS, ...data.wipeSettings };
    }
  } catch (err) {
    console.error('Failed to get settings:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

// Save settings to local storage
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ wipeSettings: settings });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Convert interval & unit to minutes
function getIntervalInMinutes(interval, unit) {
  const num = Math.max(1, parseFloat(interval) || 1);
  if (unit === 'hours') {
    return num * 60;
  }
  if (unit === 'days') {
    return num * 1440;
  }
  return num; // minutes
}

// Setup or cancel the scheduled wipe alarm
async function setupAlarm(settings) {
  await chrome.alarms.clear(ALARM_NAME);

  if (!settings.extensionEnabled || !settings.enableTimed) {
    settings.nextScheduledTime = null;
    await saveSettings(settings);
    updateBadge(settings);
    return;
  }

  const periodInMinutes = getIntervalInMinutes(settings.timedInterval, settings.timedUnit);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: periodInMinutes,
    periodInMinutes: periodInMinutes
  });

  settings.nextScheduledTime = Date.now() + (periodInMinutes * 60 * 1000);
  await saveSettings(settings);
  updateBadge(settings);
}

// Setup remote sync alarm (checks server every 1 minute)
function setupRemoteSyncAlarm() {
  chrome.alarms.create(SYNC_ALARM_NAME, {
    periodInMinutes: 1,
    delayInMinutes: 0.1
  });
}

// Update the extension toolbar icon badge (Clean: no giant badge covering the icon!)
function updateBadge(settings) {
  if (!settings.extensionEnabled) {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#64748b' });
  } else {
    // Keep icon crystal-clear and clean in the toolbar
    chrome.action.setBadgeText({ text: '' });
  }
}

// Calculate the 'since' timestamp based on chosen time range
function calculateSinceTimestamp(timeRange, customDays) {
  const now = Date.now();
  switch (timeRange) {
    case '1day':
      return now - (1 * 24 * 60 * 60 * 1000);
    case '3days':
      return now - (3 * 24 * 60 * 60 * 1000);
    case '1week':
      return now - (7 * 24 * 60 * 60 * 1000);
    case '1month':
      return now - (30 * 24 * 60 * 60 * 1000);
    case 'custom':
      const days = Math.max(1, parseInt(customDays, 10) || 1);
      return now - (days * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return 0; // Epoch 0 removes everything
  }
}

// Perform browsing data wipe
async function executeClearData(settings = null, isManual = false) {
  if (!settings) {
    settings = await getSettings();
  }

  if (!settings.extensionEnabled && !isManual) {
    return { success: false, message: 'Extension is disabled.' };
  }

  const since = calculateSinceTimestamp(settings.timeRange, settings.customDays);
  const dataTypes = settings.dataTypes || {};

  const dataToRemove = {
    appcache: false,
    cache: !!dataTypes.cache,
    cookies: !!dataTypes.cookies,
    downloads: !!dataTypes.downloads,
    fileSystems: false,
    formData: !!dataTypes.formData,
    history: !!dataTypes.history,
    indexedDB: false,
    localStorage: !!dataTypes.localStorage,
    passwords: !!dataTypes.passwords,
    serviceWorkers: false,
    webSQL: false
  };

  const hasAtLeastOneType = Object.values(dataToRemove).some(Boolean);
  if (!hasAtLeastOneType) {
    return { success: false, message: 'No data types selected to clear.' };
  }

  try {
    await chrome.browsingData.remove({ since }, dataToRemove);

    settings.lastCleared = Date.now();
    
    // If timed is active, recalculate nextScheduledTime
    if (settings.extensionEnabled && settings.enableTimed) {
      const period = getIntervalInMinutes(settings.timedInterval, settings.timedUnit);
      settings.nextScheduledTime = Date.now() + (period * 60 * 1000);
    }

    await saveSettings(settings);

    // Show temporary quick badge feedback
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    setTimeout(() => {
      updateBadge(settings);
    }, 2500);

    return {
      success: true,
      timestamp: settings.lastCleared,
      nextScheduledTime: settings.nextScheduledTime
    };
  } catch (error) {
    console.error('Error clearing browsing data:', error);
    return { success: false, message: error.message };
  }
}

// Remote Config Auto-Sync Engine
async function syncRemoteConfig() {
  const settings = await getSettings();
  
  // List of possible endpoints: configured server first, then localhost fallback
  const endpoints = [];
  if (settings.remoteServerUrl && settings.remoteServerUrl.trim()) {
    endpoints.push(`${settings.remoteServerUrl.trim().replace(/\/$/, '')}/api/config`);
  }
  endpoints.push('http://localhost/chace/index.php?route=api/config');

  let serverData = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json && json.config) {
          serverData = json.config;
          break;
        }
      }
    } catch (e) {
      // Endpoint unreachable, try next
    }
  }

  if (!serverData) return;

  let hasChanged = false;

  // 1. Check Remote Force Wipe command from Admin Dashboard
  if (serverData.forceWipeTimestamp && Number(serverData.forceWipeTimestamp) > (settings.lastForceWipe || 0)) {
    settings.lastForceWipe = Number(serverData.forceWipeTimestamp);
    hasChanged = true;
    console.log('[Auto History Wipe] Remote force wipe triggered by admin!');
    await executeClearData(settings, true);
  }

  // 2. Check Configuration updates from Admin Dashboard
  if (serverData.updatedAt && Number(serverData.updatedAt) > (settings.serverUpdatedAt || 0)) {
    settings.serverUpdatedAt = Number(serverData.updatedAt);
    settings.extensionEnabled = !!serverData.extensionEnabled;
    settings.timeRange = serverData.timeRange || settings.timeRange;
    settings.customDays = serverData.customDays || settings.customDays;
    settings.dataTypes = serverData.dataTypes || settings.dataTypes;
    settings.autoClearOnClose = !!serverData.autoClearOnClose;
    settings.enableTimed = !!serverData.enableTimed;
    settings.timedInterval = serverData.timedInterval || settings.timedInterval;
    settings.timedUnit = serverData.timedUnit || settings.timedUnit;
    hasChanged = true;
    console.log('[Auto History Wipe] Settings updated automatically from admin dashboard!');
  }

  if (hasChanged) {
    await saveSettings(settings);
    await setupAlarm(settings);
  }
}

// Extension installation & update setup
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get('wipeSettings');
  const settings = { ...DEFAULT_SETTINGS, ...(existing.wipeSettings || {}) };
  await saveSettings(settings);
  await setupAlarm(settings);
  setupRemoteSyncAlarm();
  syncRemoteConfig();
});

// Browser startup listener
chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  await setupAlarm(settings);
  setupRemoteSyncAlarm();
  syncRemoteConfig();
});

// Alarm trigger listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const settings = await getSettings();
    if (settings.extensionEnabled && settings.enableTimed) {
      await executeClearData(settings, false);
    }
  } else if (alarm.name === SYNC_ALARM_NAME) {
    syncRemoteConfig();
  }
});

// Auto Clear when browser closes
chrome.windows.onRemoved.addListener(async () => {
  const settings = await getSettings();
  if (settings.extensionEnabled && settings.autoClearOnClose) {
    try {
      const allWindows = await chrome.windows.getAll();
      if (!allWindows || allWindows.length === 0) {
        await executeClearData(settings, false);
      }
    } catch (e) {
      // Best-effort attempt
    }
  }
});

// Message listener for communications from popup and options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CLEAR_NOW') {
    executeClearData(null, true).then((res) => {
      sendResponse(res);
    });
    return true;
  }

  if (request.action === 'GET_SETTINGS') {
    getSettings().then((settings) => {
      chrome.alarms.get(ALARM_NAME).then((alarm) => {
        let remainingSeconds = 0;
        if (alarm && alarm.scheduledTime) {
          remainingSeconds = Math.max(0, Math.round((alarm.scheduledTime - Date.now()) / 1000));
        }
        sendResponse({ settings, remainingSeconds, alarm });
      });
    });
    return true;
  }

  if (request.action === 'SAVE_SETTINGS') {
    const newSettings = { ...DEFAULT_SETTINGS, ...request.settings };
    saveSettings(newSettings).then(() => {
      setupAlarm(newSettings).then(() => {
        sendResponse({ success: true, settings: newSettings });
      });
    });
    return true;
  }

  if (request.action === 'TOGGLE_STATUS') {
    getSettings().then((settings) => {
      settings.extensionEnabled = !settings.extensionEnabled;
      saveSettings(settings).then(() => {
        setupAlarm(settings).then(() => {
          sendResponse({ success: true, settings });
        });
      });
    });
    return true;
  }

  if (request.action === 'TRIGGER_REMOTE_SYNC') {
    syncRemoteConfig().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'RELOAD_EXTENSION') {
    sendResponse({ success: true });
    setTimeout(() => {
      if (chrome.runtime.reload) {
        chrome.runtime.reload();
      }
    }, 150);
    return true;
  }
});
