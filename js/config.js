// Configuration constants for the Metazooa Stats app
const CONFIG = {
    // Player colors
    colors: {
      elinor: '#13b34a',
      yasha: '#8a37d7',
      tie: '#d4d4d4'
    },
    
    // Chart configuration
    charts: {
      aspectRatio: 0.75,
      labelOffset: 0.065,
      maxGuesses: 20,
      barRadius: 6
    },
    
    // Default values
    defaults: {
      maxGuesses: 20
    }
  };
  
  // Make CONFIG available to other modules
  window.CONFIG = CONFIG;