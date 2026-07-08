$(function () {
  if (document.body.dataset.page !== 'order-details') return;
  if (!window.FitHubUtils.requireCustomerAccess('login.html')) return;

  const orderId = new URLSearchParams(window.location.search).get('id');
  const content = $('#order-details-content');

  if (!orderId) {
    content.html('<div class="alert alert-danger">Order ID is missing.</div>');
    return;
  }

  function getStatusBadge(status) {
    const statusMap = {
      pending: { class: 'warning', text: 'Pending' },
      processing: { class: 'info', text: 'Processing' },
      completed: { class: 'success', text: 'Completed' },
      cancelled: { class: 'danger', text: 'Cancelled' }
    };
    const statusData = statusMap[status] || { class: 'secondary', text: status };
    return `<span class="badge bg-${statusData.class}">${statusData.text}</span>`;
  }

  function renderOrder(order) {
    const orderDate = new Date(order.created_at).toLocaleString();
    const items = order.items || [];
    const itemRows = items.map(item => {
      const variant = item.productVariant || {};
      const product = variant.product || {};
      const itemName = product.name || variant.variant_name || 'Product';
      const unitPrice = Number(item.unit_price || 0).toFixed(2);
      const subtotal = Number(item.subtotal || 0).toFixed(2);

      return `
        <tr>
          <td>${itemName}</td>
          <td>${variant.variant_name || '-'}</td>
          <td>${item.quantity}</td>
          <td>$${unitPrice}</td>
          <td>$${subtotal}</td>
        </tr>
      `;
    }).join('');

    content.html(`
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="mb-4">
            <h2 class="h5">Order #${order.order_number}</h2>
            <div class="d-flex flex-wrap gap-3 text-muted small">
              <span><strong>Date:</strong> ${orderDate}</span>
              <span><strong>Status:</strong> ${getStatusBadge(order.status)}</span>
              <span><strong>Total:</strong> $${Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="card card-surface p-3 mb-4">
            <h3 class="h6 mb-3">Shipping Information</h3>
            <div class="row g-2">
              <div class="col-12"><strong>Name:</strong> ${order.recipient_name || '-'}</div>
              <div class="col-12"><strong>Contact:</strong> ${order.contact_number || '-'}</div>
              <div class="col-12"><strong>Address:</strong> ${order.address_line || '-'}, ${order.city || '-'} ${order.province || ''}, ${order.postal_code || ''}</div>
            </div>
          </div>

          <div class="card card-surface p-3">
            <h3 class="h6 mb-3">Items</h3>
            <div class="table-responsive">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-surface p-3">
            <h3 class="h6 mb-3">Order Summary</h3>
            <div class="d-flex justify-content-between mb-2"><span>Items</span><strong>${items.length}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Shipping</span><strong>$75.00</strong></div>
            <hr>
            <div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><strong>$${Number(order.total_amount || 0).toFixed(2)}</strong></div>
            <a href="orders.html" class="btn btn-outline-brand btn-sm d-block mt-3">Back to Orders</a>
          </div>
        </div>
      </div>
    `);
  }

  window.FitHubUtils.apiRequest(`/orders/${orderId}`, { method: 'GET' })
    .done((response) => {
      if (response.success && response.data) {
        renderOrder(response.data);
      } else {
        content.html('<div class="alert alert-danger">Unable to load order details.</div>');
      }
    })
    .fail(() => {
      content.html('<div class="alert alert-danger">Unable to load order details.</div>');
    });
});
