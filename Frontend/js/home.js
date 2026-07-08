$(function () {
  if (document.body.dataset.page !== 'home') return;
  window.FitHubUtils.loadPartials();

  window.FitHubAutocomplete.init('#home-search', '/products', (item) => `
    <a class="autocomplete-item" href="item.html?id=${item.id}">${item.name}</a>
  `, '#home-search-suggestions');

  let page = 1;
  const loadProducts = () => {
    $.ajax({
      url: `${window.FitHubConfig.apiBaseUrl}/products?page=${page}`,
      method: 'GET'
    }).done((response) => {
      const payload = response?.data || {};
      const products = Array.isArray(payload) ? payload : (payload.products || []);

      if (!products.length) {
        $('#home-products-grid').html('<div class="text-muted">No products available right now.</div>');
        return;
      }

      $('#home-products-grid').append(products.map((product) => `
        <article class="product-card">
          <div class="product-body">
            <div class="product-name">${product.name || 'Product'}</div>
            <div class="text-muted small">${product.brand || 'FitHub'}</div>
            <div class="text-muted small mt-2">${(product.description || 'Designed for training, recovery, and everyday fitness.').slice(0, 100)}</div>
            <div class="product-price mt-2">${window.FitHubUtils.formatCurrency(product.base_price)}</div>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <a class="btn btn-sm btn-outline-brand" href="item.html?id=${product.id}">View Details</a>
              <a class="btn btn-sm btn-brand" href="item.html?id=${product.id}">Add to Cart</a>
            </div>
          </div>
        </article>
      `).join(''));
    });
  };
  loadProducts();
  // Load metrics: total products and categories
  $.ajax({ url: `${window.FitHubConfig.apiBaseUrl}/products?page=1&limit=1`, method: 'GET' })
    .done((response) => {
      const total = response.data && response.data.pagination ? response.data.pagination.total : (Array.isArray(response.data) ? response.data.length : 0);
      $('#metric-products').text(total);
    })
    .fail(() => {
      $('#metric-products').text('—');
    });

  $.ajax({ url: `${window.FitHubConfig.apiBaseUrl}/categories`, method: 'GET' })
    .done((response) => {
      const cats = Array.isArray(response.data) ? response.data.length : 0;
      $('#metric-categories').text(cats);
    })
    .fail(() => {
      $('#metric-categories').text('—');
    });
  window.FitHubInfiniteScroll.init('#home-sentinel', () => {
    page += 1;
    return loadProducts();
  });
});
