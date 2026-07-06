$(function () {
  if (document.body.dataset.page !== 'orders') return;
  window.FitHubUtils.initDataTable('#orders-table', {
    ajax: function (data, callback) {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/orders`,
        method: 'GET',
        headers: window.FitHubUtils.authHeaders()
      }).done((response) => {
        callback({ data: response.data || [] });
      }).fail(() => callback({ data: [] }));
    },
    columns: [
      { data: 'id' },
      { data: 'order_number', defaultContent: '-' },
      { data: 'recipient_name', defaultContent: '-' },
      { data: 'status', defaultContent: '-' },
      { data: null, render: (data) => `<span class="text-muted">$${Number(data.total_amount || 0).toFixed(2)}</span>` }
    ]
  });
});
