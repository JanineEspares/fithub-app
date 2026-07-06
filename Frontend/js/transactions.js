$(function () {
  if (document.body.dataset.page !== 'transactions') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  const loadTransactions = () => {
    $.ajax({
      url: `${window.FitHubConfig.apiBaseUrl}/transactions`,
      method: 'GET',
      headers: window.FitHubUtils.authHeaders()
    }).done((response) => {
      $('#transactions-table').DataTable().clear().rows.add(response.data || []).draw();
    });
  };

  window.FitHubUtils.initDataTable('#transactions-table', {
    data: [],
    columns: [
      { data: 'id' },
      { data: 'order.order_number', defaultContent: '-' },
      { data: 'amount', render: (value) => `$${Number(value || 0).toFixed(2)}` },
      { data: 'status' },
      { data: null, render: (data, type, row) => `<button class="btn btn-sm btn-brand" data-update-transaction="${row.id}">Update</button>` }
    ]
  });

  loadTransactions();

  $(document).on('click', '[data-update-transaction]', function () {
    const id = $(this).data('update-transaction');
    const status = $('#transaction-status').val();
    window.FitHubUtils.apiRequest(`/transactions/${id}`, { method: 'PUT', data: { status } }).done(() => loadTransactions());
  });
});
