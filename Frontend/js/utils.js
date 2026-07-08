window.FitHubUtils = {
  getToken() {
    return localStorage.getItem(window.FitHubConfig.tokenKey);
  },
  getUser() {
    const value = localStorage.getItem(window.FitHubConfig.userKey);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  },
  setSession(payload) {
    const token = payload.token || payload.accessToken || payload.jwt_token;
    const user = payload.user || payload.customer || payload.profile || null;

    if (!token) return;

    localStorage.setItem(window.FitHubConfig.tokenKey, token);
    if (user) {
      localStorage.setItem(window.FitHubConfig.userKey, JSON.stringify(user));
    }
  },
  clearSession() {
    localStorage.removeItem(window.FitHubConfig.tokenKey);
    localStorage.removeItem(window.FitHubConfig.userKey);
  },
  authHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  formatCurrency(amount) {
    const value = Number(amount) || 0;
    return `₱${value.toFixed(2)}`;
  },
  apiRequest(url, options = {}) {
    return $.ajax({
      url: `${window.FitHubConfig.apiBaseUrl}${url}`,
      method: options.method || 'GET',
      data: options.data ? JSON.stringify(options.data) : undefined,
      contentType: options.contentType === false ? false : 'application/json',
      processData: options.processData ?? true,
      headers: {
        ...this.authHeaders(),
        ...(options.headers || {})
      }
    });
  },
  loadPartials(callback) {
    $('#app-header').load('partials/header.html', () => {
      if (typeof callback === 'function') {
        callback();
      }
    });
    $('#app-footer').load('partials/footer.html');
  },
  requireAdminAccess(redirectUrl = 'home.html') {
    const user = this.getUser();

    if (!user || user.role !== 'admin') {
      window.location.replace(redirectUrl);
      return false;
    }

    return true;
  },
  initDataTable(selector, options = {}) {
    if (!$.fn.DataTable || !$(selector).length) {
      return null;
    }
    return $(selector).DataTable({
      paging: false,
      info: false,
      lengthChange: false,
      order: [],
      ...options
    });
  }
};
