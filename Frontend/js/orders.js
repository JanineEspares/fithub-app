$(function () {
  if (document.body.dataset.page !== 'orders') return;
  window.FitHubUtils.initDataTable('#orders-table', {
    ajax: function (data, callback) {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/transactions`,
        method: 'GET',
        headers: window.FitHubUtils.authHeaders()
      }).done((response) => {
        callback({ data: response.data || [] });
      }).fail(() => callback({ data: [] }));
    },
    columns: [
      { data: 'id' },
      { data: 'order.order_number', defaultContent: '-' },
      { data: 'user.email', defaultContent: '-' },
      { data: 'status' },
      { data: null, render: () => '<button class="btn btn-sm btn-outline-brand">View</button>' }
    ]
  });
});
