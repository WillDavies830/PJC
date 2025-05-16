
document.addEventListener('DOMContentLoaded', () => {
  const app = new RaceControlApp();
  app.init();
});

class RaceControlApp {
  constructor() {
    this.currentScreen = 'home-screen';
    this.currentRaceId = null;
    this.currentRace = null;
    this.raceTimer = new RaceTimer();
    this.results = [];
    this.userRole = localStorage.getItem('userRole') || 'admin';

    this.screens = {
      home: document.querySelector('#home-screen'),
      createRace: document.querySelector('#create-race-screen'),
      racesList: document.querySelector('#races-list-screen'),
      raceControl: document.querySelector('#race-control-screen'),
      results: document.querySelector('#results-screen'),
    };

    this.buttons = {
      createRace: document.querySelector('#create-race-button'),
      viewRaces: document.querySelector('#view-races-button'),
      cancelCreate: document.querySelector('#cancel-create'),
      backToHome: document.querySelector('#back-to-home'),
      startTimer: document.querySelector('#start-timer-button'),
      recordFinish: document.querySelector('#record-button'),
      endRace: document.querySelector('#end-race-button'),
      uploadResults: document.querySelector('#upload-results-button'),
      clearResults: document.querySelector('#clear-results-button'),
      backToRaces: document.querySelector('#back-to-races'),
      backFromResults: document.querySelector('#back-from-results'),
      syncNow: document.querySelector('#sync-now-button'),
    };

    this.forms = {
      createRace: document.querySelector('#create-race-form'),
      recordFinish: document.querySelector('#record-finish-form'),
    };

    this.elements = {
      racesContainer: document.querySelector('#races-container'),
      raceNameDisplay: document.querySelector('#race-name-display'),
      resultsRaceName: document.querySelector('#results-race-name'),
      resultsList: document.querySelector('#results-list'),
      resultsTableContainer: document.querySelector('#results-table-container'),
      runnerInput: document.querySelector('#runner-input'),
      runnerNumber: document.querySelector('#runner-number'),
    };
  }

  init() {
    this.bindEventListeners();
    this.initRoleBasedAccess();
    this.showScreen('home-screen');
  }

  bindEventListeners() {
    this.buttons.createRace.addEventListener('click', () => this.showScreen('create-race-screen'));
    this.buttons.viewRaces.addEventListener('click', () => this.loadRaces());
    this.buttons.cancelCreate.addEventListener('click', () => this.showScreen('home-screen'));
    this.buttons.backToHome.addEventListener('click', () => this.showScreen('home-screen'));
    this.buttons.backToRaces.addEventListener('click', () => this.loadRaces());
    this.buttons.backFromResults.addEventListener('click', () => this.loadRaces());
    this.buttons.startTimer.addEventListener('click', () => this.startRace());

    if (this.buttons.recordFinish) {
      this.buttons.recordFinish.addEventListener('click', () => this.refreshElementReferences());
    }
    this.buttons.endRace.addEventListener('click', () => this.endRace());
    this.buttons.uploadResults.addEventListener('click', () => this.uploadResults());
    this.buttons.clearResults.addEventListener('click', () => this.clearResults());

    if (this.buttons.syncNow) {
      this.buttons.syncNow.addEventListener('click', () => window.offlineStorage.syncResults());
    }
    this.forms.createRace.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createRace();
    });

    if (this.forms.recordFinish) {
      this.forms.recordFinish.addEventListener('submit', (e) => {
        e.preventDefault();
        this.recordFinish();
      });
    }
  }

  refreshElementReferences() {
    this.elements.runnerInput = document.querySelector('#runner-input');
    this.elements.runnerNumber = document.querySelector('#runner-number');
    this.forms.recordFinish = document.querySelector('#record-finish-form');
  }

  initRoleBasedAccess() {
    const roleSelector = document.querySelector('#user-role');
    if (roleSelector) {
      roleSelector.value = this.userRole;
      document.body.classList.toggle('admin-role', this.userRole === 'admin');
      roleSelector.addEventListener('change', (e) => {
        this.userRole = e.target.value;
        localStorage.setItem('userRole', this.userRole);
        document.body.classList.toggle('admin-role', this.userRole === 'admin');
        if (this.currentScreen === 'home-screen') {
          this.updateHomeScreenButtons();
        } else if (this.currentScreen === 'races-list-screen') {
          this.loadRaces();
        }
      });
    }

    this.updateHomeScreenButtons();
  }

  updateHomeScreenButtons() {
    if (this.buttons.createRace) {
      this.buttons.createRace.classList.toggle('admin-only', true);
      if (this.userRole === 'admin') {
        this.buttons.createRace.style.display = 'block';
      } else {
        this.buttons.createRace.style.display = 'none';
      }
    }
  }

  isAdmin() {
    return this.userRole === 'admin';
  }

  showScreen(screenId) {
    if (!this.isAdmin() && (screenId === 'create-race-screen' || screenId === 'race-control-screen')) {
      showNotification('You do not have permission to access this screen', 3000);
      return;
    }

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    document.querySelector(`#${screenId}`).classList.add('active');
    this.currentScreen = screenId;

    if (screenId === 'race-control-screen') {
      this.raceTimer.updateDisplay();
      this.refreshElementReferences();
    }
  }

  async createRace() {
    if (!this.isAdmin()) {
      showNotification('You do not have permission to create races', 3000);
      return;
    }

    const nameInput = document.querySelector('#race-name');
    const dateInput = document.querySelector('#race-date');
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name || !date) {
      showNotification('Please fill in all fields', 3000);
      return;
    }

    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot create races while offline', 3000);
        return;
      }

      const response = await fetch('/api/races', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, date }),
      });

      if (!response.ok) {
        throw new Error('Failed to create race');
      }

      const race = await response.json();
      nameInput.value = '';
      dateInput.value = '';
      this.loadRaceControl(race.id);
    } catch (error) {
      console.error('Create race error:', error);
      showNotification('Failed to create race', 3000);
    }
  }

  async loadRaces() {
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot load races while offline', 3000);
        return;
      }
      const response = await fetch('/api/races');
      if (!response.ok) {
        throw new Error('Failed to load races');
      }
      const races = await response.json();
      this.elements.racesContainer.innerHTML = '';
      if (races.length === 0) {
        this.elements.racesContainer.innerHTML = Templates.noRaces();
      } else {
        races.forEach(race => {
          const raceCard = document.createElement('div');
          raceCard.className = 'race-card';
          const status = race.status === 'pending'
            ? 'Not Started'
            : race.status === 'active' ? 'In Progress' : 'Completed';
          const date = new Date(race.date).toLocaleDateString();
          const isAdmin = this.isAdmin();
          raceCard.innerHTML = Templates.raceCard(race, isAdmin);
          if (isAdmin) {
            raceCard.querySelector('.control-button').addEventListener('click', () => {
              this.loadRaceControl(race.id);
            });
            raceCard.querySelector('.delete-button').addEventListener('click', (e) => {
              e.stopPropagation();
              this.deleteRace(race.id);
            });
          }
          raceCard.querySelector('.results-button').addEventListener('click', () => {
            this.loadRaceResults(race.id);
          });
          raceCard.querySelector('.export-csv-button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.exportRaceResults(race.id, race.name);
          });
          this.elements.racesContainer.appendChild(raceCard);
        });
      }
      this.showScreen('races-list-screen');
    } catch (error) {
      console.error('Load races error:', error);
      showNotification('Failed to load races', 3000);
    }
  }

  async deleteRace(raceId) {
    if (!this.isAdmin()) {
      showNotification('You do not have permission to delete races', 3000);
      return;
    }
    if (!confirm('Are you sure you want to delete this race? This action cannot be undone.')) {
      return;
    }
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot delete races while offline', 3000);
        return;
      }
      const response = await fetch(`/api/races/${raceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete race');
      }
      showNotification('Race deleted successfully', 3000);
      this.loadRaces();
    } catch (error) {
      console.error('Delete race error:', error);
      showNotification('Failed to delete race', 3000);
    }
  }

  async loadRaceControl(raceId) {
    if (!this.isAdmin()) {
      showNotification('You do not have permission to control races', 3000);
      return;
    }

    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot load race details while offline', 3000);
        return;
      }
      const response = await fetch(`/api/races/${raceId}`);
      if (!response.ok) {
        throw new Error('Failed to load race details');
      }
      const race = await response.json();
      this.currentRace = race;
      this.currentRaceId = raceId;
      if (this.elements.raceNameDisplay) {
        this.elements.raceNameDisplay.textContent = race.name;
      }
      this.results = [];
      this.updateResultsList();
      this.raceTimer.reset();
      this.showScreen('race-control-screen');
      this.refreshElementReferences();
      if (race.status === 'pending') {
        if (this.buttons.startTimer) this.buttons.startTimer.disabled = false;
        if (this.buttons.recordFinish) this.buttons.recordFinish.disabled = true;
        if (this.buttons.endRace) this.buttons.endRace.disabled = true;
        if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = true;
        if (this.buttons.clearResults) this.buttons.clearResults.disabled = true;
        if (this.elements.runnerNumber) {
          this.elements.runnerNumber.disabled = true;
        }
      } else if (race.status === 'active') {
        if (this.buttons.startTimer) this.buttons.startTimer.disabled = true;
        if (this.buttons.recordFinish) this.buttons.recordFinish.disabled = false;
        if (this.buttons.endRace) this.buttons.endRace.disabled = false;
        if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = false;
        if (this.buttons.clearResults) this.buttons.clearResults.disabled = false;
        if (this.elements.runnerNumber) {
          this.elements.runnerNumber.disabled = false;
          this.elements.runnerNumber.focus();
        }
        if (race.startTime) {
          this.raceTimer.start(parseInt(race.startTime));
        }
      } else {
        if (this.buttons.startTimer) this.buttons.startTimer.disabled = true;
        if (this.buttons.recordFinish) this.buttons.recordFinish.disabled = true;
        if (this.buttons.endRace) this.buttons.endRace.disabled = true;
        if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = false;
        if (this.buttons.clearResults) this.buttons.clearResults.disabled = false;
        if (this.elements.runnerNumber) {
          this.elements.runnerNumber.disabled = true;
        }
        if (race.startTime) {
          this.raceTimer.start(parseInt(race.startTime));
          this.raceTimer.stop();
        }
      }

      const storedData = window.offlineStorage.getStoredData();
      if (storedData && storedData.raceId === raceId && storedData.results) {
        this.results = storedData.results;
        this.updateResultsList();
        if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = false;
        if (this.buttons.clearResults) this.buttons.clearResults.disabled = false;
      }
    } catch (error) {
      console.error('Load race control error:', error);
      showNotification('Failed to load race control', 3000);
    }
  }

  async startRace() {
    if (!this.currentRaceId) {
      showNotification('No race selected', 3000);
      return;
    }
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot start race while offline', 3000);
        return;
      }
      const startTime = this.raceTimer.start();
      const response = await fetch(`/api/races/${this.currentRaceId}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startTime }),
      });
      if (!response.ok) {
        this.raceTimer.stop();
        throw new Error('Failed to start race');
      }
      const updatedRace = await response.json();
      this.currentRace = {
        ...this.currentRace,
        startTime: updatedRace.startTime,
        status: updatedRace.status,
      };
      if (this.buttons.startTimer) this.buttons.startTimer.disabled = true;
      if (this.buttons.recordFinish) this.buttons.recordFinish.disabled = false;
      if (this.buttons.endRace) this.buttons.endRace.disabled = false;
      if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = false;
      if (this.buttons.clearResults) this.buttons.clearResults.disabled = false;
      this.refreshElementReferences();
      if (this.elements.runnerNumber) {
        this.elements.runnerNumber.disabled = false;
        this.elements.runnerNumber.focus();
      }
      showNotification('Race started', 3000);
    } catch (error) {
      console.error('Start race error:', error);
      showNotification('Failed to start race', 3000);
    }
  }

  recordFinish() {
    if (!this.raceTimer.isRunning) {
      showNotification('Race timer not running', 3000);
      return;
    }
    this.refreshElementReferences();
    if (!this.elements.runnerNumber) {
      showNotification('Bib number input not available', 3000);
      return;
    }
    const bibNumber = parseInt(this.elements.runnerNumber.value);
    if (isNaN(bibNumber) || bibNumber <= 0) {
      showNotification('Invalid bib number', 3000);
      return;
    }
    const bibExists = this.results.some(result => result.runnerNumber === bibNumber);
    if (bibExists) {
      showNotification(`Bib #${bibNumber} has already been recorded`, 3000);
      this.elements.runnerNumber.value = '';
      this.elements.runnerNumber.focus();
      return;
    }
    const finishTime = this.raceTimer.recordFinish();
    const raceTime = finishTime - this.raceTimer.startTime;
    const result = {
      runnerNumber: bibNumber,
      finishTime,
      raceTime,
    };
    this.results.push(result);
    window.offlineStorage.storeResult({
      raceId: this.currentRaceId,
      runnerNumber: bibNumber,
      finishTime,
    });
    this.updateResultsList();
    this.elements.runnerNumber.value = '';
    this.elements.runnerNumber.focus();
    if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = false;
    if (this.buttons.clearResults) this.buttons.clearResults.disabled = false;
    showNotification(`Recorded: Bib #${bibNumber} - ${this.formatTimeDisplay(raceTime)}`, 2000);
  }

  updateResultsList() {
    if (!this.elements.resultsList) return;
    this.elements.resultsList.innerHTML = '';

    if (this.results.length === 0) {
      this.elements.resultsList.innerHTML = Templates.noResults();
      return;
    }
    const sortedResults = [...this.results].sort((a, b) => a.finishTime - b.finishTime);
    sortedResults.forEach((result, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';

      const position = index + 1;
      resultItem.innerHTML = Templates.resultItem(
        result,
        position,
        this.raceTimer.formatTimeVerbose.bind(this.raceTimer),
      );

      this.elements.resultsList.appendChild(resultItem);
    });
  }

  async endRace() {
    if (!this.currentRaceId) {
      showNotification('No race selected', 3000);
      return;
    }
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        this.raceTimer.stop();
        showNotification('Race timer stopped', 3000);
        return;
      }
      this.raceTimer.stop();
      const response = await fetch(`/api/races/${this.currentRaceId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to end race');
      }
      const updatedRace = await response.json();
      this.currentRace = {
        ...this.currentRace,
        status: updatedRace.status,
      };
      if (this.buttons.startTimer) this.buttons.startTimer.disabled = true;
      if (this.buttons.recordFinish) this.buttons.recordFinish.disabled = true;
      if (this.buttons.endRace) this.buttons.endRace.disabled = true;
      this.refreshElementReferences();
      if (this.elements.runnerNumber) {
        this.elements.runnerNumber.disabled = true;
      }
      showNotification('Race ended', 3000);
      if (this.results.length > 0 && window.offlineStorage.isDeviceOnline()) {
        if (confirm('Would you like to upload the race results now?')) {
          this.uploadResults();
        }
      }
    } catch (error) {
      console.error('End race error:', error);
      showNotification('Failed to end race', 3000);
    }
  }

  async uploadResults() {
    if (this.results.length === 0) {
      showNotification('No results to upload', 3000);
      return;
    }
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Results saved offline and will sync when online', 3000);
        return;
      }
      const response = await fetch(`/api/races/${this.currentRaceId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: this.results.map(result => ({
            runnerNumber: result.runnerNumber,
            finishTime: result.finishTime,
          })),
          deviceId: window.offlineStorage.getDeviceId(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload results');
      }
      this.results = [];
      this.updateResultsList();
      window.offlineStorage.clearResults();
      if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = true;
      if (this.buttons.clearResults) this.buttons.clearResults.disabled = true;
      showNotification('Results uploaded successfully', 3000);
    } catch (error) {
      console.error('Upload results error:', error);
      showNotification('Failed to upload results', 3000);
    }
  }

  clearResults() {
    if (this.results.length === 0) {
      return;
    }
    if (confirm('Are you sure you want to clear all recorded results?')) {
      this.results = [];
      this.updateResultsList();
      window.offlineStorage.clearResults();
      if (this.buttons.uploadResults) this.buttons.uploadResults.disabled = true;
      if (this.buttons.clearResults) this.buttons.clearResults.disabled = true;

      showNotification('Results cleared', 3000);
    }
  }

  async exportRaceResults(raceId, raceName) {
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot export results while offline', 3000);
        return;
      }
      showNotification('Preparing export...', 2000);
      const raceResponse = await fetch(`/api/races/${raceId}`);
      if (!raceResponse.ok) {
        throw new Error('Failed to load race details');
      }
      const race = await raceResponse.json();
      const resultsResponse = await fetch(`/api/races/${raceId}/results`);
      if (!resultsResponse.ok) {
        throw new Error('Failed to load race results');
      }
      const results = await resultsResponse.json();
      if (results.length === 0) {
        showNotification('No results available to export', 3000);
        return;
      }
      const sortedResults = [...results].sort((a, b) => a.raceTime - b.raceTime);
      const raceDate = new Date(race.date).toLocaleDateString();
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Position,Bib Number,Race Time\n';
      sortedResults.forEach((result, index) => {
        const position = index + 1;
        const raceTimeFormatted = this.formatTimeDisplay(result.raceTime);
        csvContent += `${position},${result.runnerNumber},"${raceTimeFormatted}"\n`;
      });
      const sanitizedRaceName = raceName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedRaceName}_results_${raceDate.replace(/\//g, '-')}.csv`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Export completed', 3000);
    } catch (error) {
      console.error('Export race results error:', error);
      showNotification('Failed to export results', 3000);
    }
  }

  async loadRaceResults(raceId) {
    try {
      if (!window.offlineStorage.isDeviceOnline()) {
        showNotification('Cannot load results while offline', 3000);
        return;
      }
      const raceResponse = await fetch(`/api/races/${raceId}`);
      if (!raceResponse.ok) {
        throw new Error('Failed to load race details');
      }
      const race = await raceResponse.json();
      const resultsResponse = await fetch(`/api/races/${raceId}/results`);
      if (!resultsResponse.ok) {
        throw new Error('Failed to load race results');
      }
      const results = await resultsResponse.json();
      if (this.elements.resultsRaceName) {
        this.elements.resultsRaceName.textContent = race.name;
      }
      if (this.elements.resultsTableContainer) {
        const sortedResults = [...results].sort((a, b) => a.raceTime - b.raceTime);
        this.elements.resultsTableContainer.innerHTML = Templates.resultsTable(
          sortedResults,
          this.formatTimeDisplay.bind(this),
        );
      }
      this.showScreen('results-screen');
    } catch (error) {
      console.error('Load race results error:', error);
      showNotification('Failed to load race results', 3000);
    }
  }

  formatTimeDisplay(timeInMs) {
    if (timeInMs === null || timeInMs === undefined) return 'N/A';
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;
    let result = '';
    if (hours > 0) {
      result += `${hours}h ${minutes}m ${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    } else if (minutes > 0) {
      result += `${minutes}m ${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    } else {
      result += `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    }
    return result;
  }
}
