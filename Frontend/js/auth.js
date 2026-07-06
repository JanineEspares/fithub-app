$(function () {
  window.FitHubUtils.loadPartials(() => {
    const user = window.FitHubUtils.getUser();
    if (user && user.role === 'admin') {
      $('#admin-dashboard-link').show();
    } else {
      $('#admin-dashboard-link').hide();
    }
  });

  if (document.body.dataset.page === 'deactivate') {
    $('#deactivate-user-btn').on('click', function () {
      window.location.href = 'users.html';
    });
  }

  $(document).on('submit', '[data-auth-form]', function (event) {
    event.preventDefault();
    const form = $(this);
    const payload = Object.fromEntries(new FormData(this).entries());

    window.FitHubUtils.apiRequest(form.attr('action'), {
      method: form.attr('method') || 'POST',
      data: payload
    })
      .done((response) => {
        if (response.data?.token) {
          window.FitHubUtils.setSession(response.data);
        }
        window.location.href = form.data('redirect') || 'home.html';
      })
      .fail((xhr) => {
        form.find('.validation-error').remove();
        const message = xhr.responseJSON?.message || 'Authentication failed.';
        form.append(`<div class="validation-error">${message}</div>`);
      });
  });
});
