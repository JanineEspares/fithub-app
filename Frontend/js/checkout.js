$(function () {
  if (document.body.dataset.page !== 'checkout') return;

  const renderSummary = (cart) => {
    const items = cart?.items || [];
    if (!items.length) {
      $('#checkout-summary').html('<div class="text-muted">Your cart is empty.</div>');
      $('button[type="submit"]').prop('disabled', true);
      $('#checkout-summary').closest('.card').find('strong').text('$0.00');
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

    const shipping = 75;
    const total = subtotal + shipping;

    $('#checkout-summary').append(`
      <div class="d-flex justify-content-between mt-3"><span>Shipping</span><strong>$${shipping.toFixed(2)}</strong></div>
      <div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
    `);
    $('button[type="submit"]').prop('disabled', false);
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
      payment_method: form.find('select[name="payment_method"]').val()
    };

    window.FitHubUtils.apiRequest('/orders', {
      method: 'POST',
      data: payload
    }).done((response) => {
      const order = response.data?.order;
      const paymentMethod = payload.payment_method || 'cod';

      if (order && paymentMethod && paymentMethod !== 'cod') {
        // Call mock payment processor to mark as paid
        window.FitHubUtils.apiRequest('/payments/process', {
          method: 'POST',
          data: { order_id: order.id, payment_method: paymentMethod }
        }).always(() => {
          window.location.href = 'orders.html';
        });
      } else {
        window.location.href = 'orders.html';
      }
    }).fail((xhr) => {
      const message = xhr.responseJSON?.message || 'Checkout could not be completed right now.';
      alert(message);
    });
  });
});
