$(function () {
  if (document.body.dataset.page !== 'dashboard') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.loadPartials();

  window.FitHubUtils.apiRequest('/dashboard/metrics').done((response) => {
    const data = response.data || {};
    $('.metrics-grid').html(`
      <div class="metric-card"><div class="metric-label">Users</div><div class="metric-value">${data.users || 0}</div></div>
      <div class="metric-card"><div class="metric-label">Products</div><div class="metric-value">${data.products || 0}</div></div>
      <div class="metric-card"><div class="metric-label">Orders</div><div class="metric-value">${data.orders || 0}</div></div>
      <div class="metric-card"><div class="metric-label">Transactions</div><div class="metric-value">${data.transactions || 0}</div></div>
    `);
  });

  window.FitHubUtils.apiRequest('/dashboard/charts').done((response) => {
    const status = response.data?.transactionStatus || [];
    const labels = status.map((item) => item.status);
    const values = status.map((item) => item.count);

    new Chart(document.getElementById('statusChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Transactions', data: values, backgroundColor: '#ff6b2c' }] }
    });

    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Trend', data: values, borderColor: '#1f8a70', tension: 0.35 }] }
    });

    new Chart(document.getElementById('mixChart'), {
      type: 'pie',
      data: { labels, datasets: [{ data: values, backgroundColor: ['#ff6b2c', '#1f8a70', '#264653', '#e9c46a'] }] }
    });
  });
});
