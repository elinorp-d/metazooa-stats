// Chart utility functions for Metazooa Stats
const ChartUtils = {
    // Chart instances
    charts: {
      winChart: null,
      avgChart: null,
      diffChart: null
    },
    
    // Create error bars plugin
    createErrorBarsPlugin: function() {
      return {
        id: 'errorBars',
        afterDraw: function(chart) {
          const ctx = chart.ctx;
          ctx.save();
          
          // Only apply to bar charts
          if (chart.config.type !== 'bar') {
            ctx.restore();
            return;
          }
          
          // Draw error bars
          chart.data.datasets.forEach((dataset, i) => {
            if (!dataset.errorBars) return;
            
            const meta = chart.getDatasetMeta(i);
            
            meta.data.forEach((bar, index) => {
              const yMin = dataset.errorBars.yMin[index];
              const yMax = dataset.errorBars.yMax[index];
              
              if (yMin === undefined || yMax === undefined) return;
              
              const { x } = bar.getCenterPoint();
              const yScale = chart.scales.y;
              const yMinPixel = yScale.getPixelForValue(yMin);
              const yMaxPixel = yScale.getPixelForValue(yMax);
              const barWidth = bar.width / 3; // Adjust error bar width
              
              // Draw the error line
              ctx.beginPath();
              ctx.lineWidth = 2;
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
              ctx.moveTo(x, yMinPixel);
              ctx.lineTo(x, yMaxPixel);
              ctx.stroke();
              
              // Draw the top and bottom caps
              ctx.beginPath();
              ctx.moveTo(x - barWidth / 2, yMinPixel);
              ctx.lineTo(x + barWidth / 2, yMinPixel);
              ctx.moveTo(x - barWidth / 2, yMaxPixel);
              ctx.lineTo(x + barWidth / 2, yMaxPixel);
              ctx.stroke();
            });
          });
          
          ctx.restore();
        }
      };
    },
    
    // Update all charts with new data
    updateCharts: function(stats) {
      const elColor = CONFIG.colors.elinor;
      const yaColor = CONFIG.colors.yasha;
      const tieColor = CONFIG.colors.tie;
      
      // Win chart (Pie)
      this.updateWinChart(stats, elColor, yaColor, tieColor);
      
      // Average guesses chart
      this.updateAvgGuessesChart(stats, elColor, yaColor);
      
      // Win differential chart
      this.updateWinDiffChart(stats, elColor, yaColor);
    },
    
    // Update win percentage pie chart
    updateWinChart: function(stats, elColor, yaColor, tieColor) {
      const pieData = {
        labels: ['Elinor', 'Yasha', 'Ties'],
        datasets: [{
          data: [stats.elinorWinPct, stats.yashaWinPct, stats.ties ? (100-stats.elinorWinPct-stats.yashaWinPct) : 0],
          backgroundColor: [elColor, yaColor, tieColor]
        }]
      };
      
      if (!this.charts.winChart) {
        this.charts.winChart = new Chart(document.getElementById('winChart').getContext('2d'), {
          type: 'pie',
          data: pieData,
          options: { responsive:true, plugins:{legend:{display:true,position:'bottom'}} }
        });
      } else {
        this.charts.winChart.data = pieData;
        this.charts.winChart.update();
      }
    },
    
    // Update average guesses bar chart
    updateAvgGuessesChart: function(stats, elColor, yaColor) {
      const avgBar = {
        labels: ['Elinor', 'Yasha'],
        datasets: [{
          label: 'Avg # Guesses',
          data: [stats.elinorAvg, stats.yashaAvg],
          backgroundColor: [elColor, yaColor],
          borderRadius: CONFIG.charts.barRadius,
          errorBars: {
            yMin: [stats.elinorAvg - stats.elinorGuessStdDev, stats.yashaAvg - stats.yashaGuessStdDev],
            yMax: [stats.elinorAvg + stats.elinorGuessStdDev, stats.yashaAvg + stats.yashaGuessStdDev]
          }    
        }]
      };
      
      if (!this.charts.avgChart) {
        this.charts.avgChart = new Chart(document.getElementById('avgChart').getContext('2d'), {
          type: 'bar',
          data: avgBar,
          options: { 
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: CONFIG.charts.aspectRatio,
            scales: { y: { min:0, max:CONFIG.charts.maxGuesses, ticks:{stepSize:5}}},
            plugins: {
              legend: {display: false},
              datalabels: {
                color: '#fff',
                formatter: function(value) {
                  return value.toFixed(2);
                },
                font: {
                  weight: 'bold'
                },
                position: 'chartArea',
                anchor: 'start',
                align: 'bottom',
                clamp: true,
                offset: function(context) {
                  const chartHeight = context.chart.height;
                  return -chartHeight * CONFIG.charts.labelOffset;
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const dataset = context.dataset;
                    const index = context.dataIndex;
                    const value = dataset.data[index];
                    return `Avg: ${value.toFixed(2)} (±${dataset.errorBars.yMax[index] - value.toFixed(2)})`;
                  }
                }
              }    
            }
          },
          plugins: [ChartDataLabels, this.createErrorBarsPlugin()]
        });
      } else {
        this.charts.avgChart.data = avgBar;
        this.charts.avgChart.update();
      }
    },
    
    // Update win differential bar chart
    updateWinDiffChart: function(stats, elColor, yaColor) {
      const diffBar = {
        labels: ['Elinor', 'Yasha'],
        datasets: [{
          label: 'Avg Win Differential',
          data: [stats.elinorAvgDiff, stats.yashaAvgDiff],
          backgroundColor: [elColor, yaColor],
          borderRadius: CONFIG.charts.barRadius,
          errorBars: {
            yMin: [stats.elinorAvgDiff - stats.elinorDiffStdDev, stats.yashaAvgDiff - stats.yashaDiffStdDev],
            yMax: [stats.elinorAvgDiff + stats.elinorDiffStdDev, stats.yashaAvgDiff + stats.yashaDiffStdDev]
          }
        }]
      };
      
      if (!this.charts.diffChart) {
        this.charts.diffChart = new Chart(document.getElementById('diffChart').getContext('2d'), {
          type: 'bar',
          data: diffBar,
          options: { 
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: CONFIG.charts.aspectRatio,
            scales: { y: { min:0, max:20, ticks:{stepSize:2}}},
            plugins: {
              legend: {display: false},
              datalabels: {
                color: '#fff',
                formatter: function(value) {
                  return value.toFixed(2);
                },
                font: {
                  weight: 'bold'
                },
                position: 'chartArea',
                anchor: 'start',
                align: 'bottom',
                clamp: true,
                offset: function(context) {
                  const chartHeight = context.chart.height;
                  return -chartHeight * CONFIG.charts.labelOffset;
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const dataset = context.dataset;
                    const index = context.dataIndex;
                    const value = dataset.data[index];
                    return `Avg: ${value.toFixed(2)} (±${(dataset.errorBars.yMax[index] - value).toFixed(2)})`;
                  }
                }
              }
            }
          },
          plugins: [ChartDataLabels, this.createErrorBarsPlugin()]
        });
      } else {
        this.charts.diffChart.data = diffBar;
        this.charts.diffChart.update();
      }
    }
  };
  
  // Make ChartUtils available to other modules
  window.ChartUtils = ChartUtils;