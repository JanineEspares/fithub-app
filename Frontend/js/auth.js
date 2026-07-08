$(function () {
  window.FitHubUtils.loadPartials(() => {
    const user = window.FitHubUtils.getUser();
    const isAdmin = user && user.role === 'admin';
    const isCustomer = user && user.role === 'customer';
    const isLoggedIn = !!user;

    if (isAdmin) {
      $('#admin-dashboard-link').show();
    } else {
      $('#admin-dashboard-link').hide();
    }

    $('.guest-only').toggleClass('d-none', isLoggedIn);
    $('.customer-only').toggleClass('d-none', !isCustomer);

    if (isCustomer && user.first_name) {
      $('#customer-name').text(`${user.first_name}`);
    }

    if (isLoggedIn) {
      $('#auth-link').addClass('d-none');
      $('#register-link').addClass('d-none');
      $('#logout-btn').removeClass('d-none');
    } else {
      $('#auth-link').removeClass('d-none');
      $('#register-link').removeClass('d-none');
      $('#logout-btn').addClass('d-none');
    }

    $('#logout-btn').off('click').on('click', function () {
      const token = window.FitHubUtils.getToken();
      if (token) {
        window.FitHubUtils.apiRequest('/auth/logout', { method: 'POST' })
          .always(() => {
            window.FitHubUtils.clearSession();
            window.location.href = 'home.html';
          });
      } else {
        window.FitHubUtils.clearSession();
        window.location.href = 'home.html';
      }
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
        const payload = response.data || response;
        if (payload?.token || payload?.accessToken || payload?.jwt_token) {
          window.FitHubUtils.setSession(payload);
        } else if (response.data?.user) {
          localStorage.setItem(window.FitHubConfig.userKey, JSON.stringify(response.data.user));
        }

        const user = window.FitHubUtils.getUser();
        const pendingRedirect = window.FitHubUtils.getRedirectAfterLogin();
        const redirectTarget = pendingRedirect || form.data('redirect') || (user?.role === 'admin' ? 'dashboard.html' : 'home.html');
        window.FitHubUtils.clearRedirectAfterLogin();
        window.location.href = redirectTarget;
      })
      .fail((xhr) => {
        form.find('.validation-error').remove();
        const message = xhr.responseJSON?.message || 'Authentication failed.';
        form.append(`<div class="validation-error">${message}</div>`);
      });
  });
});
