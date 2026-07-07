# 🛍️ FitHub Customer User Logic - Complete Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for the FitHub customer/user logic system, including authentication, shopping, cart management, checkout, and order tracking.

---

## 🎯 Implementation Phases

### Phase 1: Authentication & Customer Profile (STARTING)
- [x] Plan created
- [ ] Register functionality
- [ ] Login functionality  
- [ ] Profile management
- [ ] Password change
- [ ] Customer middleware

**Estimated Time:** 4-6 hours

---

### Phase 2: Product Management & Browsing
- [ ] Product listings
- [ ] Search functionality
- [ ] Filter & sort
- [ ] Product details page
- [ ] Stock validation
- [ ] Review display

**Estimated Time:** 3-4 hours

---

### Phase 3: Shopping Cart
- [ ] Cart model & APIs
- [ ] Add to cart
- [ ] Remove from cart
- [ ] Update quantity
- [ ] Cart persistence
- [ ] Coupon/discount handling

**Estimated Time:** 3-4 hours

---

### Phase 4: Checkout & Orders
- [ ] Checkout page
- [ ] Order creation
- [ ] Payment methods
- [ ] Inventory reduction
- [ ] Order confirmation
- [ ] Order tracking

**Estimated Time:** 4-5 hours

---

### Phase 5: Reviews & Advanced Features
- [ ] Review submission (purchased products only)
- [ ] Review display
- [ ] Order history
- [ ] Order status timeline
- [ ] Email notifications

**Estimated Time:** 2-3 hours

---

### Phase 6: Access Control & Security
- [ ] Customer middleware
- [ ] Data isolation (customer can only see their data)
- [ ] Authorization checks
- [ ] Role-based routing
- [ ] Security audit

**Estimated Time:** 2-3 hours

---

## 📁 Files to Create/Update

### Frontend Files

#### Phase 1: Authentication
- [ ] `register.html` - Update with enhanced validation
- [ ] `login.html` - Update with guest redirect
- [ ] `profile.html` - Create customer profile page
- [ ] `js/customer-auth.js` - Customer auth manager (similar to admin-login.js)
- [ ] `js/auth.js` - Update with customer functions

#### Phase 2: Products
- [ ] `shop.html` - Update product listing
- [ ] `item.html` - Update product details
- [ ] `js/shop.js` - Search, filter, sort logic
- [ ] `js/item.js` - Product details logic

#### Phase 3: Cart
- [ ] `cart.html` - Full cart page
- [ ] `js/cart.js` - Cart management logic

#### Phase 4: Checkout
- [ ] `checkout.html` - Update checkout page
- [ ] `js/checkout.js` - Checkout logic

#### Phase 5: Orders
- [ ] `orders.html` - Update order listing
- [ ] `js/orders.js` - Order history logic
- [ ] Create `order-details.html` - Order tracking

#### Other
- [ ] `home.html` - Update guest vs customer view
- [ ] `partials/customer-header.html` - Customer navigation
- [ ] `partials/footer.html` - Ensure exists

### Backend Files

#### Phase 1: Authentication
- [ ] `controllers/authController.js` - Enhance register, login
- [ ] `routes/authRoutes.js` - Enhance auth endpoints
- [ ] `models/User.js` - Verify customer fields
- [ ] `middleware/customerMiddleware.js` - Create customer auth middleware

#### Phase 2: Products
- [ ] `controllers/productController.js` - Product listing APIs
- [ ] `routes/productRoutes.js` - Product endpoints
- [ ] `models/Product.js` - Verify fields
- [ ] `models/Review.js` - Ensure review model

#### Phase 3: Cart
- [ ] `controllers/cartController.js` - Cart management
- [ ] `routes/cartRoutes.js` - Cart endpoints
- [ ] `models/Cart.js` - Verify model
- [ ] `models/CartItem.js` - Verify model

#### Phase 4: Orders
- [ ] `controllers/orderController.js` - Order management
- [ ] `routes/orderRoutes.js` - Order endpoints
- [ ] `models/Order.js` - Verify model
- [ ] `models/OrderItem.js` - Verify model
- [ ] `services/orderService.js` - Create order logic

#### Phase 5: Reviews
- [ ] `controllers/reviewController.js` - Create or update
- [ ] `routes/reviewRoutes.js` - Review endpoints
- [ ] `models/Review.js` - Verify model

#### Phase 6: Security
- [ ] `middleware/customerMiddleware.js` - Data isolation checks
- [ ] Review all controllers for authorization

---

## 🔐 Access Control Matrix

| Feature | Guest | Customer | Admin |
|---------|-------|----------|-------|
| View home | ✅ | ✅ | ✅ |
| Browse products | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ |
| Search products | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ |
| Login | ✅ | ❌ | ❌ |
| Add to cart | ❌ | ✅ | ❌ |
| View own cart | ❌ | ✅ | ❌ |
| Checkout | ❌ | ✅ | ❌ |
| Place order | ❌ | ✅ | ❌ |
| View own orders | ❌ | ✅ | ❌ |
| Leave reviews | ❌ | ✅ (purchased only) | ❌ |
| Edit own profile | ❌ | ✅ | ❌ |
| Logout | ❌ | ✅ | ✅ |

---

## 📊 Database Schema Summary

### Existing Models (Verify)
- ✅ `User` - Customer accounts
- ✅ `Product` - Products
- ✅ `Category` - Product categories
- ✅ `Cart` - Shopping carts
- ✅ `CartItem` - Items in cart
- ✅ `Order` - Customer orders
- ✅ `OrderItem` - Items in order
- ✅ `Review` - Product reviews
- ✅ `Inventory` - Stock levels

### Key Fields to Verify

**Users Table:**
```
id, first_name, last_name, email, password, jwt_token, 
role (admin|customer), status (active|inactive), created_at, updated_at
```

**Cart/CartItem:**
```
Cart: id, user_id (FK), created_at
CartItem: id, cart_id (FK), product_id (FK), quantity
```

**Orders/OrderItems:**
```
Order: id, user_id (FK), status, total, payment_method, 
shipping_address, created_at
OrderItem: id, order_id (FK), product_id (FK), quantity, price
```

**Reviews:**
```
Review: id, user_id (FK), product_id (FK), rating, 
comment, created_at
```

---

## 🔄 User Flow Diagrams

### Registration & Login
```
Guest
  ↓
Register
  ├─ Fill form
  ├─ Validate input
  ├─ Check email exists
  ├─ Hash password
  ├─ Create customer account
  └─ Redirect to login
  
  ↓
Login
  ├─ Enter email/password
  ├─ Validate credentials
  ├─ Generate JWT
  ├─ Redirect to home
  └─ → Authenticated Customer
```

### Shopping Flow
```
Browse Products
  ↓
View Product Details
  ├─ Show images
  ├─ Show reviews
  └─ Show price & stock
  
  ├─ If guest: "Login to add to cart"
  ├─ If customer:
  │    ├─ Add to cart
  │    └─ Buy now
  
  ↓
View Cart
  ├─ List items
  ├─ Update quantities
  └─ Checkout
  
  ↓
Checkout
  ├─ Confirm items
  ├─ Enter address
  ├─ Select payment method
  └─ Place order
  
  ↓
Order Confirmation
  ├─ Display order number
  ├─ Show total
  └─ Set status = Pending
```

### Order Management
```
Customer views Orders
  ├─ Only see own orders
  ├─ Filter by status
  ├─ Track order
  └─ Leave review (if delivered)
```

---

## 🛡️ Security Requirements

### Authentication
- [x] JWT tokens for customers (similar to admin)
- [x] Bcrypt password hashing
- [x] Token validation on protected routes
- [ ] Role-based access (customer vs admin)
- [ ] Data isolation (customer only sees own data)

### Authorization
- [ ] Middleware to check customer role
- [ ] Middleware to verify data ownership
- [ ] Cart belongs to logged-in customer only
- [ ] Orders belong to logged-in customer only
- [ ] Reviews can only be created for purchased products

### Input Validation
- [ ] Email format validation
- [ ] Password strength requirements
- [ ] Phone number validation
- [ ] Address validation
- [ ] Quantity limits

### Data Protection
- [ ] CORS enabled
- [ ] Sensitive data not logged
- [ ] Passwords never in response
- [ ] Error messages don't leak info

---

## 📋 API Endpoints to Create/Update

### Authentication (Existing - Enhance)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/profile
POST   /api/auth/refresh-token
```

### Products (Create/Update)
```
GET    /api/products                    # List all
GET    /api/products/:id                # Details
GET    /api/products/search?q=...       # Search
GET    /api/products/category/:id       # By category
GET    /api/products?sort=...           # Sort
GET    /api/products?filter=...         # Filter
```

### Cart (Create/Update)
```
GET    /api/cart                        # Get customer's cart
POST   /api/cart                        # Create cart
POST   /api/cart/items                  # Add item
PUT    /api/cart/items/:id              # Update quantity
DELETE /api/cart/items/:id              # Remove item
DELETE /api/cart                        # Clear cart
```

### Orders (Create/Update)
```
POST   /api/orders                      # Create order
GET    /api/orders                      # List customer's orders
GET    /api/orders/:id                  # Order details
GET    /api/orders/:id/status           # Track status
PUT    /api/orders/:id/cancel           # Cancel order
```

### Reviews (Create)
```
POST   /api/reviews                     # Create review
GET    /api/products/:id/reviews        # Get product reviews
GET    /api/reviews/my-reviews          # Customer's reviews
```

### User Profile (Create)
```
GET    /api/profile                     # Get customer profile
PUT    /api/profile                     # Update profile
POST   /api/profile/password            # Change password
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Register validation
- [ ] Login authentication
- [ ] Password hashing
- [ ] Cart operations
- [ ] Order creation

### Integration Tests
- [ ] Register → Login → Profile
- [ ] Browse → Add to cart → Checkout
- [ ] Order creation → Inventory reduction
- [ ] Review creation (verified purchase)

### E2E Tests
- [ ] Complete registration flow
- [ ] Complete shopping flow
- [ ] Complete order flow
- [ ] Access control verification

---

## 📈 Performance Considerations

### Database
- [ ] Index on `user_id` for cart/orders
- [ ] Index on `product_id`
- [ ] Index on email (unique)
- [ ] Pagination for product listing
- [ ] Pagination for order history

### Caching
- [ ] Cache product listings
- [ ] Cache categories
- [ ] Cache user profile (short TTL)

### Query Optimization
- [ ] Selective columns (don't fetch password)
- [ ] Join optimization
- [ ] Avoid N+1 queries

---

## 📝 Documentation to Create

- [ ] Customer API documentation
- [ ] Shopping workflow documentation
- [ ] Security implementation guide
- [ ] Database schema documentation
- [ ] Deployment guide

---

## ⏱️ Timeline Estimate

| Phase | Hours | Days |
|-------|-------|------|
| Phase 1: Auth | 4-6 | 1 |
| Phase 2: Products | 3-4 | 1 |
| Phase 3: Cart | 3-4 | 1 |
| Phase 4: Checkout/Orders | 4-5 | 1 |
| Phase 5: Reviews | 2-3 | 1 |
| Phase 6: Security | 2-3 | 1 |
| **Total** | **18-25** | **~6** |

---

## ✅ Success Criteria

- ✅ Guest can browse products
- ✅ Guest must login to add to cart
- ✅ Customer can register
- ✅ Customer can login
- ✅ Customer can add products to cart
- ✅ Customer can checkout
- ✅ Each customer only sees own cart
- ✅ Each customer only sees own orders
- ✅ Only verified purchasers can review
- ✅ All data properly isolated by customer ID

---

**Status:** Planning Complete - Ready to Begin Phase 1

**Next:** Start Phase 1: Authentication Enhancement
