$(function () {
  window.FitHubUtils.loadPartials(() => {
    const user = window.FitHubUtils.getUser();
    const isAdmin = user && user.role === 'admin';
    const isLoggedIn = !!user;

    if (isAdmin) {
      $('#admin-dashboard-link').show();
    } else {
      $('#admin-dashboard-link').hide();
    }

    if (isLoggedIn) {
      $('#auth-link').addClass('d-none');
      $('#logout-btn').removeClass('d-none');
    } else {
      $('#auth-link').removeClass('d-none');
      $('#logout-btn').addClass('d-none');
    }

    $('#logout-btn').off('click').on('click', function () {
      window.FitHubUtils.clearSession();
      window.location.href = 'login.html';
    });
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

        const user = window.FitHubUtils.getUser();
        const redirectTarget = form.data('redirect') || (user?.role === 'admin' ? 'dashboard.html' : 'home.html');
        window.location.href = redirectTarget;
      })
      .fail((xhr) => {
        form.find('.validation-error').remove();
        const message = xhr.responseJSON?.message || 'Authentication failed.';
        form.append(`<div class="validation-error">${message}</div>`);
      });
  });
});
