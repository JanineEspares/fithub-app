/**
 * ============================================
 * CUSTOMER PROFILE MANAGEMENT
 * ============================================
 * Handles profile viewing and editing
 */

$(function () {
  // Check authentication
  const user = window.FitHubUtils.getUser();
  if (!user || user.role !== 'customer') {
    window.location.href = 'login.html';
    return;
  }

  // Load profile data on page load
  loadProfileData();
  loadOrders();

  // Handle personal info form submission
  $('#personal-info-form').on('submit', function (e) {
    e.preventDefault();
    updateProfile('personal');
  });

  // Handle contact info form submission
  $('#contact-info-form').on('submit', function (e) {
    e.preventDefault();
    updateProfile('contact');
  });

  // Handle password change form submission
  $('#change-password-form').on('submit', function (e) {
    e.preventDefault();
    changePassword();
  });
});

/**
 * Load customer's profile data
 */
function loadProfileData() {
  const token = window.FitHubUtils.getToken();

  $.ajax({
    url: `${window.FitHubConfig.apiBaseUrl}/auth/profile`,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: function (response) {
      if (response.success && response.data) {
        const profile = response.data;
        
        // Populate personal information
        $('#first-name').val(profile.first_name || '');
        $('#last-name').val(profile.last_name || '');
        $('#email').val(profile.email || '');
        
        // Populate contact information
        $('#phone-number').val(profile.phone_number || '');
        $('#address').val(profile.address || '');
      }
    },
    error: function (xhr) {
      Swal.fire('Error', 'Failed to load profile data.', 'error');
      console.error('Load profile error:', xhr);
    }
  });
}

/**
 * Update customer's profile
 * @param {string} type - 'personal' or 'contact'
 */
function updateProfile(type) {
  const token = window.FitHubUtils.getToken();
  let formData = {};

  if (type === 'personal') {
    formData = {
      first_name: $('#first-name').val(),
      last_name: $('#last-name').val()
    };
  } else if (type === 'contact') {
    formData = {
      phone_number: $('#phone-number').val(),
      address: $('#address').val()
    };
  }

  $.ajax({
    url: `${window.FitHubConfig.apiBaseUrl}/auth/customer/profile`,
    type: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(formData),
    success: function (response) {
      if (response.success) {
        // Update local user data
        const currentUser = window.FitHubUtils.getUser();
        const updatedUser = {
          ...currentUser,
          ...response.data
        };
        window.FitHubUtils.setSession({
          token: token,
          user: updatedUser
        });

        Swal.fire(
          'Success',
          type === 'personal' ? 'Personal information updated successfully.' : 'Contact information updated successfully.',
          'success'
        );
      } else {
        Swal.fire('Error', response.message || 'Failed to update profile.', 'error');
      }
    },
    error: function (xhr) {
      const message = xhr.responseJSON?.message || 'Failed to update profile.';
      Swal.fire('Error', message, 'error');
      console.error('Update profile error:', xhr);
    }
  });
}

/**
 * Change customer's password
 */
function changePassword() {
  const current_password = $('#current-password').val();
  const new_password = $('#new-password').val();
  const confirm_new_password = $('#confirm-new-password').val();

  // Validate passwords match
  if (new_password !== confirm_new_password) {
    Swal.fire('Error', 'New passwords do not match.', 'error');
    return;
  }

  // Validate password length
  if (new_password.length < 8) {
    Swal.fire('Error', 'New password must be at least 8 characters.', 'error');
    return;
  }

  const token = window.FitHubUtils.getToken();

  $.ajax({
    url: `${window.FitHubConfig.apiBaseUrl}/auth/customer/change-password`,
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      current_password: current_password,
      new_password: new_password
    }),
    success: function (response) {
      if (response.success) {
        Swal.fire(
          'Success',
          'Password changed successfully. Please log in again.',
          'success'
        ).then(() => {
          window.FitHubUtils.clearSession();
          window.location.href = 'login.html';
        });
      } else {
        Swal.fire('Error', response.message || 'Failed to change password.', 'error');
      }
    },
    error: function (xhr) {
      const message = xhr.responseJSON?.message || 'Failed to change password.';
      Swal.fire('Error', message, 'error');
      console.error('Change password error:', xhr);
    }
  });
}

/**
 * Load customer's orders
 */
function loadOrders() {
  const token = window.FitHubUtils.getToken();

  $.ajax({
    url: `${window.FitHubConfig.apiBaseUrl}/customer/orders`,
    type: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    success: function (response) {
      $('#loading-orders').hide();
      
      if (response.success && response.data && response.data.length > 0) {
        displayOrders(response.data);
      } else {
        $('#orders-list').html(
          '<p class="text-center text-muted">No orders yet. <a href="shop.html">Start shopping!</a></p>'
        );
      }
    },
    error: function (xhr) {
      $('#loading-orders').hide();
      $('#orders-list').html(
        '<p class="text-center text-danger">Failed to load orders.</p>'
      );
      console.error('Load orders error:', xhr);
    }
  });
}

/**
 * Display customer's orders
 * @param {array} orders - Array of order objects
 */
function displayOrders(orders) {
  let html = '<div class="table-responsive">';
  html += '<table class="table table-hover">';
  html += '<thead class="table-light"><tr>';
  html += '<th>Order #</th>';
  html += '<th>Date</th>';
  html += '<th>Items</th>';
  html += '<th>Total</th>';
  html += '<th>Status</th>';
  html += '<th></th>';
  html += '</tr></thead>';
  html += '<tbody>';

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString();
    const statusBadge = getStatusBadge(order.status);
    
    html += '<tr>';
    html += `<td><strong>#${order.id}</strong></td>`;
    html += `<td>${date}</td>`;
    html += `<td>${order.OrderItems?.length || 0} item(s)</td>`;
    html += `<td>$${parseFloat(order.total).toFixed(2)}</td>`;
    html += `<td>${statusBadge}</td>`;
    html += `<td><a href="order-details.html?id=${order.id}" class="btn btn-sm btn-outline-primary">View</a></td>`;
    html += '</tr>';
  });

  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  $('#orders-list').html(html);
}

/**
 * Get status badge HTML
 * @param {string} status - Order status
 * @returns {string} Badge HTML
 */
function getStatusBadge(status) {
  const statusMap = {
    'pending': { class: 'warning', text: 'Pending' },
    'confirmed': { class: 'info', text: 'Confirmed' },
    'preparing': { class: 'info', text: 'Preparing' },
    'packing': { class: 'primary', text: 'Packing' },
    'shipped': { class: 'primary', text: 'Shipped' },
    'delivered': { class: 'success', text: 'Delivered' },
    'cancelled': { class: 'danger', text: 'Cancelled' }
  };

  const statusData = statusMap[status] || { class: 'secondary', text: status };
  return `<span class="badge bg-${statusData.class}">${statusData.text}</span>`;
}
