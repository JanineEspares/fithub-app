window.FitHubCharts = {
  renderDashboardCharts(canvasId, payload) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: payload.labels,
        datasets: payload.datasets
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
};
