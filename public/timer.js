class RaceTimer {
  constructor() {
    this.startTime = null;
    this.timerInterval = null;
    this.isRunning = false;
    this.displayElement = document.querySelector('#timer-display');
  }

  // Start the timer
  start(startTime = null) {
    if (this.isRunning) return this.startTime;

    this.startTime = startTime || Date.now();
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 10);

    return this.startTime;
  }

  // Stop timer
  stop() {
    if (!this.isRunning) return;

    clearInterval(this.timerInterval);
    this.isRunning = false;
  }

  // resets timer
  reset() {
    this.stop();
    this.startTime = null;
    this.displayElement.textContent = '00:00:00.000';
  }

  // Get elapsed time
  getElapsedTime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  // record finish time
  recordFinish() {
    if (!this.isRunning) return null;
    const finishTime = Date.now();
    return finishTime;
  }

  // update timer display
  updateTimer() {
    if (!this.startTime) {
      this.displayElement.textContent = '00:00:00.000';
      return;
    }

    const elapsedTime = this.getElapsedTime();
    this.displayElement.textContent = this.formatTime(elapsedTime);
  }

  // formats time
  formatTime(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;

    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}.${this.padZero(milliseconds, 3)}`;
  }

  // formats time in verbose format
  formatTimeVerbose(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${seconds}.${this.padZero(milliseconds, 3)}s`;

    return result.trim();
  }

  // pads number for readability
  padZero(num, width = 2) {
    return num.toString().padStart(width, '0');
  }
}

window.RaceTimer = RaceTimer;
