/**
 * Race Timer Module
 * Handles timing functionality for races
 */
class RaceTimer {
  constructor() {
    this.startTime = null;
    this.timerInterval = null;
    this.isRunning = false;
    this.displayElement = document.querySelector('#timer-display');
  }

  /**
   * Start the race timer
   * @param {number} startTime - Optional start time in milliseconds
   * @returns {number} The start time
   */
  start(startTime = null) {
    if (this.isRunning) return this.startTime;
    
    this.startTime = startTime || Date.now();
    this.isRunning = true;
    
    this.timerInterval = setInterval(() => {
      this.updateDisplay();
    }, 10); // Update every 10ms for smooth display including milliseconds
    
    return this.startTime;
  }

  /**
   * Stop the race timer
   */
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.timerInterval);
    this.isRunning = false;
  }

  /**
   * Reset the race timer
   */
  reset() {
    this.stop();
    this.startTime = null;
    this.displayElement.textContent = '00:00:00.000';
  }

  /**
   * Get the current elapsed time
   * @returns {number} Elapsed time in milliseconds
   */
  getElapsedTime() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Record a finish time
   * @returns {number} The finish time in milliseconds
   */
  recordFinish() {
    if (!this.isRunning) return null;
    const finishTime = Date.now();
    return finishTime;
  }

  /**
   * Update the timer display
   */
  updateDisplay() {
    if (!this.startTime) {
      this.displayElement.textContent = '00:00:00.000';
      return;
    }
    
    const elapsedTime = this.getElapsedTime();
    this.displayElement.textContent = this.formatTime(elapsedTime);
  }

  /**
   * Format time in milliseconds to HH:MM:SS.mmm format
   * @param {number} timeInMs - Time in milliseconds
   * @returns {string} Formatted time string
   */
  formatTime(timeInMs) {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = timeInMs % 1000;
    
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}.${this.padZero(milliseconds, 3)}`;
  }

  /**
   * Format time with exact milliseconds
   * @param {number} timeInMs - Time in milliseconds
   * @returns {string} Formatted time string including milliseconds
   */
  formatTimeWithMilliseconds(timeInMs) {
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

  /**
   * Format milliseconds to human-readable format with millisecond precision
   * @param {number} timeInMs - Time in milliseconds
   * @returns {string} Formatted time string with hours, minutes, seconds and milliseconds
   */
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

  /**
   * Pad a number with leading zeros if needed
   * @param {number} num - Number to pad
   * @param {number} width - Width of the resulting string
   * @returns {string} Padded number string
   */
  padZero(num, width = 2) {
    return num.toString().padStart(width, '0');
  }
}

// Export the timer
window.RaceTimer = RaceTimer;