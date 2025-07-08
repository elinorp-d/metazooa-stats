// UI event handlers for Metazooa Stats
const UIHandlers = {
    // Setup all event handlers
    setupEventHandlers: function() {
      // Form submission
      document.getElementById('entryForm').onsubmit = this.handleFormSubmit;
      
      // CSV import
      document.getElementById('importFile').addEventListener('change', this.handleFileImport);
      
      // Make sure global handlers are available
      window.editEntry = this.editEntry;
      window.cancelEdit = this.cancelEdit;
      window.saveEdit = this.saveEdit;
      window.deleteEntry = this.deleteEntry;
      window.exportCSV = function() { DataUtils.exportCSV(MetazooaApp.results); };
    },
    
    // Handle form submission
    handleFormSubmit: function(e) {
      e.preventDefault();
      let elinorRaw = document.getElementById('elinorInput').value.trim();
      let yashaRaw = document.getElementById('yashaInput').value.trim();
      let eRes = DataUtils.parseResult(elinorRaw);
      let yRes = DataUtils.parseResult(yashaRaw);
  
      if (!eRes || !yRes) {
        alert('Both results must be pasted and look like Metazooa results.');
        return;
      }
  
      // Puzzle number/date (use puzzle # as date key, or fallback to today)
      let puzzleNum = eRes.puzzleNum || yRes.puzzleNum || '';
      let today = new Date().toISOString().slice(0,10);
  
      // Calculate winner & reason
      const { winner, reason } = DataUtils.determineWinner(eRes, yRes);
  
      // Prevent duplicates by puzzleNum
      if (puzzleNum && MetazooaApp.results.some(r => r.puzzleNum == puzzleNum)) {
        if (!confirm("You've already entered results for this puzzle #. Add again?")) return;
      }

      MetazooaApp.results.push({
        date: today,
        puzzleNum,
        elinor: eRes,
        yasha: yRes,
        winner, reason
      });
      DataUtils.saveData(MetazooaApp.results);
      document.getElementById('elinorInput').value = '';
      document.getElementById('yashaInput').value = '';
      MetazooaApp.render();
    },
    
    // Handle file import
    handleFileImport: function(e) {
      const file = e.target.files[0];
      if (!file) return;
      let reader = new FileReader();
      reader.onload = function(evt) {
        let text = evt.target.result;
        let lines = text.split(/\r?\n/);
        let header = lines.shift().split(',');
        let idx = {};
        header.forEach((h,i)=>{idx[h]=i});
        let imported = [];
        lines.forEach(line=>{
          if (!line.trim()) return;
          let parts = line.split(',');
          imported.push({
            date: parts[idx['date']],
            puzzleNum: parts[idx['puzzleNum']],
            elinor: {
              solved: parts[idx['elinorSolved']]==='true',
              guesses: Number(parts[idx['elinorGuesses']])
            },
            yasha: {
              solved: parts[idx['yashaSolved']]==='true',
              guesses: Number(parts[idx['yashaGuesses']])
            },
            winner: parts[idx['winner']],
            reason: parts[idx['reason']].replace(/;/g,',')
          });
        });
        MetazooaApp.results = imported;
        DataUtils.saveData(MetazooaApp.results);
        MetazooaApp.render();
        alert('Import complete! Your data has been loaded.');
        e.target.value = '';
      };
      reader.readAsText(file);
    },
    
    // Edit entry
    editEntry: function(trueIndex) {
      MetazooaApp.results[trueIndex]._editing = true;
      DataUtils.saveData(MetazooaApp.results);
      MetazooaApp.render();
    },
    
    // Cancel edit
    cancelEdit: function(trueIndex) {
      delete MetazooaApp.results[trueIndex]._editing;
      MetazooaApp.render();
    },
    
    // Save edit
    saveEdit: function(trueIndex) {
      let r = MetazooaApp.results[trueIndex];
      let dateText = document.getElementById('editDate'+trueIndex).value.trim();
      let elinorText = document.getElementById('editElinor'+trueIndex).value.trim();
      let yashaText = document.getElementById('editYasha'+trueIndex).value.trim();
      let eRes = DataUtils.parseResult(elinorText);
      let yRes = DataUtils.parseResult(yashaText);
      if (!eRes || !yRes) { alert('Please paste valid Metazooa results for both players.'); return; }
      
      const { winner, reason } = DataUtils.determineWinner(eRes, yRes);
      
      r.date = dateText;
      r.elinor = eRes; r.yasha = yRes;
      r.elinor.raw = elinorText; r.yasha.raw = yashaText;
      r.puzzleNum = eRes.puzzleNum || yRes.puzzleNum || r.puzzleNum;
      r.winner = winner; r.reason = reason;
      delete r._editing;
      DataUtils.saveData(MetazooaApp.results);
      MetazooaApp.render();
    },
    
    // Delete entry
    deleteEntry: function(trueIndex) {
      if (!confirm('Delete this result? This cannot be undone.')) return;
      MetazooaApp.results.splice(trueIndex, 1);
      DataUtils.saveData(MetazooaApp.results);
      MetazooaApp.render();
    }
};

// Make UIHandlers available to other modules
window.UIHandlers = UIHandlers;