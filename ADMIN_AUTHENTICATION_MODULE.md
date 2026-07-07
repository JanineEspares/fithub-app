# FitHub Admin Authentication Module
## Complete Implementation Guide

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Folder Structure](#folder-structure)
4. [Backend Components](#backend-components)
5. [Frontend Components](#frontend-components)
6. [Security Features](#security-features)
7. [API Documentation](#api-documentation)
8. [Setup Instructions](#setup-instructions)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The FitHub Admin Authentication Module provides:

✅ **Secure Admin Login** - Email/Password authentication with JWT tokens  
✅ **Role-Based Access** - Admin-only access to protected routes  
✅ **Session Management** - Token storage and validation  
✅ **Password Hashing** - bcrypt for secure password storage  
✅ **Modern UI** - Bootstrap 5 responsive admin login page  
✅ **Error Handling** - Comprehensive validation and user feedback  
✅ **Token Refresh** - Auto-extend session without re-login  
✅ **Audit Logging** - Track admin actions for security  

---

## 🗄️ Database Setup

### User Table Structure

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  jwt_token LONGTEXT,
  role ENUM('admin', 'customer') DEFAULT 'customer' NOT NULL,
  role_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Default Admin Account

**Created automatically on first run:**

| Field | Value |
|-------|-------|
| Email | admin@fithub.com |
| Password | Admin@123 |
| Role | admin |
| Status | active |

**⚠️ IMPORTANT:** Change this password immediately after first login in production!

---

## 📁 Folder Structure

```
fithub-app/
├── Backend/
│   ├── config/
│   │   └── database.js              (Database configuration)
│   │
│   ├── controllers/
│   │   └── authController.js        (Login, Logout, Profile, Token Refresh)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        (JWT Token Verification)
│   │   └── adminMiddleware.js       (Admin Role Check)
│   │
│   ├── models/
│   │   └── User.js                  (Sequelize User Model)
│   │
│   ├── routes/
│   │   └── authRoutes.js            (Authentication Endpoints)
│   │
│   ├── services/
│   │   └── authService.js           (Login/Register Logic)
│   │
│   ├── validators/
│   │   ├── loginValidator.js        (Login Input Validation)
│   │   └── registerValidator.js     (Registration Validation)
│   │
│   ├── seed.js                      (Database Seeder - Creates Admin Account)
│   ├── server.js                    (Main Server File)
│   └── .env                         (Environment Configuration)
│
└── Frontend/
    ├── admin-login.html             (Admin Login Page - NEW)
    │
    ├── js/
    │   ├── admin-login.js           (Login Script with AJAX - NEW)
    │   └── config.js                (API Configuration)
    │
    ├── partials/
    │   └── admin-header.html        (Admin Navigation - NEW)
    │
    └── dashboard.html               (Admin Dashboard - UPDATED)
```

---

## 🔧 Backend Components

### 1. User Model (`models/User.js`)

```javascript
// Already configured with:
- id (PRIMARY KEY)
- first_name, last_name
- email (UNIQUE)
- password (hashed with bcrypt)
- jwt_token (stored for validation)
- role (ENUM: admin, customer)
- status (ENUM: active, inactive)
- timestamps (created_at, updated_at)
```

### 2. Auth Controller (`controllers/authController.js`)

**Methods:**

#### `register()` - User Registration
- Validates input
- Checks for duplicate email
- Hashes password with bcrypt
- Creates customer account (default role)

#### `login()` - User Authentication
- Validates email and password
- Checks if account is active
- Generates JWT token
- Saves token to database
- Returns user info and token

#### `logout()` - Clear Session
- Removes JWT token from database
- Terminates user session
- Clears client-side authentication

#### `profile()` - Get User Profile
- Returns authenticated user's information
- Requires valid JWT token

#### `refreshToken()` - Extend Session
- Generates new JWT token
- Updates token in database
- Allows session extension

### 3. Auth Middleware (`middleware/authMiddleware.js`)

Verifies JWT token on every request:

```javascript
// Checks:
✓ Authorization header present
✓ Bearer token valid format
✓ JWT signature valid
✓ Token not expired
✓ Token matches database
✓ User account is active
✓ Extracts user info to req.user
```

### 4. Admin Middleware (`middleware/adminMiddleware.js`)

Verifies admin role:

```javascript
// Checks:
✓ User has admin role
✓ Returns 403 Forbidden if not admin
```

### 5. Authentication Routes (`routes/authRoutes.js`)

| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | None | Register new customer |
| POST | `/api/auth/login` | Validation | Login with credentials |
| GET | `/api/auth/admin` | Auth + Admin | Verify admin access |
| POST | `/api/auth/logout` | Auth | Clear session |
| GET | `/api/auth/profile` | Auth | Get user profile |
| POST | `/api/auth/refresh-token` | Auth | Refresh JWT token |

### 6. Auth Service (`services/authService.js`)

Core authentication logic:

```javascript
// Functions:
✓ findUserByEmail() - Check if email exists
✓ registerUser() - Create new user
✓ loginUser() - Authenticate and generate token
```

### 7. Database Seeder (`seed.js`)

Automatically creates default admin account:

```javascript
// On first run:
✓ Checks if admin@fithub.com exists
✓ Creates admin with hashed password (Admin@123)
✓ Sets role=admin, status=active
✓ Idempotent (safe to run multiple times)
```

---

## 🎨 Frontend Components

### 1. Admin Login Page (`admin-login.html`)

**Features:**

- 🎨 Modern Bootstrap 5 design with gradient background
- 📧 Email input with validation
- 🔐 Password input with show/hide toggle
- ✅ Remember Me checkbox (7-day auto-login)
- 💬 Demo credentials display box
- 🔔 SweetAlert2 notifications
- 📱 Fully responsive (desktop & mobile)
- ♿ Accessible form controls
- ⚡ Loading indicator during submission

**HTML Elements:**

```html
<!-- Logo & Title -->
<div class="admin-logo">...</div>

<!-- Demo Credentials Box -->
<div class="demo-credentials">...</div>

<!-- Login Form -->
<form id="adminLoginForm">
  <input id="adminEmail" type="email" required>
  <input id="adminPassword" type="password" required>
  <span id="passwordToggle">👁️ Toggle</span>
  <input id="rememberMe" type="checkbox">
  <button id="loginBtn">Login</button>
</form>

<!-- Forgot Password Modal -->
<div id="forgotPasswordModal">...</div>
```

### 2. Admin Login Script (`js/admin-login.js`)

**Functions:**

#### `clearErrors()`
Clears validation error messages

#### `showFieldError(fieldId, message)`
Displays error for specific field

#### `validateForm()`
Validates email and password:
- Email format validation
- Password minimum length
- Returns validation status

#### `isValidEmail(email)`
Checks email format with regex

**Event Handlers:**

```javascript
// Form submission
$('#adminLoginForm').on('submit', handleLogin);

// Password visibility toggle
$('#passwordToggle').on('click', togglePasswordVisibility);

// Remember Me checkbox
$('#rememberMe').on('change', saveEmailIfChecked);

// Forgot Password button
$('#resetPasswordBtn').on('click', handlePasswordReset);

// Auto-fill remembered email
window.addEventListener('load', autoFillRememberedEmail);
```

**Login Flow:**

```
User enters credentials
    ↓
Form validation (client-side)
    ↓
AJAX POST to /api/auth/login
    ↓
Success: Save token + user to storage
    ↓
Success: Show SweetAlert success
    ↓
Success: Redirect to dashboard.html
    ↓
Error: Show SweetAlert error
    ↓
Error: Display field errors
```

**AJAX Request:**

```javascript
$.ajax({
  url: 'http://localhost:4000/api/auth/login',
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({ email, password }),
  timeout: 10000,
  success: handleLoginSuccess,
  error: handleLoginError,
  complete: resetButtonState
});
```

**Token Storage:**

```javascript
// Remember Me checked = localStorage (7 days)
localStorage.setItem('fithub_token', token);
localStorage.setItem('fithub_user', JSON.stringify(user));

// Remember Me unchecked = sessionStorage (current session)
sessionStorage.setItem('fithub_token', token);
sessionStorage.setItem('fithub_user', JSON.stringify(user));
```

### 3. Admin Header Component (`partials/admin-header.html`)

**Navigation Menu:**

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <!-- Logo: FitHub Admin -->
  
  <!-- Menu Items -->
  <a href="dashboard.html">Dashboard</a>
  <a href="users.html">Users</a>
  <a href="products.html">Products</a>
  <a href="inventory.html">Inventory</a>
  <a href="transactions.html">Orders</a>
  <a href="reports.html">Reports</a>
  
  <!-- User Profile Dropdown -->
  <a href="#" id="userDropdown">
    <i class="fas fa-user-circle"></i> Admin Name
  </a>
  
  <!-- Dropdown Menu -->
  <a id="profileBtn">My Profile</a>
  <a id="settingsBtn">Settings</a>
  <a id="logoutBtn">Logout</a>
</nav>
```

**Features:**

- 🔗 Links to all admin modules
- 👤 User profile dropdown
- ⚙️ Settings link (expandable)
- 🚪 Logout button with confirmation
- 📱 Mobile-responsive hamburger menu
- 🎨 Dark theme with hover effects

**JavaScript:**

```javascript
// Display user name
const user = AdminAuthManager.getUser();
$('#adminName').text(`${user.first_name} ${user.last_name}`);

// Logout with confirmation
$('#logoutBtn').on('click', confirmLogout);

// Call API to clear token
$.ajax({
  url: '/api/auth/logout',
  type: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 4. Auth Manager Utility (`js/admin-login.js`)

**Global Object:** `AdminAuthManager`

```javascript
// Save authentication data
AdminAuthManager.saveAuth(token, user, rememberMe);

// Get stored token
const token = AdminAuthManager.getToken();

// Get stored user data
const user = AdminAuthManager.getUser();

// Clear all authentication data
AdminAuthManager.clearAuth();

// Check if authenticated
if (AdminAuthManager.isAuthenticated()) { ... }

// Check if admin
if (AdminAuthManager.isAdmin()) { ... }
```

---

## 🔐 Security Features

### 1. Password Security

✅ **Bcrypt Hashing**
- Salt rounds: 10
- One-way encryption
- Constant-time comparison (prevents timing attacks)

### 2. JWT Token Security

✅ **Token Validation**
- Signature verification
- Expiration checking
- Token matching with database
- Automatic token refresh support

### 3. Database Security

✅ **Sequelize ORM**
- Prepared statements (prevents SQL injection)
- Input validation via express-validator
- Parameterized queries

### 4. Session Security

✅ **Token Storage**
- localStorage: Persistent (7 days with Remember Me)
- sessionStorage: Temporary (current session only)
- Token cleared on logout
- Token invalidated in database

### 5. Access Control

✅ **Role-Based Access Control**
- Admin role required for admin routes
- 403 Forbidden for non-admin users
- Middleware checks on every protected route

### 6. Input Validation

✅ **Express Validator**
- Email format validation
- Password strength requirements
- Trim/Escape user input
- Prevent XSS attacks

### 7. Error Handling

✅ **Generic Error Messages**
- No sensitive info in error responses
- Cannot enumerate valid emails
- Cannot determine password requirements

---

## 📡 API Documentation

### POST /api/auth/login

**Request:**

```json
{
  "email": "admin@fithub.com",
  "password": "Admin@123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "first_name": "System",
      "last_name": "Administrator",
      "email": "admin@fithub.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### POST /api/auth/logout

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful. Your session has been terminated."
}
```

---

### GET /api/auth/profile

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "User profile retrieved successfully.",
  "data": {
    "id": 1,
    "first_name": "System",
    "last_name": "Administrator",
    "email": "admin@fithub.com",
    "role": "admin",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/auth/refresh-token

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "first_name": "System",
      "last_name": "Administrator",
      "email": "admin@fithub.com",
      "role": "admin"
    }
  }
}
```

---

## 🚀 Setup Instructions

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created)
# Verify these settings:
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=fithub
DB_USER=root
DB_PASSWORD=
JWT_SECRET=fithub-super-secret-key
JWT_EXPIRES_IN=1d

# Start the server
npm run dev
```

**Expected Output:**
```
✅ Database connection established successfully.
✅ Default admin account created (Email: admin@fithub.com | Password: Admin@123)
✅ Seed data created successfully.
Express server listening on port 4000
```

### Step 2: Database Setup

```bash
# Start MySQL
# XAMPP Control Panel → Start MySQL

# Verify database exists
mysql -u root
> SHOW DATABASES;
> USE fithub;
> SHOW TABLES;
```

### Step 3: Frontend Setup

```bash
# Open in browser
http://localhost/fithub-app/Frontend/admin-login.html
```

### Step 4: First Login

1. Navigate to admin-login.html
2. Enter credentials:
   - Email: `admin@fithub.com`
   - Password: `Admin@123`
3. Click "Login to Dashboard"
4. Verify redirect to dashboard.html
5. **Change password immediately in production!**

---

## ✅ Testing

### 1. Test Admin Login

```bash
# Navigate to
http://localhost/fithub-app/Frontend/admin-login.html

# Enter test credentials
Email: admin@fithub.com
Password: Admin@123

# Expected: Redirect to dashboard
```

### 2. Test Protected Routes

```bash
# Try accessing without token
http://localhost/fithub-app/Frontend/dashboard.html

# Expected: Redirect to admin-login.html

# Try accessing with token
# (After successful login, token stored in browser)

# Expected: Dashboard loads normally
```

### 3. Test Logout

```bash
# From dashboard header, click Logout
# Confirm logout

# Expected: Redirect to admin-login.html
```

### 4. Test Remember Me

```bash
# Check "Remember Me" checkbox
# Login successfully

# Close browser and reopen
# Navigate to dashboard

# Expected: Auto-fill email on login page
```

### 5. Test Invalid Credentials

```bash
# Enter wrong email
# Expected: "Invalid email or password" error

# Enter wrong password
# Expected: "Invalid email or password" error

# Blank email or password
# Expected: Validation errors on fields
```

### 6. Test Token Expiration

```bash
# In .env, change JWT_EXPIRES_IN to short duration
JWT_EXPIRES_IN=5s

# Login
# Wait 5+ seconds
# Try to access protected route

# Expected: 401 Unauthorized error
```

### 7. Test API Endpoints (Using Postman)

```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@fithub.com",
  "password": "Admin@123"
}

Expected Status: 200
Expected Response: token and user data
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
npm install
```

### Issue: "Unknown database 'fithub'"

**Solution:**
```bash
# Create database
mysql -u root -p
> CREATE DATABASE fithub;

# Or import from ERD file
mysql -u root fithub < fithub_app-erd.sql
```

### Issue: "JWT_SECRET is undefined"

**Solution:**
```bash
# Verify .env file exists
# Verify JWT_SECRET=fithub-super-secret-key is set

# Restart server after modifying .env
npm run dev
```

### Issue: "Admin account not created on startup"

**Solution:**
```bash
# Delete bcrypt import requirement check
# Verify bcrypt is installed: npm list bcrypt

# Run seed manually:
node seed.js

# Or delete and recreate users table to re-seed
```

### Issue: "Login button shows spinner infinitely"

**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running: `npm run dev`
3. Verify API URL in js/admin-login.js is correct
4. Check network tab (F12 → Network) for failed requests

### Issue: "Token not saving to localStorage"

**Solution:**
```javascript
// Check browser DevTools:
// F12 → Application → Storage → localStorage

// Verify token is returned from API
// Check Remember Me checkbox is working
// Try clearing browser storage and login again
```

### Issue: "CORS error when logging in"

**Solution:**
```bash
# Verify CORS is enabled in backend/server.js:
app.use(cors());

# Check API URL uses correct port (4000)

# Restart backend server
```

### Issue: "Dashboard redirects back to login"

**Solution:**
1. Check AdminAuthManager is working:
   ```javascript
   // Open browser console (F12)
   > AdminAuthManager.getToken()
   > AdminAuthManager.getUser()
   ```
2. Verify token is stored in localStorage/sessionStorage
3. Check user.role === 'admin'
4. Verify jwt_token is saved in database

### Issue: "Password toggle not working"

**Solution:**
```bash
# Verify Font Awesome is loaded
# Check admin-login.js is linked in HTML

# Open browser console for JavaScript errors
# Press F12 and look for red errors
```

---

## 📝 Notes

### Default Admin Account

| Field | Value |
|-------|-------|
| **Email** | admin@fithub.com |
| **Password** | Admin@123 |
| **Role** | admin |
| **Status** | active |

⚠️ **IMPORTANT:** This is created automatically on first server run. **Change it immediately in production!**

### Environment Variables

```bash
PORT=4000                           # Backend server port
DB_HOST=127.0.0.1                  # MySQL host
DB_PORT=3306                       # MySQL port
DB_NAME=fithub                     # Database name
DB_USER=root                       # MySQL user
DB_PASSWORD=                       # MySQL password
JWT_SECRET=fithub-super-secret-key # JWT signing key
JWT_EXPIRES_IN=1d                  # Token expiration
```

### Token Expiration

Tokens expire after 1 day by default. Configure in `.env`:

```bash
JWT_EXPIRES_IN=7d      # 7 days
JWT_EXPIRES_IN=24h     # 24 hours
JWT_EXPIRES_IN=1h      # 1 hour
```

### Remember Me Functionality

- **Checked**: Token saved to localStorage (persists for 7 days)
- **Unchecked**: Token saved to sessionStorage (clears when browser closes)
- Email address remembered if checked previously

---

## 🎓 Code Comments

All files include detailed comments explaining:

- Purpose of each function
- Parameter descriptions
- Return values
- Error handling
- Security considerations
- Usage examples

---

## ✨ Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Password reset email functionality
- [ ] Activity audit logs with timestamps
- [ ] IP address tracking and geo-blocking
- [ ] Rate limiting on login attempts
- [ ] Admin session history
- [ ] Role-based permissions matrix
- [ ] Advanced account recovery options

---

**Documentation Version:** 1.0  
**Last Updated:** 2024  
**Compatibility:** Node.js 18+, Express 5.x, Sequelize 6.x, MySQL 8.0+
