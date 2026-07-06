$(function () {
  if (document.body.dataset.page !== 'cart') return;

  const renderCart = (cart) => {
    const items = cart?.items || [];
    $('#cart-empty').toggle(items.length === 0);
    $('#cart-items').html(items.map((item) => {
      const variant = item.productVariant || {};
      const unitPrice = Number(variant.price || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;
      return `
        <div class="card card-surface p-3">
          <div class="d-flex justify-content-between gap-3">
            <div>
              <div class="fw-bold">${variant.variant_name || 'FitHub item'}</div>
              <div class="text-muted small">Quantity: ${quantity}</div>
            </div>
            <div class="text-end">
              <div class="fw-bold">$${lineTotal.toFixed(2)}</div>
              <button class="btn btn-sm btn-outline-brand mt-2" data-remove-item="${item.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join(''));

    const subtotal = items.reduce((sum, item) => {
      const variant = item.productVariant || {};
      return sum + (Number(variant.price || 0) * Number(item.quantity || 1));
    }, 0);
    const shipping = items.length ? 75 : 0;
    const total = subtotal + shipping;
    $('#cart-subtotal').text(`$${subtotal.toFixed(2)}`);
    $('#cart-shipping').text(`$${shipping.toFixed(2)}`);
    $('#cart-total').text(`$${total.toFixed(2)}`);
  };

  const loadCart = () => {
    const token = window.FitHubUtils.getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    window.FitHubUtils.apiRequest('/carts', { method: 'GET' })
      .done((response) => renderCart(response.data))
      .fail(() => renderCart({ items: [] }));
  };

  $(document).on('click', '[data-remove-item]', function () {
    const itemId = $(this).data('remove-item');
    window.FitHubUtils.apiRequest(`/carts/items/${itemId}`, { method: 'DELETE' })
      .always(() => loadCart());
  });

  loadCart();
});
