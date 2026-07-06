window.FitHubValidation = {
  bindPasswordMatch(formSelector, passwordSelector, confirmSelector) {
    $(document).on('input', `${formSelector} ${passwordSelector}, ${formSelector} ${confirmSelector}`, function () {
      const form = $(formSelector);
      const password = form.find(passwordSelector).val();
      const confirmPassword = form.find(confirmSelector).val();
      const target = form.find('[data-password-match-error]');
      if (password && confirmPassword && password !== confirmPassword) {
        target.text('Passwords do not match.');
      } else {
        target.text('');
      }
    });
  }
};
