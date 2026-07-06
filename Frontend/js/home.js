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
      const products = response.data || [];
      $('#home-products-grid').append(products.map((product) => `
        <article class="product-card">
          <div class="product-body">
            <div class="product-name">${product.name || 'Product'}</div>
            <div class="text-muted small">${product.brand || 'FitHub'}</div>
            <div class="text-muted small mt-2">${(product.description || 'Designed for training, recovery, and everyday fitness.') .slice(0, 100)}</div>
            <div class="product-price mt-2">$${product.base_price || '0.00'}</div>
          </div>
        </article>
      `).join(''));
    });
  };

  loadProducts();
  window.FitHubInfiniteScroll.init('#home-sentinel', () => {
    page += 1;
    return loadProducts();
  });
});
