$(function () {
  if (document.body.dataset.page !== 'cart') return;

  const renderCart = (cart) => {
    const items = cart?.items || [];
    $('#cart-empty').toggle(items.length === 0);
    $('#cart-items').html(items.map((item) => {
      const variant = item.productVariant || {};
      const product = variant.product || {};
      const unitPrice = Number(variant.price || 0);
      const quantity = Number(item.quantity || 1);
      const lineTotal = unitPrice * quantity;
      return `
        <div class="card card-surface p-3">
          <div class="row align-items-center gx-3">
            <div class="col-md-7">
              <div class="fw-bold">${product.name || variant.variant_name || 'FitHub item'}</div>
              <div class="text-muted small">SKU: ${variant.sku || 'N/A'}</div>
              <div class="text-muted small">$${unitPrice.toFixed(2)} each</div>
            </div>
            <div class="col-md-5 text-md-end">
              <div class="fw-bold mb-2">$${lineTotal.toFixed(2)}</div>
              <div class="input-group input-group-sm justify-content-end mb-2" style="max-width: 160px;">
                <button class="btn btn-outline-secondary quantity-btn" type="button" data-action="decrease" data-item-id="${item.id}">-</button>
                <input class="form-control quantity-input text-center" type="number" min="1" value="${quantity}" data-item-id="${item.id}">
                <button class="btn btn-outline-secondary quantity-btn" type="button" data-action="increase" data-item-id="${item.id}">+</button>
              </div>
              <button class="btn btn-sm btn-outline-brand" data-remove-item="${item.id}">Remove</button>
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

  const updateCartItem = (itemId, quantity) => {
    if (quantity < 1) return;
    window.FitHubUtils.apiRequest(`/carts/items/${itemId}`, {
      method: 'PATCH',
      data: { quantity }
    }).always(() => loadCart());
  };

  $(document).on('click', '[data-remove-item]', function () {
    const itemId = $(this).data('remove-item');
    window.FitHubUtils.apiRequest(`/carts/items/${itemId}`, { method: 'DELETE' })
      .always(() => loadCart());
  });

  $(document).on('click', '.quantity-btn', function () {
    const itemId = $(this).data('item-id');
    const action = $(this).data('action');
    const input = $(`.quantity-input[data-item-id="${itemId}"]`);
    let quantity = Number(input.val() || 1);
    quantity = action === 'increase' ? quantity + 1 : Math.max(1, quantity - 1);
    input.val(quantity);
    updateCartItem(itemId, quantity);
  });

  $(document).on('change', '.quantity-input', function () {
    const itemId = $(this).data('item-id');
    const quantity = Math.max(1, Number($(this).val() || 1));
    $(this).val(quantity);
    updateCartItem(itemId, quantity);
  });

  loadCart();
});
