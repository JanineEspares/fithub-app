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
});
