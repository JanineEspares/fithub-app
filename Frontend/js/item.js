/**
 * FitHub Product Details Page
 * Handles product details, images, reviews, and add-to-cart functionality
 */

const FitHubItem = (() => {
    // State
    let currentProduct = null;
    let productReviews = [];
    let relatedProducts = [];

    // DOM Elements
    const elements = {
        mainImage: $('#main-product-image'),
        thumbnails: $('#product-thumbnails'),
        itemId: $('#item-id'),
        itemName: $('#item-name'),
        itemPrice: $('#item-price'),
        itemDescription: $('#item-description'),
        itemQty: $('#item-qty'),
        addToCartBtn: $('#add-to-cart-btn'),
        addToWishlistBtn: $('#add-to-wishlist-btn'),
        statusBadge: $('#item-status-badge'),
        brandName: $('#brand-name'),
        avgRating: $('#avg-rating'),
        reviewCount: $('#review-count'),
        reviewsList: $('#reviews-list'),
        relatedProducts: $('#related-products'),
        stockInfo: $('#stock-info'),
        categoryName: $('#product-category-name'),
        availabilityText: $('#availability-text'),
        categoryBreadcrumb: $('#breadcrumb-category'),
        productBreadcrumb: $('#breadcrumb-product'),
        categoryBadge: $('#item-category'),
        overallRating: $('#overall-rating'),
        totalReviews: $('#total-reviews')
    };

    /**
     * Initialize product details page
     */
    function init() {
        const productId = getProductIdFromURL();
        
        if (!productId) {
            showError('Invalid product ID');
            return;
        }

        loadProductDetails(productId);
        attachEventListeners();
    }

    /**
     * Get product ID from URL query parameter
     */
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        elements.addToCartBtn.on('click', handleAddToCart);
        elements.addToWishlistBtn.on('click', handleAddToWishlist);
        
        // Thumbnail selection
        $(document).on('click', '.product-thumbnail', function() {
            const imageUrl = $(this).data('image-url');
            elements.mainImage.attr('src', imageUrl);
            $('.product-thumbnail').removeClass('active');
            $(this).addClass('active');
        });
    }

    /**
     * Load product details
     */
    function loadProductDetails(productId) {
        window.FitHubUtils.apiRequest(`/products/${productId}`, { method: 'GET' })
            .done((response) => {
                if (response.success && response.data) {
                    currentProduct = response.data;
                    renderProductDetails(currentProduct);
                    loadRelatedProducts(currentProduct.category_id, productId);
                } else {
                    showError('Product not found');
                }
            })
            .fail((err) => {
                console.error('Failed to load product:', err);
                showError('Failed to load product details');
            });
    }

    /**
     * Render product details
     */
    function renderProductDetails(product) {
        // Basic Info
        elements.itemId.text(product.id);
        elements.itemName.text(product.name);
        elements.itemPrice.text(`$${parseFloat(product.base_price).toFixed(2)}`);
        elements.itemDescription.text(product.description || 'No description available');
        elements.brandName.text(product.brand || 'Unknown');
        elements.categoryBadge.text(product.category?.name || 'General');
        elements.categoryName.text(product.category?.name || 'General');
        elements.categoryBreadcrumb.text(product.category?.name || 'Products');
        elements.productBreadcrumb.text(product.name);

        // Stock Status
        const inStock = product.in_stock || (product.inventory && product.inventory.quantity > 0);
        if (inStock) {
            elements.statusBadge.removeClass('bg-danger').addClass('bg-success').html('<i class="fas fa-check"></i> In Stock');
            elements.stockInfo.html('<span class="badge bg-success"><i class="fas fa-check"></i> In Stock</span>');
            elements.availabilityText.text('In Stock');
            elements.addToCartBtn.prop('disabled', false);
        } else {
            elements.statusBadge.removeClass('bg-success').addClass('bg-danger').html('<i class="fas fa-times"></i> Out of Stock');
            elements.stockInfo.html('<span class="badge bg-danger"><i class="fas fa-times"></i> Out of Stock</span>');
            elements.availabilityText.text('Out of Stock');
            elements.addToCartBtn.prop('disabled', true).html('<i class="fas fa-times"></i> Out of Stock');
            elements.itemQty.prop('disabled', true);
        }

        // Ratings
        const avgRating = parseFloat(product.average_rating) || 0;
        const reviewCount = product.review_count || 0;
        elements.avgRating.text(avgRating.toFixed(1));
        elements.reviewCount.text(reviewCount);
        elements.overallRating.text(avgRating.toFixed(1));
        elements.totalReviews.text(`Based on ${reviewCount} reviews`);

        // Render rating stars
        renderRatingStars(avgRating);

        // Images
        renderProductImages(product.images || []);

        // Reviews
        renderReviews(product.reviews || []);
    }

    /**
     * Render rating stars
     */
    function renderRatingStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                starsHtml += '<i class="fas fa-star text-warning"></i>';
            } else if (i - 0.5 <= rating) {
                starsHtml += '<i class="fas fa-star-half text-warning"></i>';
            } else {
                starsHtml += '<i class="fas fa-star text-muted"></i>';
            }
        }
        $('#product-rating').html(`<span class="text-warning">${starsHtml}</span>`);
    }

    /**
     * Render product images
     */
    function renderProductImages(images) {
        if (!images || images.length === 0) {
            elements.mainImage.attr('src', '/assets/images/placeholder.png');
            elements.thumbnails.html('<div class="col-12 text-muted text-center">No images available</div>');
            return;
        }

        // Set main image
        const primaryImage = images.find(img => img.is_primary) || images[0];
        const imageUrl = `${FitHubConfig.API_URL}/uploads/${primaryImage.image_path}`;
        elements.mainImage.attr('src', imageUrl).on('error', function() {
            $(this).attr('src', '/assets/images/placeholder.png');
        });

        // Render thumbnails
        let thumbHtml = '';
        images.forEach((img, index) => {
            const thumbUrl = `${FitHubConfig.API_URL}/uploads/${img.image_path}`;
            const isActive = img.is_primary ? 'active' : '';
            thumbHtml += `
                <div class="col-3 col-sm-2">
                    <img src="${thumbUrl}" alt="Product thumbnail" 
                         class="product-thumbnail rounded-2 cursor-pointer border ${isActive}"
                         data-image-url="${thumbUrl}"
                         style="cursor: pointer; object-fit: cover; width: 100%; height: 80px;"
                         onerror="this.src='/assets/images/placeholder.png'">
                </div>
            `;
        });
        elements.thumbnails.html(thumbHtml);
    }

    /**
     * Render reviews
     */
    function renderReviews(reviews) {
        productReviews = reviews || [];

        if (productReviews.length === 0) {
            elements.reviewsList.html(`
                <div class="text-center py-5">
                    <p class="text-muted">No reviews yet. Be the first to review this product!</p>
                </div>
            `);
            return;
        }

        let reviewsHtml = '';
        productReviews.forEach(review => {
            const starsHtml = renderStars(review.rating);
            const reviewDate = new Date(review.created_at).toLocaleDateString();
            
            reviewsHtml += `
                <div class="card card-surface p-3 mb-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="fw-bold mb-1">${escapeHtml(review.title || 'Untitled Review')}</h6>
                            <small class="text-muted">${escapeHtml(review.user?.first_name || 'Anonymous')} • ${reviewDate}</small>
                        </div>
                        <div class="text-warning">
                            ${starsHtml}
                        </div>
                    </div>
                    <p class="mb-0">${escapeHtml(review.comment || review.description || '')}</p>
                </div>
            `;
        });

        elements.reviewsList.html(reviewsHtml);
    }

    /**
     * Render rating stars HTML
     */
    function renderStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="fas fa-star text-muted"></i>';
            }
        }
        return starsHtml;
    }

    /**
     * Load related products from same category
     */
    function loadRelatedProducts(categoryId, currentProductId) {
        if (!categoryId) return;

        window.FitHubUtils.apiRequest(`/products/category/${categoryId}?limit=4`, { method: 'GET' })
            .done((response) => {
                if (response.success && response.data) {
                    const products = response.data.products || [];
                    relatedProducts = products
                        .filter(p => p.id !== currentProductId)
                        .slice(0, 4);
                    renderRelatedProducts(relatedProducts);
                }
            })
            .fail((err) => {
                console.error('Failed to load related products:', err);
            });
    }

    /**
     * Render related products
     */
    function renderRelatedProducts(products) {
        if (products.length === 0) {
            elements.relatedProducts.html('<p class="text-muted">No related products found</p>');
            return;
        }

        let html = '';
        products.forEach(product => {
            const imageUrl = product.images && product.images.length > 0
                ? `${FitHubConfig.API_URL}/uploads/${product.images[0].image_path}`
                : '/assets/images/placeholder.png';

            const inStock = product.inventory && product.inventory.quantity > 0;
            const stockBadge = inStock ? 'bg-success' : 'bg-danger';

            html += `
                <div class="col-12 col-sm-6 col-lg-3">
                    <div class="card card-surface h-100 cursor-pointer" 
                         style="cursor: pointer;" 
                         onclick="window.location.href='item.html?id=${product.id}'">
                        <div class="position-relative">
                            <img src="${imageUrl}" alt="${product.name}" 
                                 class="card-img-top" style="height: 200px; object-fit: cover;"
                                 onerror="this.src='/assets/images/placeholder.png'">
                            <span class="badge ${stockBadge} position-absolute top-2 end-2">
                                ${inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                        <div class="card-body">
                            <h6 class="card-title fw-bold limit-lines-2">${escapeHtml(product.name)}</h6>
                            <p class="text-brand fw-bold mb-0">$${parseFloat(product.base_price).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        elements.relatedProducts.html(html);
    }

    /**
     * Handle add to cart
     */
    function handleAddToCart() {
        if (!currentProduct) return;

        const user = window.FitHubUtils.getUser();
        if (!user) {
            if (confirm('Please login to add items to cart. Redirecting to login page...')) {
                window.location.href = 'login.html';
            }
            return;
        }

        const quantity = parseInt(elements.itemQty.val(), 10) || 1;
        if (quantity < 1) {
            Swal.fire('Invalid Quantity', 'Please select a valid quantity.', 'warning');
            return;
        }

        window.FitHubUtils.apiRequest('/carts/items', {
            method: 'POST',
            data: {
                product_id: currentProduct.id,
                quantity
            }
        })
            .done(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Added to Cart!',
                    text: `${quantity} x ${currentProduct.name} added to your cart.`,
                    confirmButtonText: 'Continue Shopping',
                    showCancelButton: true,
                    cancelButtonText: 'Go to Cart'
                }).then((result) => {
                    if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                        window.location.href = 'cart.html';
                    }
                });
            })
            .fail((xhr) => {
                const message = xhr.responseJSON?.message || 'Unable to add the item to cart right now.';
                Swal.fire('Error', message, 'error');
            });
    }

    /**
     * Handle add to wishlist
     */
    function handleAddToWishlist() {
        const user = window.FitHubUtils.getUser();
        
        if (!user) {
            Swal.fire('Login Required', 'Please login to add items to wishlist.', 'info');
            return;
        }

        // This will be implemented later
        Swal.fire('Added to Wishlist!', 'Product added to your wishlist.', 'success');
    }

    /**
     * Show error message
     */
    function showError(message) {
        elements.reviewsList.html(`
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `);
    }

    /**
     * Escape HTML special characters
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Public API
    return {
        init
    };
})();

// Initialize on document ready
$(document).ready(() => {
    FitHubItem.init();
});
