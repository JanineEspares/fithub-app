$(function () {
  if (document.body.dataset.page !== 'transactions') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.initDataTable('#transactions-table', {
    ajax: function (data, callback) {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/transactions`,
        method: 'GET',
        headers: window.FitHubUtils.authHeaders()
      }).done((response) => {
        callback({ data: response.data || [] });
      }).fail(() => {
        callback({ data: [] });
      });
    },
    columns: [
      { data: 'id' },
      { data: 'order.order_number', defaultContent: '-' },
      { data: 'amount' },
      { data: 'status' },
      { data: null, render: () => '<button class="btn btn-sm btn-brand">Update</button>' }
    ]
  });
});
