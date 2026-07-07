/**
 * FitHub Shop/Product Listing Page
 * Handles product display, search, filtering, sorting, and pagination
 */

const FitHubShop = (() => {
    // State
    let currentPage = 1;
    let currentFilters = {
        search: '',
        category_id: null,
        sort: 'name',
        order: 'asc',
        limit: 12,
        min_price: null,
        max_price: null
    };
    let totalProducts = 0;
    let totalPages = 0;
    let categories = [];
    let isLoading = false;

    // DOM Elements
    const elements = {
        grid: $('#shop-products-grid'),
        search: $('#shop-search'),
        categoryFilter: $('#filter-categories'),
        minPrice: $('#min-price'),
        maxPrice: $('#max-price'),
        sortSelect: $('#sort-select'),
        paginationNav: $('#pagination-nav'),
        paginationControls: $('#pagination-controls'),
        loadingSpinner: $('#loading-spinner'),
        noResults: $('#no-results'),
        totalProducts: $('#total-products'),
        layoutGrid: $('#layout-grid'),
        layoutList: $('#layout-list'),
        clearCategoryBtn: $('#clear-category-filter'),
        clearPriceBtn: $('#clear-price-filter'),
        applyPriceBtn: $('#apply-price-filter'),
        clearAllBtn: $('#clear-all-filters')
    };

    /**
     * Initialize shop page
     */
    function init() {
        loadCategories();
        loadProducts();
        attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Search
        elements.search.on('input', debounce(() => {
            currentPage = 1;
            currentFilters.search = elements.search.val().trim();
            loadProducts();
        }, 500));

        // Category filter
        $(document).on('click', '.category-filter-btn', function() {
            const categoryId = $(this).data('category-id');
            if (currentFilters.category_id === categoryId) {
                clearCategoryFilter();
            } else {
                currentPage = 1;
                currentFilters.category_id = categoryId;
                updateCategoryButtons();
                loadProducts();
            }
        });

        // Price filter
        elements.applyPriceBtn.on('click', () => {
            currentPage = 1;
            currentFilters.min_price = elements.minPrice.val() || null;
            currentFilters.max_price = elements.maxPrice.val() || null;
            loadProducts();
            updatePriceFilterUI();
        });

        elements.clearPriceBtn.on('click', clearPriceFilter);

        // Sort
        elements.sortSelect.on('change', function() {
            currentPage = 1;
            const sortValue = $(this).val();
            
            if (sortValue === 'price-desc') {
                currentFilters.sort = 'price';
                currentFilters.order = 'desc';
            } else {
                currentFilters.sort = sortValue;
                currentFilters.order = 'asc';
            }
            
            loadProducts();
        });

        // Clear all filters
        elements.clearAllBtn.on('click', clearAllFilters);

        // Layout toggle
        elements.layoutGrid.on('click', () => {
            elements.grid.removeClass('list-view').addClass('grid-view');
            elements.layoutGrid.addClass('active');
            elements.layoutList.removeClass('active');
            localStorage.setItem('shop-layout', 'grid');
        });

        elements.layoutList.on('click', () => {
            elements.grid.removeClass('grid-view').addClass('list-view');
            elements.layoutList.addClass('active');
            elements.layoutGrid.removeClass('active');
            localStorage.setItem('shop-layout', 'list');
        });

        // Pagination
        $(document).on('click', '.pagination-btn', function() {
            const page = $(this).data('page');
            currentPage = page;
            loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Add to cart from grid
        $(document).on('click', '.add-to-cart-btn', function(e) {
            e.preventDefault();
            const productId = $(this).data('product-id');
            handleAddToCart(productId);
        });

        // View product details
        $(document).on('click', '.view-details-btn', function() {
            const productId = $(this).data('product-id');
            window.location.href = `item.html?id=${productId}`;
        });
    }

    /**
     * Load categories for filter
     */
    function loadCategories() {
        window.FitHubUtils.apiRequest('/categories', { method: 'GET' })
            .done((response) => {
                if (response.success && response.data) {
                    categories = response.data;
                    renderCategories();
                }
            })
            .fail((err) => {
                console.error('Failed to load categories:', err);
                elements.categoryFilter.html('<p class="text-danger small">Failed to load categories</p>');
            });
    }

    /**
     * Render category filters
     */
    function renderCategories() {
        if (!categories || categories.length === 0) {
            elements.categoryFilter.html('<p class="text-muted small">No categories available</p>');
            return;
        }

        let html = '';
        categories.forEach(cat => {
            const isActive = currentFilters.category_id === cat.id;
            html += `
                <button class="list-group-item list-group-item-action category-filter-btn ${isActive ? 'active' : ''}"
                        data-category-id="${cat.id}">
                    <span>${cat.name}</span>
                    <small class="text-muted">(${Math.floor(Math.random() * 50) + 5})</small>
                </button>
            `;
        });

        elements.categoryFilter.html(html);
    }

    /**
     * Update category button active states
     */
    function updateCategoryButtons() {
        $('.category-filter-btn').removeClass('active');
        if (currentFilters.category_id) {
            $(`.category-filter-btn[data-category-id="${currentFilters.category_id}"]`).addClass('active');
            elements.clearCategoryBtn.removeClass('d-none');
        } else {
            elements.clearCategoryBtn.addClass('d-none');
        }
    }

    /**
     * Load products with current filters
     */
    function loadProducts() {
        if (isLoading) return;
        isLoading = true;

        elements.loadingSpinner.removeClass('d-none');
        elements.noResults.addClass('d-none');
        elements.grid.empty();

        const params = new URLSearchParams();
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.category_id) params.append('category_id', currentFilters.category_id);
        params.append('sort', currentFilters.sort);
        params.append('order', currentFilters.order);
        params.append('page', currentPage);
        params.append('limit', currentFilters.limit);
        if (currentFilters.min_price) params.append('min_price', currentFilters.min_price);
        if (currentFilters.max_price) params.append('max_price', currentFilters.max_price);

        window.FitHubUtils.apiRequest(`/products?${params.toString()}`, { method: 'GET' })
            .done((response) => {
                isLoading = false;
                elements.loadingSpinner.addClass('d-none');

                if (response.success && response.data && response.data.products) {
                    const { products, pagination } = response.data;
                    totalProducts = pagination.total;
                    totalPages = pagination.pages;

                    elements.totalProducts.text(totalProducts);

                    if (products.length === 0) {
                        elements.noResults.removeClass('d-none');
                    } else {
                        renderProducts(products);
                        renderPagination(pagination);
                    }
                } else {
                    elements.noResults.removeClass('d-none');
                }
            })
            .fail((err) => {
                isLoading = false;
                elements.loadingSpinner.addClass('d-none');
                console.error('Failed to load products:', err);
                elements.noResults.html('<p class="text-danger">Failed to load products. Please try again.</p>').removeClass('d-none');
            });
    }

    /**
     * Render product cards
     */
    function renderProducts(products) {
        let html = '';
        
        products.forEach(product => {
            const imageUrl = product.images && product.images.length > 0 
                ? `${window.FitHubConfig.apiBaseUrl}/uploads/${product.images[0].image_path}`
                : '/assets/images/placeholder.png';
            
            const inStock = product.inventory && product.inventory.quantity > 0;
            const stockClass = inStock ? 'badge-success' : 'badge-danger';
            const stockText = inStock ? 'In Stock' : 'Out of Stock';

            html += `
                <div class="col-12 col-sm-6 col-lg-4 product-card-wrapper">
                    <div class="card card-surface product-card h-100">
                        <div class="product-image-container position-relative">
                            <img src="${imageUrl}" alt="${product.name}" class="card-img-top" 
                                 onerror="this.src='/assets/images/placeholder.png'">
                            <span class="badge ${stockClass} position-absolute top-2 end-2">
                                ${stockText}
                            </span>
                            ${product.average_rating > 0 ? `
                                <div class="rating-badge position-absolute bottom-2 start-2">
                                    <i class="fas fa-star text-warning"></i>
                                    <span class="ms-1">${product.average_rating}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title fw-bold limit-lines-2">${product.name}</h6>
                            ${product.brand ? `<small class="text-muted mb-2">${product.brand}</small>` : ''}
                            <p class="card-text text-muted small limit-lines-2 flex-grow-1">${product.description || 'No description'}</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                <span class="h5 text-brand mb-0">$${parseFloat(product.base_price).toFixed(2)}</span>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button class="btn btn-outline-secondary view-details-btn" type="button" data-product-id="${product.id}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-brand add-to-cart-btn ${!inStock ? 'disabled' : ''}" 
                                            data-product-id="${product.id}"
                                            ${!inStock ? 'disabled' : ''}>
                                        <i class="fas fa-shopping-cart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        elements.grid.html(html);
    }

    /**
     * Render pagination controls
     */
    function renderPagination(pagination) {
        const { page, pages } = pagination;
        
        if (pages <= 1) {
            elements.paginationNav.addClass('d-none');
            return;
        }

        let html = '';

        // Previous button
        if (page > 1) {
            html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${page - 1}">Previous</button></li>`;
        } else {
            html += `<li class="page-item disabled"><span class="page-link">Previous</span></li>`;
        }

        // Page numbers
        const maxPages = 5;
        let startPage = Math.max(1, page - Math.floor(maxPages / 2));
        let endPage = Math.min(pages, startPage + maxPages - 1);
        
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        if (startPage > 1) {
            html += `<li class="page-item"><button class="page-link pagination-btn" data-page="1">1</button></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === page) {
                html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${i}">${i}</button></li>`;
            }
        }

        if (endPage < pages) {
            if (endPage < pages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${pages}">${pages}</button></li>`;
        }

        // Next button
        if (page < pages) {
            html += `<li class="page-item"><button class="page-link pagination-btn" data-page="${page + 1}">Next</button></li>`;
        } else {
            html += `<li class="page-item disabled"><span class="page-link">Next</span></li>`;
        }

        elements.paginationControls.html(html);
        elements.paginationNav.removeClass('d-none');
    }

    /**
     * Handle add to cart
     */
    function handleAddToCart(productId) {
        // Check if user is logged in
        const user = window.FitHubUtils.getUser();
        
        if (!user) {
            if (confirm('Please login to add items to cart. Redirecting to login page...')) {
                window.location.href = 'login.html';
            }
            return;
        }

        window.FitHubUtils.apiRequest('/carts/items', {
            method: 'POST',
            data: {
                product_id: productId,
                quantity: 1
            }
        })
            .done(() => {
                Swal.fire('Added to Cart!', 'Product added to your cart.', 'success');
            })
            .fail((xhr) => {
                const message = xhr.responseJSON?.message || 'Unable to add the item to cart right now.';
                Swal.fire('Error', message, 'error');
            });
    }

    /**
     * Clear category filter
     */
    function clearCategoryFilter() {
        currentPage = 1;
        currentFilters.category_id = null;
        updateCategoryButtons();
        loadProducts();
    }

    /**
     * Clear price filter
     */
    function clearPriceFilter() {
        currentFilters.min_price = null;
        currentFilters.max_price = null;
        updatePriceFilterUI();
        currentPage = 1;
        loadProducts();
    }

    /**
     * Update price filter UI
     */
    function updatePriceFilterUI() {
        if (currentFilters.min_price || currentFilters.max_price) {
            elements.clearPriceBtn.removeClass('d-none');
        } else {
            elements.clearPriceBtn.addClass('d-none');
            elements.minPrice.val('');
            elements.maxPrice.val('');
        }
    }

    /**
     * Clear all filters
     */
    function clearAllFilters() {
        currentPage = 1;
        currentFilters = {
            search: '',
            category_id: null,
            sort: 'name',
            order: 'asc',
            limit: 12,
            min_price: null,
            max_price: null
        };
        
        elements.search.val('');
        elements.minPrice.val('');
        elements.maxPrice.val('');
        elements.sortSelect.val('name');
        updateCategoryButtons();
        updatePriceFilterUI();
        loadProducts();
    }

    /**
     * Debounce function for search
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Public API
    return {
        init
    };
})();

// Initialize on document ready
$(document).ready(() => {
    FitHubShop.init();
});
