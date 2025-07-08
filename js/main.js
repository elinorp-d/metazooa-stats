// Main application file for Metazooa Stats
const MetazooaApp = {
    // App state
    results: [],
    
    // Initialize application
    init: function() {
      this.results = DataUtils.loadData();
      UIHandlers.setupEventHandlers();
      this.render();
    },
    
    // Render all UI components
    render: function() {
      const stats = this.calculateStats();
      this.updateUI(stats);
      ChartUtils.updateCharts(stats);
    },
    
    // Calculate statistics from results
    calculateStats: function() {
      // Win counts
      let elinorWins = 0, yashaWins = 0, ties = 0;
      let elinorSolves = 0, yashaSolves = 0;
      let elinorGuessTotal = 0, yashaGuessTotal = 0, count = 0;
      let elinorWinDiffs = [], yashaWinDiffs = [];
      
      // For standard deviation calculation
      let elinorGuesses = [], yashaGuesses = [];
      
      this.results.forEach(r => {
        if (r.winner === 'Elinor') {
          elinorWins++;
          // win diff = yasha.guesses - elinor.guesses (always positive)
          elinorWinDiffs.push((r.yasha.guesses || 0) - (r.elinor.guesses || 0));
        }
        else if (r.winner === 'Yasha') {
          yashaWins++;
          yashaWinDiffs.push((r.elinor.guesses || 0) - (r.yasha.guesses || 0));
        }
        else ties++;
        if (r.elinor.solved) elinorSolves++;
        if (r.yasha.solved) yashaSolves++;
        elinorGuessTotal += r.elinor.guesses || 0;
        yashaGuessTotal += r.yasha.guesses || 0;
        
        // Add guesses to arrays for standard deviation calculation
        elinorGuesses.push(r.elinor.guesses || 0);
        yashaGuesses.push(r.yasha.guesses || 0);
        
        count++;
      });
    
      let elinorWinPct = count ? (100*elinorWins/count) : 0;
      let yashaWinPct = count ? (100*yashaWins/count) : 0;
      let elinorSolvePct = count ? (100*elinorSolves/count) : 0;
      let yashaSolvePct = count ? (100*yashaSolves/count) : 0;
      let elinorAvg = count ? (elinorGuessTotal/count) : 0;
      let yashaAvg = count ? (yashaGuessTotal/count) : 0;
    
      // Calculate standard deviation
      let elinorGuessStdDev = DataUtils.calculateStdDev(elinorGuesses, elinorAvg);
      let yashaGuessStdDev = DataUtils.calculateStdDev(yashaGuesses, yashaAvg);
    
      // Average win differential for each player (positive, only over wins)
      let elinorAvgDiff = elinorWinDiffs.length ? (elinorWinDiffs.reduce((a,b)=>a+b,0)/elinorWinDiffs.length) : 0;
      let yashaAvgDiff = yashaWinDiffs.length ? (yashaWinDiffs.reduce((a,b)=>a+b,0)/yashaWinDiffs.length) : 0;
  
      // Calculate standard deviation for win differentials
      let elinorDiffStdDev = DataUtils.calculateStdDev(elinorWinDiffs, elinorAvgDiff);
      let yashaDiffStdDev = DataUtils.calculateStdDev(yashaWinDiffs, yashaAvgDiff);
      
      return {
        elinorWinPct, yashaWinPct, ties, count,
        elinorSolvePct, yashaSolvePct,
        elinorAvg, yashaAvg,
        elinorGuessStdDev, yashaGuessStdDev,
        elinorAvgDiff, yashaAvgDiff,
        elinorDiffStdDev, yashaDiffStdDev,
        elinorWins, yashaWins, elinorSolves, yashaSolves
      };
    },
    
    // Update UI elements
    updateUI: function(stats) {
      // Update stat displays
      document.getElementById('elinorWin').textContent = stats.count ? stats.elinorWinPct.toFixed(1) + '%' : '--';
      document.getElementById('yashaWin').textContent = stats.count ? stats.yashaWinPct.toFixed(1) + '%' : '--';
      document.getElementById('ties').textContent = stats.ties;
      
      // Log standard deviation values to the console
      console.log('Elinor Guess Standard Deviation:', stats.elinorGuessStdDev);
      console.log('Yasha Guess Standard Deviation:', stats.yashaGuessStdDev);
      console.log('Elinor Diff Standard Deviation:', stats.elinorDiffStdDev);
      console.log('Yasha Diff Standard Deviation:', stats.yashaDiffStdDev);
  
      // Update table
      this.renderResultsTable();
    },
    
    // Render results table
    renderResultsTable: function() {
      let rows = this.results.map((r, trueIndex) => ({...r, trueIndex}))
        .sort((a, b) => {
          // Sort by puzzle number (descending)
          const puzzleA = Number(a.puzzleNum) || 0;
          const puzzleB = Number(b.puzzleNum) || 0;
          return puzzleB - puzzleA;
        })
        .map((r, rowIdx) => {
          if (r._editing) {
            return `
            <tr>
              <td><input id="editDate${r.trueIndex}" type="text" value="${r.date}" style="width:110px;" /></td>
              <td>${r.puzzleNum||''}</td>
              <td><textarea id="editElinor${r.trueIndex}" class="editArea">${r.elinor.raw||''}</textarea></td>
              <td><textarea id="editYasha${r.trueIndex}" class="editArea">${r.yasha.raw||''}</textarea></td>
              <td colspan="3" class="action-links">
                <a href="#" onclick="saveEdit(${r.trueIndex});return false;">Save</a> |
                <a href="#" onclick="cancelEdit(${r.trueIndex});return false;">Cancel</a>
              </td>
            </tr>
            `;
          } else {
            return `
            <tr>
              <td>${r.date}</td>
              <td>${r.puzzleNum||''}</td>
              <td>
                ${r.elinor.solved ? '✅' : '❌'}<br>
                ${r.elinor.guesses} guesses
              </td>
              <td>
                ${r.yasha.solved ? '✅' : '❌'}<br>
                ${r.yasha.guesses} guesses
              </td>
              <td class="${r.winner==='Elinor'?'el':r.winner==='Yasha'?'ya':'tie'}">${r.winner}</td>
              <td>${r.reason}</td>
              <td class="action-links">
                <a href="#" onclick="editEntry(${r.trueIndex});return false;">Edit</a> |
                <a href="#" class="delete" onclick="deleteEntry(${r.trueIndex});return false;">Delete</a>
              </td>
            </tr>
            `;
          }
        }).join('');
      document.querySelector('#historyTable tbody').innerHTML = rows || '<tr><td colspan="7">No results yet.</td></tr>';
    }
  };
  
  // Make MetazooaApp available to other modules
  window.MetazooaApp = MetazooaApp;
  
  // Initialize the app when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    MetazooaApp.init();
  });