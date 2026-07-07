/**
 * ============================================
 * FITHUB ADMIN LOGIN SCRIPT
 * ============================================
 * 
 * Handles admin authentication with:
 * - Email/Password validation
 * - JWT token management
 * - Session storage
 * - AJAX login request
 * - Error handling with SweetAlert2
 * - Remember me functionality
 * - Password visibility toggle
 */

$(document).ready(function () {
  // ============================================
  // 1. PASSWORD VISIBILITY TOGGLE
  // ============================================
  $('#passwordToggle').on('click', function () {
    const passwordInput = $('#adminPassword');
    const icon = $(this).find('i');

    if (passwordInput.attr('type') === 'password') {
      passwordInput.attr('type', 'text');
      icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      passwordInput.attr('type', 'password');
      icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });

  // ============================================
  // 2. FORM VALIDATION & ERROR DISPLAY
  // ============================================
  const clearErrors = () => {
    $('.error-message').hide();
    $('.form-control').removeClass('is-invalid');
  };

  const showFieldError = (fieldId, message) => {
    const errorElement = $(`#${fieldId}Error`);
    errorElement.text(message).show();
    $(`#${fieldId}`).addClass('is-invalid');
  };

  const validateForm = () => {
    clearErrors();
    let isValid = true;

    // Validate email
    const email = $('#adminEmail').val().trim();
    if (!email) {
      showFieldError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    const password = $('#adminPassword').val();
    if (!password) {
      showFieldError('password', 'Password is required');
      isValid = false;
    } else if (password.length < 6) {
      showFieldError('password', 'Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ============================================
  // 3. CLEAR ERRORS ON INPUT FOCUS
  // ============================================
  $('.form-control').on('focus', function () {
    $(this).removeClass('is-invalid');
    const fieldName = $(this).attr('id').replace('admin', '').toLowerCase();
    $(`#${fieldName}Error`).hide();
  });

  // ============================================
  // 4. HANDLE LOGIN FORM SUBMISSION
  // ============================================
  $('#adminLoginForm').on('submit', function (e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Get form data
    const email = $('#adminEmail').val().trim();
    const password = $('#adminPassword').val();
    const rememberMe = $('#rememberMe').is(':checked');

    // Show loading state
    const loginBtn = $('#loginBtn');
    loginBtn.prop('disabled', true).addClass('btn-login-loading');
    loginBtn.text('Logging in...');

    // Send AJAX request
    $.ajax({
      url: 'http://localhost:4000/api/auth/login',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        email: email,
        password: password
      }),
      timeout: 10000, // 10 second timeout
      success: function (response) {
        if (response.success && response.data?.token) {
          // ============================================
          // SUCCESSFUL LOGIN
          // ============================================
          const token = response.data.token;
          const user = response.data.user;

          // Determine storage type based on "Remember Me"
          const storage = rememberMe ? localStorage : sessionStorage;

          // Save authentication data
          storage.setItem('fithub_token', token);
          storage.setItem('fithub_user', JSON.stringify(user));

          // Log for debugging
          console.log('✅ Login successful', {
            user: user.email,
            role: user.role,
            storage: rememberMe ? 'localStorage (7 days)' : 'sessionStorage (this session)'
          });

          // Show success notification
          Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: `Hello ${user.first_name} ${user.last_name}`,
            timer: 1500,
            timerProgressBar: true,
            didClose: function () {
              // Redirect to admin dashboard
              window.location.href = 'dashboard.html';
            }
          });
        } else {
          // Invalid response format
          throw new Error('Invalid response format from server');
        }
      },
      error: function (xhr, status, error) {
        // ============================================
        // ERROR HANDLING
        // ============================================
        let errorMessage = 'An error occurred. Please try again.';
        let errorTitle = 'Login Failed';

        if (status === 'timeout') {
          errorMessage = 'Connection timeout. Please check your internet connection.';
          errorTitle = 'Connection Error';
        } else if (xhr.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
          errorTitle = 'Authentication Failed';
        } else if (xhr.status === 403) {
          errorMessage = 'Your account does not have admin access.';
          errorTitle = 'Access Denied';
        } else if (xhr.status === 400) {
          errorMessage = xhr.responseJSON?.message || 'Invalid input. Please check your credentials.';
          errorTitle = 'Validation Error';
        } else if (xhr.status === 500) {
          errorMessage = 'Server error. Please try again later.';
          errorTitle = 'Server Error';
        } else if (xhr.status === 0) {
          errorMessage = 'Unable to connect to the server. Is the backend running?';
          errorTitle = 'Connection Error';
        }

        console.error('❌ Login error:', {
          status: xhr.status,
          statusText: xhr.statusText,
          error: error,
          response: xhr.responseJSON
        });

        // Show error alert
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Try Again'
        });
      },
      complete: function () {
        // ============================================
        // RESET BUTTON STATE
        // ============================================
        loginBtn.prop('disabled', false).removeClass('btn-login-loading');
        loginBtn.html('<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Login to Dashboard');
      }
    });
  });

  // ============================================
  // 5. FORGOT PASSWORD FUNCTIONALITY (OPTIONAL)
  // ============================================
  $('#resetPasswordBtn').on('click', function () {
    const email = $('#forgotEmail').val().trim();

    if (!email || !isValidEmail(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    $(this).prop('disabled', true).text('Sending...');

    // Send password reset request (API endpoint ready for implementation)
    $.ajax({
      url: 'http://localhost:4000/api/auth/forgot-password',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: email }),
      success: function (response) {
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Check your email for password reset instructions.',
          confirmButtonColor: '#667eea'
        });
        $('#forgotPasswordModal').modal('hide');
        $('#forgotEmail').val('');
      },
      error: function () {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not send reset email. Please try again later.',
          confirmButtonColor: '#667eea'
        });
      },
      complete: function () {
        $('#resetPasswordBtn').prop('disabled', false).text('Send Reset Link');
      }
    });
  });

  // ============================================
  // 6. AUTO-FILL REMEMBERED CREDENTIALS (OPTIONAL)
  // ============================================
  window.addEventListener('load', function () {
    // Check if browser has stored credentials
    const storedEmail = localStorage.getItem('fithub_admin_email');
    if (storedEmail) {
      $('#adminEmail').val(storedEmail);
      $('#rememberMe').prop('checked', true);
      $('#adminPassword').focus(); // Focus on password field
    }
  });

  // ============================================
  // 7. SAVE EMAIL IF REMEMBER ME CHECKED
  // ============================================
  $('#rememberMe').on('change', function () {
    if ($(this).is(':checked')) {
      localStorage.setItem('fithub_admin_email', $('#adminEmail').val());
    } else {
      localStorage.removeItem('fithub_admin_email');
    }
  });

  // ============================================
  // 8. KEYBOARD SHORTCUTS
  // ============================================
  $(document).on('keydown', function (e) {
    // Alt + L = Focus on email (Alt + L for Login)
    if (e.altKey && e.which === 76) {
      e.preventDefault();
      $('#adminEmail').focus();
    }
  });

  // ============================================
  // 9. PREVENT DOUBLE SUBMISSION
  // ============================================
  $('#adminLoginForm').on('submit', function () {
    $(this).find('input, button').prop('disabled', true);
  });

  // ============================================
  // 10. SHOW/HIDE PASSWORD ON INPUT
  // ============================================
  $('#adminPassword').on('keyup', function () {
    // Could add password strength indicator here in future
  });

  // Check if already logged in
  window.addEventListener('load', function () {
    const token = sessionStorage.getItem('fithub_token') || localStorage.getItem('fithub_token');
    if (token) {
      // User is already logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  });
});

/**
 * UTILITY FUNCTION: Clear all authentication data
 * Usage: LogoutManager.logout()
 */
const AdminAuthManager = {
  /**
   * Save authentication token and user data
   */
  saveAuth: function (token, user, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('fithub_token', token);
    storage.setItem('fithub_user', JSON.stringify(user));
  },

  /**
   * Get stored authentication token
   */
  getToken: function () {
    return sessionStorage.getItem('fithub_token') || localStorage.getItem('fithub_token');
  },

  /**
   * Get stored user data
   */
  getUser: function () {
    const userStr = sessionStorage.getItem('fithub_user') || localStorage.getItem('fithub_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Clear all authentication data (logout)
   */
  clearAuth: function () {
    sessionStorage.removeItem('fithub_token');
    sessionStorage.removeItem('fithub_user');
    localStorage.removeItem('fithub_token');
    localStorage.removeItem('fithub_user');
    localStorage.removeItem('fithub_admin_email');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: function () {
    return !!this.getToken();
  },

  /**
   * Check if user is admin
   */
  isAdmin: function () {
    const user = this.getUser();
    return user && user.role === 'admin';
  }
};
