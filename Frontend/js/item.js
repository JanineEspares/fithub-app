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
    $('#item-price').text(`$${product.base_price || '0.00'}`);
    $('#item-status').text(product.status || 'active');
  });

  $('#add-to-cart-btn').on('click', function () {
    window.location.href = 'cart.html';
  });
});
