# FitHub Fitness E-Commerce Skeleton

## Purpose
This repository is a production-ready skeleton for a Fitness E-Commerce web application using Node.js, Express, Sequelize, MySQL, REST APIs, JWT auth, jQuery, AJAX, DataTables, Bootstrap 5, Chart.js, Nodemailer, PDFKit, and Multer.

## Backend Structure

### `backend/server.js`
- Purpose: Application bootstrap and route registration.
- Responsibility: Load environment variables, connect to MySQL through Sequelize, start Express, mount API routes, and install the global error handler.
- Best practices: Keep boot logic thin, isolate routes, and start the server only after DB authentication succeeds.
- Communication: Calls `config/database.js`, imports all route modules, and delegates to controllers through routes.

### `backend/index.js`
- Purpose: Compatibility entrypoint.
- Responsibility: Delegates to `server.js`.
- Best practices: Keep legacy start scripts working while the project moves to a single server entry.

### `backend/config/database.js`
- Purpose: Sequelize connection factory.
- Responsibility: Create the MySQL connection instance.
- Best practices: Keep logging disabled in production and use environment variables for credentials.

### `backend/config/jwt.js`
- Purpose: JWT settings.
- Responsibility: Centralize secret and expiry config.
- Best practices: Read from environment variables and avoid hardcoding secrets.

### `backend/config/mail.js`
- Purpose: Nodemailer config.
- Responsibility: Hold SMTP details and default sender identity.
- Best practices: Store credentials in `.env` and keep email transport creation in a service.

### `backend/models/`
- Purpose: Sequelize model layer.
- Responsibility: Define tables, constraints, and associations.
- Best practices: Use models for all persistence. No raw SQL queries.
- Communication: Controllers call services, services call models, and `models/index.js` wires associations.

#### Files
- `User.js`: user accounts, JWT token storage, status, and role fields.
- `Role.js`: role catalog for role-based authorization.
- `Category.js`: product grouping.
- `Product.js`: product master record.
- `ProductImage.js`: multiple images per product.
- `ProductVariant.js`: variant-level catalog data.
- `Inventory.js`: stock status and reorder tracking.
- `Cart.js`: active cart header per user.
- `CartItem.js`: cart line items.
- `Order.js`: checkout/order header.
- `OrderItem.js`: order line items.
- `Transaction.js`: transaction records for the lab exam module.
- `Payment.js`: payment records linked to orders.
- `ShippingAddress.js`: address records for order delivery.
- `Review.js`: product reviews.
- `ActivityLog.js`: audit trail entries.
- `index.js`: association registry.

### `backend/controllers/`
- Purpose: HTTP request handlers.
- Responsibility: Validate request context, call services/models, and return JSON responses.
- Best practices: Keep business logic out of routes. Return consistent `success/message/data` payloads.

#### Files
- `authController.js`: register and login APIs.
- `userController.js`: profile, user listing, role updates, and deactivation.
- `productController.js`: product CRUD, image upload handling.
- `categoryController.js`: category CRUD.
- `cartController.js`: cart and item operations.
- `transactionController.js`: transaction CRUD and receipt/email flow.
- `reportController.js`: report summaries.
- `dashboardController.js`: dashboard metrics and chart data.

### `backend/routes/`
- Purpose: Route definitions.
- Responsibility: Map HTTP verbs and endpoints to controllers and middleware.
- Best practices: Apply auth and role middleware at the route layer.

#### Files
- `authRoutes.js`: register, login, and auth-only sample route.
- `userRoutes.js`: profile, list users, role update, deactivate user.
- `productRoutes.js`: product CRUD with admin protection and Multer uploads.
- `categoryRoutes.js`: category CRUD.
- `cartRoutes.js`: cart endpoints for customer shopping flow.
- `transactionRoutes.js`: transaction CRUD.
- `reportRoutes.js`: admin report endpoints.
- `dashboardRoutes.js`: dashboard metrics and chart endpoints.

### `backend/middleware/`
- Purpose: Cross-cutting request controls.
- Responsibility: Authentication, role checks, file uploads, validation, error handling.
- Best practices: Keep each middleware focused and reusable.

#### Files
- `authMiddleware.js`: verify JWT, check stored token, enforce active status.
- `roleMiddleware.js`: generic role guard.
- `adminMiddleware.js`: admin-only shortcut guard.
- `uploadMiddleware.js`: Multer storage and multi-image validation.
- `validationMiddleware.js`: express-validator result wrapper.
- `errorHandler.js`: global error response formatter.

### `backend/services/`
- Purpose: Business services.
- Responsibility: Encapsulate reusable logic for auth, email, PDF, token, and data operations.
- Best practices: Services should own logic that is not purely HTTP-specific.

#### Files
- `authService.js`: registration and login checks.
- `productService.js`: product data operations and image attachment.
- `categoryService.js`: category data operations.
- `emailService.js`: transactional email sending.
- `pdfService.js`: PDF receipt generation.
- `tokenService.js`: JWT token generation helper.

### `backend/validators/`
- Purpose: Input validation rules.
- Responsibility: Protect endpoints from invalid payloads.
- Best practices: Validate before business logic.

### `backend/uploads/`
- Purpose: Uploaded media and generated receipts.
- Responsibility: Store product images and generated PDFs.
- Best practices: Keep files outside source control and serve them through controlled static routes.

## Frontend Structure

### Shared files
- `frontend/home.html`: landing page and shop entry.
- `frontend/shop.html`: product browsing page.
- `frontend/item.html`: product detail page.
- `frontend/cart.html`: cart summary.
- `frontend/checkout.html`: checkout flow.
- `frontend/orders.html`: customer order history.
- `frontend/profile.html`: profile and account view.
- `frontend/login.html`: login form page.
- `frontend/register.html`: registration form page.
- `frontend/dashboard.html`: admin dashboard.
- `frontend/users.html`: admin user management.
- `frontend/products.html`: admin product CRUD.
- `frontend/inventory.html`: stock management.
- `frontend/transactions.html`: transaction CRUD and status updates.
- `frontend/reports.html`: admin reporting page.
- `frontend/deactivate.html`: user deactivation support page.

### `frontend/partials/`
- `header.html`: navbar and shared top navigation.
- `sidebar.html`: admin sidebar navigation.
- `footer.html`: shared footer.
- Best practices: Keep shared layout fragments separate to avoid repetition.

### `frontend/css/`
- `style.css`: core theme, typography, cards, buttons, tables.
- `dashboard.css`: metrics and chart layout.
- `auth.css`: login/register/profile layouts.
- `shop.css`: product grid and catalog styling.
- Best practices: Use consistent design tokens and avoid one-off visual rules.

### `frontend/js/`
- `config.js`: API base URL and storage keys.
- `utils.js`: AJAX wrapper, auth helpers, partial loading, DataTables helper.
- `auth.js`: login/register form wiring.
- `home.js`: landing page bootstrap.
- `products.js`: product DataTable AJAX binding.
- `item.js`: item detail behavior hook.
- `cart.js`: cart behavior hook.
- `checkout.js`: checkout behavior hook.
- `dashboard.js`: admin metric loading.
- `users.js`: user list DataTable.
- `inventory.js`: inventory behavior hook.
- `transactions.js`: transaction behavior hook.
- `reports.js`: report behavior hook.
- `charts.js`: Chart.js helper.
- `validation.js`: jQuery validation helpers.
- `autocomplete.js`: search autocomplete helper.
- `pagination.js`: custom pagination helper.
- `infiniteScroll.js`: infinite scroll helper.
- Best practices: Centralize AJAX and session logic so all pages use the same auth flow.

### `frontend/assets/`
- `images/`: hero and product images.
- `icons/`: UI icons.
- `uploads/`: local upload previews or cached assets.

## API Flow

### Authentication flow
1. User submits login or register form via jQuery AJAX.
2. `authRoutes.js` forwards to `authController.js`.
3. `authService.js` validates user credentials.
4. JWT is generated and stored in `users.jwt_token`.
5. Client stores token in `localStorage` for subsequent AJAX requests.

### JWT flow
1. Client sends `Authorization: Bearer <token>`.
2. `authMiddleware.js` verifies signature and loads the DB user.
3. Middleware checks token equality and account status.
4. `roleMiddleware.js` or `adminMiddleware.js` enforces role restrictions.

### CRUD architecture
1. Frontend page calls `window.FitHubUtils.apiRequest(...)`.
2. Route middleware validates auth/role.
3. Controller validates and delegates to the model or service.
4. Sequelize performs all persistence.
5. JSON response is returned to the frontend.

### File upload flow
1. Product form submits multipart data with multiple images.
2. `uploadMiddleware.js` receives and stores the files.
3. `productController.js` creates the product.
4. `productService.attachProductImages()` stores file metadata in `product_images`.

### Email flow
1. Transaction status changes through admin API.
2. `transactionController.js` updates the record.
3. `pdfService.js` generates a receipt PDF.
4. `emailService.js` sends the customer an email with the PDF attached.

### PDF generation flow
1. Transaction data is passed to `generateReceiptPdf()`.
2. PDFKit writes receipt content to `backend/uploads/receipts/`.
3. The generated path is attached to the email.

### Dashboard charts flow
1. Dashboard page requests `/api/dashboard/charts`.
2. Controller returns structured counts.
3. `charts.js` renders bar/line/pie charts with Chart.js.

### Pagination and infinite scroll flow
1. Frontend uses `pagination.js` or `infiniteScroll.js` for custom loading.
2. Data is requested in page-sized slices from REST endpoints.
3. UI appends rows/cards without using DataTable pagination.

### Search and autocomplete flow
1. Search box sends AJAX queries as the user types.
2. Endpoint returns filtered products.
3. `autocomplete.js` renders suggestions below the input.

## Course Requirement Mapping
- MP3: CRUD, jQuery, DataTables, Multer multiple image uploads.
- MP4: jQuery/DataTables frontend connected to REST API.
- MP5: JWT generation and token storage in `users` table.
- MP6: registration, login AJAX, JWT auth, role update, user deactivation, user DataTable.
- MP7: Sequelize-only CRUD path.
- Lab Exam: transaction CRUD, email updates, PDF receipt generation, PDF attachment.
- Quiz 4: jQuery validation helper layer.
- Quiz 5: homepage search, AJAX search, autocomplete.
- Quiz 6: route protection, middleware, role-based auth.
- Quiz 7: charts for bar, line, and pie output.
- Unit Test 2: custom pagination and infinite scroll without DataTables pagination.

## Best Practices
- Use Sequelize models for all persistence.
- Keep JWT secrets and SMTP credentials in `.env`.
- Use route-level middleware for authorization.
- Keep the frontend page structure stable so existing DOM hooks do not break.
- Store uploads outside source control.
- Return consistent JSON envelopes for easier jQuery handling.
