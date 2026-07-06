$(function () {
  if (document.body.dataset.page !== 'checkout') return;

  const renderSummary = (cart) => {
    const items = cart?.items || [];
    if (!items.length) {
      $('#checkout-summary').html('<div class="text-muted">Your cart is empty.</div>');
      return;
    }

    const subtotal = items.reduce((sum, item) => {
      const variant = item.productVariant || {};
      return sum + (Number(variant.price || 0) * Number(item.quantity || 1));
    }, 0);

    $('#checkout-summary').html(items.map((item) => {
      const variant = item.productVariant || {};
      const quantity = Number(item.quantity || 1);
      const lineTotal = (Number(variant.price || 0) * quantity).toFixed(2);
      return `<div class="d-flex justify-content-between"><span>${variant.variant_name || 'FitHub item'} × ${quantity}</span><strong>$${lineTotal}</strong></div>`;
    }).join(''));
    $('#checkout-summary').append(`<div class="d-flex justify-content-between mt-3"><span>Shipping</span><strong>$75.00</strong></div><div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><strong>$${(subtotal + 75).toFixed(2)}</strong></div>`);
  };

  window.FitHubUtils.apiRequest('/carts', { method: 'GET' })
    .done((response) => renderSummary(response.data))
    .fail(() => renderSummary({ items: [] }));

  $('#checkout-form').on('submit', function (event) {
    event.preventDefault();
    const token = window.FitHubUtils.getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const form = $(this);
    const payload = {
      recipient_name: form.find('input[name="recipient_name"]').val(),
      contact_number: form.find('input[name="contact_number"]').val(),
      address_line: form.find('input[name="address_line"]').val(),
      city: form.find('input[name="city"]').val(),
      province: form.find('input[name="province"]').val(),
      postal_code: form.find('input[name="postal_code"]').val(),
      payment_method: form.find('select[name="payment_method"]').val(),
      items: []
    };

    window.FitHubUtils.apiRequest('/carts', { method: 'GET' })
      .done((response) => {
        payload.items = (response.data?.items || []).map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity
        }));

        window.FitHubUtils.apiRequest('/orders', {
          method: 'POST',
          data: payload
        }).done(() => {
          window.location.href = 'orders.html';
        }).fail(() => {
          alert('Checkout could not be completed right now.');
        });
      });
  });
});
