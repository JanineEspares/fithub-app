$(function () {
  if (document.body.dataset.page !== 'reports') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.apiRequest('/reports/sales').done((response) => {
    const data = response.data || {};
    const labels = ['Summary'];
    const values = [data.total_sales || 0];
    new Chart(document.getElementById('reportBarChart'), { type: 'bar', data: { labels, datasets: [{ label: 'Sales', data: values, backgroundColor: '#ff6b2c' }] } });
    new Chart(document.getElementById('reportLineChart'), { type: 'line', data: { labels, datasets: [{ label: 'Sales Trend', data: values, borderColor: '#1f8a70' }] } });
    new Chart(document.getElementById('reportPieChart'), { type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ['#ff6b2c'] }] } });
  });
});
