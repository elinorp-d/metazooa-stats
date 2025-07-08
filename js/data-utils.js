// Data handling utilities for Metazooa Stats
const DataUtils = {
    // Parse Metazooa results text
    parseResult: function(text) {
      if (!text || text.length < 5) return null;
      let solved = text.includes('I figured it out');
      let guesses = solved
        ? Number((text.match(/in ([0-9]+) guesses!/)||[])[1] || 0)
        : CONFIG.defaults.maxGuesses;
      let puzzleNum = Number((text.match(/Animal #([0-9]+)/)||[])[1] || '');
      return { solved, guesses, puzzleNum, raw: text.trim() };
    },
    
    // Storage helpers
    saveData: function(data) { 
      localStorage.setItem('metazooaData', JSON.stringify(data)); 
    },
    
    loadData: function() { 
      return JSON.parse(localStorage.getItem('metazooaData')||'[]'); 
    },
    
    // Calculate standard deviation
    calculateStdDev: function(values, mean) {
      if (values.length === 0) return 0;
      
      // Calculate sum of squared differences from mean
      const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
      const sumSquaredDiffs = squaredDiffs.reduce((sum, value) => sum + value, 0);
      
      // Calculate standard deviation
      return Math.sqrt(sumSquaredDiffs / values.length);
    },
    
    // CSV Export
    exportCSV: function(results) {
      const header = ['date','puzzleNum',
        'elinorSolved','elinorGuesses',
        'yashaSolved','yashaGuesses',
        'winner','reason'
      ];
      const rows = results.map(r=>[
        r.date, r.puzzleNum,
        r.elinor.solved, r.elinor.guesses,
        r.yasha.solved, r.yasha.guesses,
        r.winner, r.reason.replace(/,/g, ';')
      ]);
      let csv = [header.join(',')].concat(rows.map(r=>r.join(','))).join('\n');
      let blob = new Blob([csv], {type:'text/csv'});
      let link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'metazooa_elinor_yasha.csv';
      link.click();
    },
    
    // Determine winner between two players
    determineWinner: function(eRes, yRes) {
      let winner = 'Tie', reason = '';
      if (eRes.solved && !yRes.solved) { 
        winner = 'Elinor'; 
        reason = 'Solved, opponent didn\'t.'; 
      }
      else if (!eRes.solved && yRes.solved) { 
        winner = 'Yasha'; 
        reason = 'Solved, opponent didn\'t.'; 
      }
      else if (eRes.solved && yRes.solved) {
        if (eRes.guesses < yRes.guesses) { 
          winner = 'Elinor'; 
          reason = 'Fewer guesses.'; 
        }
        else if (eRes.guesses > yRes.guesses) { 
          winner = 'Yasha'; 
          reason = 'Fewer guesses.'; 
        }
        else { 
          winner = 'Tie'; 
          reason = 'Same number of guesses.'; 
        }
      }
      else { 
        winner = 'Tie'; 
        reason = 'Both stumped.'; 
      }
      return { winner, reason };
    }
  };
  
  // Make DataUtils available to other modules
  window.DataUtils = DataUtils;