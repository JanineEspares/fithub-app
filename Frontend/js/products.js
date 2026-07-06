$(function () {
  if (document.body.dataset.page !== 'products' && document.body.dataset.page !== 'shop') return;

  if (document.body.dataset.page === 'products' && !window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  const productCard = (product) => `
    <article class="product-card">
      <div class="product-body">
        <div class="product-name">${product.name || 'Product'}</div>
        <div class="text-muted small">${product.brand || 'FitHub'}</div>
        <div class="text-muted small mt-2">${(product.description || 'A reliable choice for training and recovery.').slice(0, 100)}</div>
        <div class="product-price mt-2">$${Number(product.base_price || 0).toFixed(2)}</div>
        <div class="d-flex flex-wrap gap-2 mt-3">
          <a class="btn btn-sm btn-outline-brand" href="item.html?id=${product.id}">View Details</a>
          <a class="btn btn-sm btn-brand" href="item.html?id=${product.id}">Add to Cart</a>
        </div>
      </div>
    </article>
  `;

  if ($('#products-table').length) {
    window.FitHubUtils.initDataTable('#products-table', {
      ajax: function (data, callback) {
        $.ajax({
          url: `${window.FitHubConfig.apiBaseUrl}/products`,
          method: 'GET',
          headers: window.FitHubUtils.authHeaders()
        }).done((response) => {
          callback({ data: response.data || [] });
        }).fail(() => {
          callback({ data: [] });
        });
      },
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'base_price' },
        { data: 'status' },
        { data: null, render: () => '<button class="btn btn-sm btn-brand">View</button>' }
      ]
    });
  }

  if ($('#shop-products-grid').length) {
    let page = 1;
    const loadShopProducts = () => {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/products?page=${page}`,
        method: 'GET'
      }).done((response) => {
        const products = response.data || [];
        $('#shop-products-grid').append(products.map(productCard).join(''));
      });
    };

    window.FitHubAutocomplete.init('#shop-search', '/products', (item) => `
      <a class="autocomplete-item" href="item.html?id=${item.id}">${item.name}</a>
    `, '#shop-search-suggestions');

    loadShopProducts();
    window.FitHubInfiniteScroll.init('#shop-sentinel', () => {
      page += 1;
      return loadShopProducts();
    });
  }
});
