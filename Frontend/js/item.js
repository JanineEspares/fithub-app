$(function () {
  if (document.body.dataset.page !== 'item') return;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || 1;

  $.ajax({
    url: `${window.FitHubConfig.apiBaseUrl}/products/${productId}`,
    method: 'GET'
  }).done((response) => {
    const product = response.data || {};
    $('#item-id').text(product.id || productId);
    $('#item-name').text(product.name || 'Product');
    $('#item-description').text(product.description || 'No product description available.');
    $('#item-price').text(`$${Number(product.base_price || 0).toFixed(2)}`);
    $('#item-status').text((product.status || 'active').toUpperCase());
  });

  $('#add-to-cart-btn').on('click', function () {
    const token = window.FitHubUtils.getToken();
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const quantity = Math.max(1, Number($('#item-qty').val() || 1));
    window.FitHubUtils.apiRequest('/carts/items', {
      method: 'POST',
      data: {
        product_id: productId,
        quantity
      }
    }).done(() => {
      window.location.href = 'cart.html';
    }).fail(() => {
      alert('Unable to add the item to cart right now.');
    });
  });
});
