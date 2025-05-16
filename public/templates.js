const Templates = {
  noRaces: function() {
    return '<p>No races found</p>';
  },
  
  raceCard: function(race, isAdmin) {
    return `
      <h3>${race.name}</h3>
      <p>Date: ${new Date(race.date).toLocaleDateString()}</p>
      <p>Status: ${race.status === 'pending' ? 'Not Started' : 
                race.status === 'active' ? 'In Progress' : 'Completed'}</p>
      <div class="race-card-buttons">
        ${isAdmin ? '<button class="primary-button control-button">Race Timer</button>' : ''}
        <button class="secondary-button results-button">View Results</button>
        <button class="export-button export-csv-button">Export CSV</button>
        ${isAdmin ? '<button class="danger-button delete-button">Delete Race</button>' : ''}
      </div>
    `;
  },
  
  resultItem: function(result, position, formatTimeFn) {
    return `
      <div><strong>Bib #${result.runnerNumber}</strong></div>
      <div>${formatTimeFn(result.raceTime)}</div>
    `;
  },
  
  noResults: function() {
    return '<p>No results recorded yet</p>';
  },
  
  resultsTable: function(results, formatTimeFn) {
    if (results.length === 0) {
      return '<p>No results available for this race</p>';
    }
    let html = `<table><thead><tr><th>Position</th><th>Bib Number</th><th>Finish Time</th></tr></thead><tbody>`;
    
    results.forEach((result, index) => {
      const formattedRaceTime = formatTimeFn(result.raceTime);
      const bibDisplay = `<strong>#${result.runnerNumber}</strong>`;
      
      html += `<tr><td>${index + 1}</td><td>${bibDisplay}</td><td>${formattedRaceTime}</td></tr>`;
    });
    
    html += `</tbody></table>`;
    return html;
  },
  
  syncStatus: function(hasUnsyncedData, isOnline) {
    if (hasUnsyncedData && isOnline) {
      return `<p>You have unsynchronized race data</p><button id="sync-now-button" class="action-button">Sync Now</button>`;
    }
    return '';
  },
  
  connectionStatus: function(isOnline) {
    return isOnline ? 'Online' : 'Offline';
  },
  
  notification: function(message) {
    return message;
  }
};
window.Templates = Templates;