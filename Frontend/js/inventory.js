$(function () {
  if (document.body.dataset.page !== 'inventory') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.initDataTable('#inventory-table', {
    ajax: function (data, callback) {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/reports/inventory`,
        method: 'GET',
        headers: window.FitHubUtils.authHeaders()
      }).done((response) => {
        callback({ data: response.data || [] });
      }).fail(() => callback({ data: [] }));
    },
    columns: [
      { data: 'id' },
      { data: 'productVariant.product.name', defaultContent: 'Product' },
      { data: 'stock' },
      { data: 'status' },
      { data: null, render: () => '<button class="btn btn-sm btn-brand">Update</button>' }
    ]
  });
});
