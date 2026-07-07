$(function () {
  if (document.body.dataset.page !== 'products' && document.body.dataset.page !== 'shop') return;

  if (document.body.dataset.page === 'products' && !window.FitHubUtils.requireAdminAccess('home.html')) {
    return;
  }

  const productModalElement = document.getElementById('productModal');
  const productModal = productModalElement && window.bootstrap ? new bootstrap.Modal(productModalElement) : null;
  const $productForm = $('#product-form');
  const $productAlert = $('#product-form-alert');
  const $productTitle = $('#productModalLabel');
  const $productSubmit = $('#product-form-submit');
  const $productImagesWrapper = $('#product-images-wrapper');
  const $productImages = $('#product-images');
  const $productId = $('#product-id');
  const $productCategoryId = $('#product-category-id');
  const $productName = $('#product-name');
  const $productDescription = $('#product-description');
  const $productBasePrice = $('#product-base-price');
  let productTable = null;

  const showAlert = (message, type = 'danger') => {
    $productAlert
      .removeClass('d-none alert-danger alert-success alert-warning')
      .addClass(`alert-${type}`)
      .text(message);
  };

  const clearAlert = () => {
    $productAlert.addClass('d-none').removeClass('alert-danger alert-success alert-warning').text('');
  };

  const resetForm = () => {
    $productForm[0].reset();
    $productId.val('');
    clearAlert();
  };

  const openCreateModal = () => {
    resetForm();
    $productTitle.text('Add Product');
    $productSubmit.text('Save Product');
    $productForm.data('mode', 'create');
    $productImagesWrapper.show();
    if (productModal) productModal.show();
  };

  const openEditModal = (product) => {
    resetForm();
    $productTitle.text('Edit Product');
    $productSubmit.text('Update Product');
    $productForm.data('mode', 'edit');
    $productId.val(product.id);
    $productCategoryId.val(product.category_id || '');
    $productName.val(product.name || '');
    $productDescription.val(product.description || '');
    $productBasePrice.val(product.base_price || '');
    $productImagesWrapper.hide();
    if (productModal) productModal.show();
  };

  const reloadProducts = () => {
    if (productTable) {
      productTable.ajax.reload(null, false);
    }
  };

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
    productTable = window.FitHubUtils.initDataTable('#products-table', {
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
        {
          data: null,
          orderable: false,
          searchable: false,
          render: (data, type, row) => `
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-sm btn-outline-brand js-view-product" data-id="${row.id}">View</button>
              <button type="button" class="btn btn-sm btn-brand js-edit-product" data-id="${row.id}">Edit</button>
              <button type="button" class="btn btn-sm btn-outline-danger js-delete-product" data-id="${row.id}">Delete</button>
            </div>
          `
        }
      ]
    });

    $('#add-product-btn').on('click', openCreateModal);

    $(document).on('click', '.js-view-product', function () {
      const productId = $(this).data('id');
      window.location.href = `item.html?id=${productId}`;
    });

    $(document).on('click', '.js-edit-product', function () {
      const productId = $(this).data('id');
      clearAlert();

      window.FitHubUtils.apiRequest(`/products/${productId}`)
        .done((response) => {
          const product = response.data || {};
          openEditModal(product);
        })
        .fail((xhr) => {
          showAlert(xhr.responseJSON?.message || 'Unable to load product details.');
        });
    });

    $(document).on('click', '.js-delete-product', function () {
      const productId = $(this).data('id');
      if (!window.confirm('Delete this product?')) {
        return;
      }

      window.FitHubUtils.apiRequest(`/products/${productId}`, { method: 'DELETE' })
        .done(() => {
          reloadProducts();
        })
        .fail((xhr) => {
          alert(xhr.responseJSON?.message || 'Unable to delete product.');
        });
    });

    $productForm.on('submit', function (event) {
      event.preventDefault();
      clearAlert();

      const mode = $productForm.data('mode');
      const productId = $productId.val();

      if (mode === 'create') {
        const formData = new FormData(this);

        $.ajax({
          url: `${window.FitHubConfig.apiBaseUrl}/products`,
          method: 'POST',
          headers: window.FitHubUtils.authHeaders(),
          data: formData,
          processData: false,
          contentType: false
        })
          .done(() => {
            if (productModal) productModal.hide();
            reloadProducts();
          })
          .fail((xhr) => {
            showAlert(xhr.responseJSON?.message || 'Unable to create product.');
          });

        return;
      }

      window.FitHubUtils.apiRequest(`/products/${productId}`, {
        method: 'PUT',
        data: {
          category_id: $productCategoryId.val(),
          name: $productName.val(),
          description: $productDescription.val(),
          base_price: $productBasePrice.val()
        }
      })
        .done(() => {
          if (productModal) productModal.hide();
          reloadProducts();
        })
        .fail((xhr) => {
          showAlert(xhr.responseJSON?.message || 'Unable to update product.');
        });
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
