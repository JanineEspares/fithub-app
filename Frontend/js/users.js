$(function () {
  if (document.body.dataset.page !== 'users') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  window.FitHubUtils.initDataTable('#users-table', {
    ajax: function (data, callback) {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/users`,
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
      {
        data: null,
        render: (data, type, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim()
      },
      { data: 'email' },
      { data: 'role' },
      { data: 'status' }
    ]
  });
});
