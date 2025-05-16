/* global window, Templates */

// Display notifications
function showNotification(message, duration = 3000) {
  const notification = document.querySelector('#notification');
  if (!notification) return;

  notification.textContent = message;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, duration);
}

class OfflineStorage {
  constructor() {
    this.storageKey = 'race-control-data';
    this.connectionStatusElement = document.querySelector('#connection-status');
    this.syncStatusElement = document.querySelector('#sync-status');

    // Generate a unique device ID
    this.deviceId = localStorage.getItem('device-id');
    if (!this.deviceId) {
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('device-id', this.deviceId);
    }
    this.isOnline = navigator.onLine;
    this.updateConnectionStatus();
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    this.checkUnsyncedData();
  }

  generateDeviceId() {
    return 'device_' + Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  getDeviceId() {
    return this.deviceId;
  }

  handleConnectionChange(isOnline) {
    this.isOnline = isOnline;
    this.updateConnectionStatus();
    this.checkUnsyncedData();

    if (isOnline) {
      showNotification(isOnline ? 'You are back online' : 'You are offline', 3000);
    }
  }

  updateConnectionStatus() {
    if (this.connectionStatusElement) {
      this.connectionStatusElement.textContent = this.isOnline ? 'Online' : 'Offline';
      this.connectionStatusElement.className = this.isOnline ? 'online' : 'offline';
    }
  }

  checkUnsyncedData() {
    const data = this.getStoredData();
    const hasUnsyncedData = data && data.results && data.results.length > 0;

    if (this.syncStatusElement) {
      if (hasUnsyncedData && this.isOnline) {
        this.syncStatusElement.innerHTML = Templates.syncStatus(hasUnsyncedData, this.isOnline);
        this.syncStatusElement.classList.remove('hidden');
      } else {
        this.syncStatusElement.classList.add('hidden');
      }
    }

    return hasUnsyncedData;
  }

  storeRaceData(raceData) {
    localStorage.setItem(this.storageKey, JSON.stringify(raceData));
    this.checkUnsyncedData();
  }

  getStoredData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  storeResult(result) {
    let data = this.getStoredData() || { raceId: result.raceId, results: [] };
    if (data.raceId !== result.raceId) {
      data = { raceId: result.raceId, results: [] };
    }
    const duplicateRunner = data.results.find(r => r.runnerNumber === result.runnerNumber);
    if (duplicateRunner) {
      console.warn(`Duplicate runner number ${result.runnerNumber} detected in offline storage`);
      return false;
    }

    data.results.push(result);
    this.storeRaceData(data);
    return true;
  }

  clearResults() {
    localStorage.removeItem(this.storageKey);
    this.checkUnsyncedData();
  }

  isDeviceOnline() {
    return this.isOnline;
  }

  async syncResults() {
    if (!this.isOnline) {
      showNotification('Cannot sync while offline', 3000);
      return false;
    }

    const data = this.getStoredData();
    if (!data || !data.results || data.results.length === 0) {
      showNotification('No data to synchronize', 3000);
      return false;
    }

    try {
      const response = await fetch(`/api/races/${data.raceId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: data.results,
          deviceId: this.deviceId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 400 && responseData.duplicates) {
          const duplicateNumbers = responseData.duplicates.join(', ');
          showNotification(`Cannot sync. Runner numbers already recorded: ${duplicateNumbers}`, 5000);
          return false;
        }

        throw new Error(responseData.error || 'Failed to synchronize results');
      }

      this.clearResults();
      showNotification('Results synchronized successfully', 3000);
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      showNotification('Failed to synchronize results: ' + error.message, 3000);
      return false;
    }
  }
}

// Initialize offline storage
window.offlineStorage = new OfflineStorage();

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Export showNotification for use in other modules
window.showNotification = showNotification;
