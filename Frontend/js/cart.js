$(function () {
  if (document.body.dataset.page !== 'cart') return;
  const cartItems = [
    { name: 'Protein Shaker Bottle', qty: 1, price: 350 },
    { name: 'Resistance Bands', qty: 2, price: 420 }
  ];

  $('#cart-empty').toggle(cartItems.length === 0);
  $('#cart-items').html(cartItems.map((item) => `
    <div class="card card-surface p-3">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <div class="fw-bold">${item.name}</div>
          <div class="text-muted small">Quantity: ${item.qty}</div>
        </div>
        <div class="text-end">
          <div class="fw-bold">$${item.price}</div>
          <button class="btn btn-sm btn-outline-brand mt-2">Remove</button>
        </div>
      </div>
    </div>
  `).join(''));

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  $('#cart-subtotal').text(`$${subtotal.toFixed(2)}`);
  $('#cart-total').text(`$${subtotal.toFixed(2)}`);
});
