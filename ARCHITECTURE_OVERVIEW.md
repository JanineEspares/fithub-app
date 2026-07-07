# 🏗️ FitHub Admin Authentication - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (JavaScript)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐       ┌──────────────────────┐        │
│  │  admin-login.html    │       │   dashboard.html     │        │
│  │                      │       │   (Protected Route)  │        │
│  │  • Email input       │       │                      │        │
│  │  • Password input    │       │  • Admin header      │        │
│  │  • Show/Hide toggle  │       │  • Metrics display   │        │
│  │  • Remember Me       │       │  • Charts            │        │
│  │  • Submit button     │       │  • Content area      │        │
│  └──────────────────────┘       └──────────────────────┘        │
│           │                                  ▲                    │
│           │ AJAX POST                       │ Auto-verify         │
│           │ /api/auth/login                 │ token + role        │
│           ▼                                  │                    │
│  ┌─────────────────────────────────────────┐ │                   │
│  │     admin-login.js (Script)             │ │                   │
│  ├─────────────────────────────────────────┤ │                   │
│  │  1. validateForm()                      │ │                   │
│  │  2. $.ajax() POST login                 │ │                   │
│  │  3. Save token to storage               │ │                   │
│  │  4. Redirect to dashboard               │ │                   │
│  │                                         │ │                   │
│  │  AdminAuthManager Utility:              │ │                   │
│  │  • saveAuth(token, user)                │ │                   │
│  │  • getToken()                           │ │                   │
│  │  • getUser()                            │ │                   │
│  │  • isAuthenticated()                    │ │                   │
│  │  • isAdmin()                            │ │                   │
│  │  • clearAuth()                          │ │                   │
│  └─────────────────────────────────────────┘ │                   │
│           │                                   │                   │
│           │ $.ajax() with                     │                   │
│           │ Authorization header              │                   │
│           ▼                                   │                   │
│  ┌─────────────────────────────────────────┐ │                   │
│  │  admin-header.html (Component)          │ │                   │
│  ├─────────────────────────────────────────┤ │                   │
│  │  • Dashboard link                       │ │                   │
│  │  • Users link                           │ │                   │
│  │  • Products link                        │ │                   │
│  │  • User dropdown                        │ │                   │
│  │  • Logout button                        │ │                   │
│  │    └─ $.ajax() POST /api/auth/logout   │─┼──────┐             │
│  │    └─ Clear storage                     │ │      │             │
│  │    └─ Redirect to login                 │ │      │             │
│  └─────────────────────────────────────────┘ │      │             │
│                                                │      │             │
└────────────────────────────────────────────────┼──────┼─────────────┘
                                                  │      │
              localStorage/sessionStorage        │      │
              ┌─────────────────────┐            │      │
              │ fithub_token        │◄───────────┘      │
              │ fithub_user         │                   │
              └─────────────────────┘                   │
                                                        │
┌─────────────────────────────────────────────────────┼──────────────┐
│                    BACKEND (Node.js/Express)        │              │
├─────────────────────────────────────────────────────┼──────────────┤
│                                                      │              │
│  ┌─────────────────────────────────────────────────┐│              │
│  │              API Routes (authRoutes.js)         ││              │
│  ├─────────────────────────────────────────────────┤│              │
│  │                                                 ││              │
│  │  POST /api/auth/login                         ││              │
│  │    ↓ loginValidator                            ││              │
│  │    ↓ authController.login()                    ││              │
│  │    ↓ Generate JWT token                        ││              │
│  │    ↓ Save to database                          ││              │
│  │    ↓ Return { token, user }                    ││              │
│  │                                                 ││              │
│  │  POST /api/auth/logout (Protected)            ││              │
│  │    ↓ authMiddleware (verify token)             ││──────┐       │
│  │    ↓ authController.logout()                   ││      │       │
│  │    ↓ Clear token from database                 ││      │       │
│  │    ↓ Return { success: true }                  ││      │       │
│  │                                                 ││      │       │
│  │  GET /api/auth/profile (Protected)            ││      │       │
│  │  POST /api/auth/refresh-token (Protected)     ││      │       │
│  │  GET /api/auth/admin (Protected + Admin)      ││      │       │
│  │  POST /api/auth/register (Public)             ││      │       │
│  │                                                 ││      │       │
│  └─────────────────────────────────────────────────┘│      │       │
│           ▲                                         │      │       │
│           │                                         │      │       │
│  ┌────────┴───────────────────────────────────────┐│      │       │
│  │        Middleware Stack                         ││      │       │
│  ├─────────────────────────────────────────────────┤│      │       │
│  │                                                 ││      │       │
│  │  1. Express Parser (JSON)                      ││      │       │
│  │  2. CORS Configuration                         ││      │       │
│  │  3. authMiddleware (if protected route)        ││      │       │
│  │     • Extract token from headers               ││      │       │
│  │     • Verify JWT signature                     ││      │       │
│  │     • Check token in database                  ││      │       │
│  │     • Attach user to req.user                  ││      │       │
│  │                                                 ││      │       │
│  │  4. adminMiddleware (if admin route)           ││      │       │
│  │     • Check req.user.role === 'admin'          ││      │       │
│  │     • Check req.user.status === 'active'       ││      │       │
│  │                                                 ││      │       │
│  │  5. Validators (if needed)                     ││      │       │
│  │     • express-validator rules                  ││      │       │
│  │     • Input sanitization                       ││      │       │
│  │     • Format checking                          ││      │       │
│  │                                                 ││      │       │
│  │  6. Error Handler                              ││      │       │
│  │     • Generic error messages                   ││      │       │
│  │     • Proper HTTP status codes                 ││      │       │
│  │                                                 ││      │       │
│  └────────────────────────────────────────────────┘│      │       │
│           ▲                                         │      │       │
│           │                                         │      │       │
│  ┌────────┴───────────────────────────────────────┐│      │       │
│  │     Controllers & Services                      ││      │       │
│  ├─────────────────────────────────────────────────┤│      │       │
│  │                                                 ││      │       │
│  │  authController.js                             ││      │       │
│  │  ├─ login()        → Call authService           ││      │       │
│  │  ├─ register()     → Call authService           ││      │       │
│  │  ├─ logout()       → Update User.jwt_token      ││      │       │
│  │  ├─ profile()      → Return user data           ││      │       │
│  │  └─ refreshToken() → Generate new JWT          ││      │       │
│  │                                                 ││      │       │
│  │  authService.js                                ││      │       │
│  │  ├─ loginUser()     → Validate + Generate JWT  ││      │       │
│  │  ├─ registerUser()  → Hash password + Create   ││      │       │
│  │  ├─ hashPassword()  → bcrypt.hash()            ││      │       │
│  │  ├─ comparePassword() → bcrypt.compare()       ││      │       │
│  │  └─ generateToken() → jwt.sign()               ││      │       │
│  │                                                 ││      │       │
│  │  Validators                                    ││      │       │
│  │  ├─ loginValidator.js                          ││      │       │
│  │  │  └─ Email + Password validation             ││      │       │
│  │  └─ registerValidator.js                       ││      │       │
│  │     └─ All fields + Email uniqueness           ││      │       │
│  │                                                 ││      │       │
│  └─────────────────────────────────────────────────┘│      │       │
│           ▲                                         │      │       │
│           │                                         │      │       │
│  ┌────────┴───────────────────────────────────────┐│      │       │
│  │          Database (MySQL)                       ││      │       │
│  ├─────────────────────────────────────────────────┤│      │       │
│  │                                                 ││      │       │
│  │  Users Table                                    ││      │       │
│  │  ┌─────────────────────────────────────┐       ││      │       │
│  │  │ id (PK)                             │       ││      │       │
│  │  │ first_name                          │       ││      │       │
│  │  │ last_name                           │       ││      │       │
│  │  │ email (UNIQUE)                      │       ││      │       │
│  │  │ password (HASHED)  ◄────────────────┼──────┤├──────┤       │
│  │  │ jwt_token (LONGTEXT)  ◄─────────────┼──────┤├──────┼─────┐ │
│  │  │ role (admin|customer)               │       ││      │     │ │
│  │  │ status (active|inactive)            │       ││      │     │ │
│  │  │ created_at / updated_at             │       ││      │     │ │
│  │  └─────────────────────────────────────┘       ││      │     │ │
│  │                                                 ││      │     │ │
│  │  Sequelize ORM                                 ││      │     │ │
│  │  ├─ Prevents SQL injection                     ││      │     │ │
│  │  ├─ Connection pooling                         ││      │     │ │
│  │  └─ Query optimization                         ││      │     │ │
│  │                                                 ││      │     │ │
│  └─────────────────────────────────────────────────┘│      │     │ │
│                                                      │      │     │ │
└──────────────────────────────────────────────────────┼──────┼─────┼─┘
                                                       │      │     │
                                                       │      │     │
      Stores in localStorage/sessionStorage           │      │     │
      (with Authorization header in requests)         │      │     │
      ──────────────────────────────────────────────►  │      │     │
                                                       │      │     │
      Returns from database on each request            │      │     │
      ◄──────────────────────────────────────────────  │      │     │
                                                       │      │     │
      On logout, clears from database and storage     │      │     │
      ──────────────────────────────────────────────►  ┘      └─────┘


```

---

## 🔄 Authentication Flow

### Login Flow

```
┌─────────────┐
│ User opens  │
│ login page  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Enters credentials  │
│ • admin@fithub.com  │
│ • Admin@123         │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ Client validation    │
│ • Email format ✓     │
│ • Password length ✓  │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AJAX POST /api/auth/login               │
│ Headers: Content-Type: application/json │
│ Body: { email, password }               │
└──────┬────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Backend: authController.login()          │
├──────────────────────────────────────────┤
│ 1. loginValidator checks input           │
│ 2. Find user by email in database        │
│ 3. Compare passwords (bcrypt.compare)    │
│ 4. Check status === 'active'             │
│ 5. Generate JWT token                    │
│ 6. Save token to User.jwt_token          │
│ 7. Return { token, user }                │
└──────┬───────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Frontend: Save token & user     │
│ • localStorage or sessionStorage │
│ • AdminAuthManager utility      │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Redirect to dashboard.html      │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Dashboard loads and verifies    │
│ • Check for token in storage    │
│ • Check user.role === 'admin'   │
│ • If valid → Load dashboard     │
│ • If invalid → Redirect to login│
└─────────────────────────────────┘
```

### Protected Route Access

```
┌─────────────────────────────────────┐
│ User accesses protected route       │
│ (dashboard, users, products, etc)   │
└──────┬──────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Check for token in storage               │
└──────┬───────────────────────────────────┘
       │
       ├─ No token found?
       │  └─ Redirect to admin-login.html
       │
       └─ Token found?
          ▼
       ┌──────────────────────────────────────────┐
       │ Send request with Authorization header   │
       │ Headers: {                               │
       │   Authorization: 'Bearer {token}',       │
       │   Content-Type: 'application/json'       │
       │ }                                        │
       └──────┬───────────────────────────────────┘
              │
              ▼
       ┌──────────────────────────────────────────┐
       │ Backend: authMiddleware processes        │
       ├──────────────────────────────────────────┤
       │ 1. Extract token from header             │
       │ 2. Verify JWT signature                  │
       │ 3. Check token in database               │
       │ 4. Attach user data to req.user          │
       │ 5. Call next() to continue               │
       └──────┬───────────────────────────────────┘
              │
              ├─ Invalid token?
              │  └─ Return 401 Unauthorized
              │
              └─ Valid token?
                 ▼
              ┌──────────────────────────────────────────┐
              │ Check if admin route (adminMiddleware)   │
              ├──────────────────────────────────────────┤
              │ 1. Check req.user.role === 'admin'       │
              │ 2. Check req.user.status === 'active'    │
              │ 3. Call next() if both true              │
              └──────┬───────────────────────────────────┘
                     │
                     ├─ Not admin?
                     │  └─ Return 403 Forbidden
                     │
                     └─ Is admin?
                        ▼
                     ┌──────────────────────────────────────┐
                     │ Execute route handler                │
                     │ • Load page content                  │
                     │ • Display user data                  │
                     │ • Allow actions                      │
                     └──────────────────────────────────────┘
```

### Logout Flow

```
┌─────────────────────────────────┐
│ User clicks Logout in header    │
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Confirmation dialog appears  │
│ "Are you sure you want to    │
│  logout?"                    │
└──────┬───────────────────────┘
       │
       ├─ User cancels
       │  └─ Stay on dashboard
       │
       └─ User confirms
          ▼
       ┌────────────────────────────────────────┐
       │ AJAX POST /api/auth/logout             │
       │ Headers: {                             │
       │   Authorization: 'Bearer {token}',     │
       │   Content-Type: 'application/json'     │
       │ }                                      │
       └──────┬─────────────────────────────────┘
              │
              ▼
       ┌────────────────────────────────────────┐
       │ Backend: authController.logout()       │
       ├────────────────────────────────────────┤
       │ 1. authMiddleware validates token      │
       │ 2. Find user in database               │
       │ 3. Set user.jwt_token = null           │
       │ 4. Save to database                    │
       │ 5. Return { success: true }            │
       └──────┬─────────────────────────────────┘
              │
              ▼
       ┌────────────────────────────────────────┐
       │ Frontend: Clear storage                │
       │ • Remove from localStorage/sessionStore│
       │ • Call AdminAuthManager.clearAuth()    │
       └──────┬─────────────────────────────────┘
              │
              ▼
       ┌────────────────────────────────────────┐
       │ Display success notification           │
       │ (SweetAlert2)                          │
       └──────┬─────────────────────────────────┘
              │
              ▼
       ┌────────────────────────────────────────┐
       │ Redirect to admin-login.html           │
       └────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Login Data Flow                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Frontend Form                Backend Processing            Database  │
│  ───────────────────────      ──────────────────────        ────────  │
│                                                                        │
│  { email:    "admin@..." }                                            │
│  { password: "Admin@123" } ──→ Validator                              │
│                           ├─→ Find User ─────────────────→ SELECT *  │
│                           │                            FROM users     │
│                           │                            WHERE email=?  │
│                           │                                            │
│                           ├─→ Compare Passwords                        │
│                           │  (bcrypt.compare)                          │
│                           │                                            │
│                           ├─→ Generate JWT Token                       │
│                           │  (jwt.sign)                                │
│                           │                                            │
│                           └─→ Save Token ─────────────────→ UPDATE    │
│                               to Database        users SET            │
│                                                   jwt_token = ? WHERE  │
│                                                   id = ?               │
│                                                                        │
│                           ◄─── Response ◄──────────────────           │
│  { success: true,                                                     │
│    message: "...",                                                    │
│    data: {                                                            │
│      token: "eyJ...",   ◄────── Store in Storage                      │
│      user: {            ◄────── Display in Header                     │
│        id: 1,                                                         │
│        first_name: "System",                                          │
│        last_name: "Administrator",                                    │
│        email: "admin@fithub.com",                                     │
│        role: "admin",                                                 │
│        status: "active"                                               │
│      }                                                                │
│    }                                                                  │
│  }                                                                    │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Implementation

```
┌─────────────────────────────────────────────────────┐
│          Password Security (bcrypt)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Plain Password    →  bcrypt.hash()  →  Hash      │
│  "Admin@123"       (10 salt rounds)     Stored    │
│                                                     │
│  Later:                                             │
│  User Input        →  bcrypt.compare()  →  Match  │
│  "Admin@123"       (constant-time)        Verified │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          Token Security (JWT)                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  User ID      →  jwt.sign()       →  JWT Token    │
│  Email        (HS256 algorithm)       Signed      │
│  Role         (JWT_SECRET key)                     │
│                                                     │
│  Later:                                             │
│  JWT Token    →  jwt.verify()     →  Token Valid  │
│  (from header)  (check signature)      ✓          │
│                                                     │
│  Then:                                              │
│  Check Database Token              →  Not Revoked │
│  (ensure token matches)                ✓          │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          Input Validation                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Client Input  →  express-validator  →  Sanitized│
│  {email, pwd}     • Email format                   │
│                   • Password length               │
│                   • Trim whitespace               │
│                   • Escape HTML                   │
│                                                     │
│  Then:                                              │
│  Validated Input  →  Sequelize ORM  →  Safe Query │
│                      (parameterized)    (no SQL  │
│                                         injection)│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📡 API Response Structure

```
Success Response:
┌──────────────────────────────────────┐
│ {                                    │
│   "success": true,                   │
│   "message": "Login successful.",    │
│   "data": {                          │
│     "token": "eyJ...",               │
│     "user": {                        │
│       "id": 1,                       │
│       "first_name": "System",        │
│       "last_name": "Administrator",  │
│       "email": "admin@fithub.com",   │
│       "role": "admin",               │
│       "status": "active"             │
│     }                                │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
Status: 200 OK

Error Response:
┌──────────────────────────────────────┐
│ {                                    │
│   "success": false,                  │
│   "message": "Invalid credentials."  │
│ }                                    │
└──────────────────────────────────────┘
Status: 401 Unauthorized
```

---

## 🎯 Component Interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Component Relationships                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  admin-login.html                                                    │
│       │                                                              │
│       └─── Requires ──→ jQuery 3.7.1                               │
│       │                Bootstrap 5.3.3                              │
│       │                Font Awesome 6.4.0                           │
│       │                SweetAlert2                                  │
│       └─── Uses JS ──→ admin-login.js                              │
│                            │                                        │
│                            └─ Depends on ─→ config.js (API URL)    │
│                            │                                        │
│                            ├─ Calls ─→ AdminAuthManager            │
│                            │                                        │
│                            └─ Uses ─→ $.ajax()                     │
│                                           ↓                         │
│                                    /api/auth/login                  │
│                                           ↓                         │
│  dashboard.html                                                      │
│       │                                                              │
│       └─── Requires ──→ admin-login.js (for AdminAuthManager)      │
│       │                admin-header.html (dynamically loaded)       │
│       │                                                              │
│       └─── On Load ──→ Check AdminAuthManager.isAdmin()            │
│                              ↓                                      │
│                        Redirect if not admin                        │
│                              ↓                                      │
│                        Load admin-header.html                       │
│                              ↓                                      │
│                        Display dashboard content                    │
│                                                                      │
│  admin-header.html                                                   │
│       │                                                              │
│       └─── Uses ──→ AdminAuthManager.getUser()                      │
│       │                                                              │
│       └─── Uses ──→ $.ajax() for logout                            │
│                              ↓                                      │
│                      /api/auth/logout                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```
Users Table:
┌─────────────────────────────────────────────────┐
│ users                                           │
├─────────────────────────────────────────────────┤
│ PK  id                    INT AUTO_INCREMENT     │
│     first_name            VARCHAR(100)           │
│     last_name             VARCHAR(100)           │
│     email                 VARCHAR(255) UNIQUE    │
│     password              VARCHAR(255) [HASHED] │
│     jwt_token             LONGTEXT [NULLABLE]    │
│     role                  ENUM(admin,customer)   │
│     role_id               INT [NULLABLE]         │
│     status                ENUM(active,inactive)  │
│     created_at            TIMESTAMP              │
│     updated_at            TIMESTAMP              │
└─────────────────────────────────────────────────┘

Admin Account (Created by seed.js):
┌────────────────────────────────────────┐
│ id:         1                          │
│ first_name: System                     │
│ last_name:  Administrator             │
│ email:      admin@fithub.com          │
│ password:   [bcrypt hashed]            │
│ role:       admin                      │
│ status:     active                     │
│ jwt_token:  [empty until login]        │
└────────────────────────────────────────┘
```

---

## ✨ Summary

This architecture provides:

✅ **Security** - bcrypt hashing, JWT validation, role-based access
✅ **Scalability** - Stateless JWT authentication
✅ **Maintainability** - Clean separation of concerns
✅ **Reliability** - Comprehensive error handling
✅ **User Experience** - Fast, responsive interface

All components work together seamlessly to provide a production-ready admin authentication system.
