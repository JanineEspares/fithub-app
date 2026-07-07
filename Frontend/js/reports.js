$(function () {
  if (document.body.dataset.page !== 'reports') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.apiRequest('/reports/sales').done((response) => {
    const data = response.data || {};
    const summaryValue = Number(data.total_sales || 0);
    const labels = ['Sales'];
    const values = [summaryValue];

    $('.metric-card').eq(0).find('.metric-value').text(`PHP ${summaryValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('.metric-card').eq(1).find('.metric-value').text(data.transaction_count || 0);
    $('.metric-card').eq(2).find('.metric-value').text(data.transaction_count || 0);

    new Chart(document.getElementById('reportBarChart'), { type: 'bar', data: { labels, datasets: [{ label: 'Sales', data: values, backgroundColor: '#ff6b2c' }] } });
    new Chart(document.getElementById('reportLineChart'), { type: 'line', data: { labels, datasets: [{ label: 'Sales Trend', data: values, borderColor: '#1f8a70' }] } });
    new Chart(document.getElementById('reportPieChart'), { type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ['#ff6b2c'] }] } });
  });
});
