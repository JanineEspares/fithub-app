$(function () {
  if (document.body.dataset.page !== 'inventory') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  const loadInventory = () => {
    $.ajax({
      url: `${window.FitHubConfig.apiBaseUrl}/reports/inventory`,
      method: 'GET',
      headers: window.FitHubUtils.authHeaders()
    }).done((response) => {
      const rows = response.data || [];
      $('#inventory-table').DataTable().clear().rows.add(rows).draw();
    });
  };

  window.FitHubUtils.initDataTable('#inventory-table', {
    data: [],
    columns: [
      { data: 'id' },
      { data: 'productVariant.product.name', defaultContent: 'Product' },
      { data: 'stock' },
      { data: 'status' },
      { data: null, render: (data, type, row) => `<button class="btn btn-sm btn-brand" data-stock-update="${row.id}">Update</button>` }
    ]
  });

  loadInventory();

  $(document).on('click', '[data-stock-update]', function () {
    const id = $(this).data('stock-update');
    const nextStock = Number(prompt('Enter new stock level', '0'));
    if (!Number.isFinite(nextStock)) return;
    window.FitHubUtils.apiRequest(`/reports/inventory/${id}`, { method: 'PUT', data: { stock: nextStock } }).done(() => loadInventory());
  });
});
