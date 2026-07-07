$(function () {
  if (document.body.dataset.page !== 'users') return;

  if (!window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  const loadUsers = () => {
    $.ajax({
      url: `${window.FitHubConfig.apiBaseUrl}/users`,
      method: 'GET',
      headers: window.FitHubUtils.authHeaders()
    }).done((response) => {
      $('#users-table').DataTable().clear().rows.add(response.data || []).draw();
    });
  };

  window.FitHubUtils.initDataTable('#users-table', {
    data: [],
    columns: [
      { data: 'id' },
      {
        data: null,
        render: (data, type, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim()
      },
      { data: 'email' },
      { data: 'role' },
      { data: 'status' },
      {
        data: null,
        render: (data, type, row) => `
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-brand" data-role-toggle="${row.id}" data-role="${row.role || 'customer'}">Role</button>
            <button class="btn btn-sm btn-outline-danger" data-user-deactivate="${row.id}">Deactivate</button>
          </div>
        `
      }
    ]
  });

  loadUsers();

  $(document).on('click', '[data-role-toggle]', function () {
    const id = $(this).data('role-toggle');
    const currentRole = $(this).data('role');
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    window.FitHubUtils.apiRequest(`/users/${id}/role`, { method: 'PATCH', data: { role: nextRole } }).done(() => loadUsers());
  });

  $(document).on('click', '[data-user-deactivate]', function () {
    const id = $(this).data('user-deactivate');
    window.FitHubUtils.apiRequest(`/users/${id}/deactivate`, { method: 'PATCH' }).done(() => loadUsers());
  });
});
