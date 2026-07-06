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
    const refreshProducts = () => {
      $.ajax({
        url: `${window.FitHubConfig.apiBaseUrl}/products`,
        method: 'GET',
        headers: window.FitHubUtils.authHeaders()
      }).done((response) => {
        const rows = response.data || [];
        const table = $('#products-table').DataTable();
        table.clear().rows.add(rows).draw();
      });
    };

    window.FitHubUtils.initDataTable('#products-table', {
      data: [],
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'base_price', render: (value) => `$${Number(value || 0).toFixed(2)}` },
        { data: 'status', render: (value) => (value || 'active').toString().replace(/_/g, ' ') },
        { data: null, render: (data, type, row) => `<button class="btn btn-sm btn-brand" data-delete-product="${row.id}">Delete</button>` }
      ]
    });

    refreshProducts();

    $(document).on('click', '[data-delete-product]', function () {
      const id = $(this).data('delete-product');
      window.FitHubUtils.apiRequest(`/products/${id}`, { method: 'DELETE' }).done(() => refreshProducts());
    });
  }

  $('#product-form').on('submit', function (event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(this).entries());
    window.FitHubUtils.apiRequest('/products', {
      method: 'POST',
      data: payload
    }).done(() => {
      $('#productModal').modal('hide');
      this.reset();
      if ($('#products-table').length) {
        refreshProducts();
      }
    });
  });

  if ($('#category-list').length) {
    const renderCategories = () => {
      window.FitHubUtils.apiRequest('/categories').done((response) => {
        const categories = response.data || [];
        $('#category-list').html(categories.map((category) => `
          <span class="badge rounded-pill bg-light text-dark px-3 py-2">${category.name}</span>
        `).join(''));
      });
    };

    $('#category-form').on('submit', function (event) {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(this).entries());
      window.FitHubUtils.apiRequest('/categories', {
        method: 'POST',
        data: payload
      }).done(() => {
        this.reset();
        renderCategories();
      });
    });

    renderCategories();
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
