# 📚 Digital Library Management System

A backend for a university library to manage its book catalog, member registrations, borrowing/return workflow, and fine calculation — replacing a manual register-based process.

## 🎯 Problem Statement

University libraries currently maintain borrowing records in bulky manual registers, making it difficult to track books in circulation, compute fines accurately, notify members about overdue items, or generate useful management reports. This system digitizes the entire library workflow — from member registration and catalog management to the full borrow/return lifecycle with automatic fine calculation and role-based access — so staff can manage inventory in real time and members can borrow, hold, and return books through a clean API.

## 👥 Team Details

| Name | Roll No | Department | Section |
|------|---------|------------|---------|
| Khushi K. Sheth | 2462098 | ADSE | 5BTCSAIML C |
| Joann Binny | 2462088 | ADSE | 5BTCSAIML C |
| Joshiny Maria | 2462091 | ADSE | 5BTCSAIML C |
| Krishna S Nair| 2462102 | ADSE | 5BTCSAIML C |

> Before submitting, replace the `—` cells with the actual names and roll numbers of all team members.

## 🧰 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Testing/Docs:** Postman collection

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local instance or MongoDB Atlas)

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd digital-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set your values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/digital_library
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=7d
   FINE_PER_DAY=2
   ```

4. **Start MongoDB** (if running locally)

5. **(Optional) Seed sample data**
   ```bash
   node seed.js
   ```
   This creates membership plans, an admin, a librarian, members, and books.

6. **Start the server**
   ```bash
   npm start          # production
   npm run dev        # development (with nodemon)
   ```

7. **Verify it's running**
   ```
   GET http://localhost:5000/api/health
   ```

### Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Librarian | librarian@library.com | lib123 |
| Member (Student) | john@student.com | password123 |
| Member (Student) | jane@student.com | password123 |
| Member (Faculty) | robert@faculty.com | password123 |

## 📦 Implemented Modules (All 13 Required)

| # | Module | Status |
|---|--------|--------|
| 1 | Member Registration & Authentication | ✅ |
| 2 | Book Catalog Management | ✅ |
| 3 | Catalog Search & Filtering | ✅ |
| 4 | Book Issue Workflow | ✅ |
| 5 | Book Return & Fine Calculation | ✅ |
| 6 | Reservation/Hold Queue | ✅ |
| 7 | Membership Plans & Limits | ✅ |
| 8 | Fine Payment Tracking | ✅ |
| 9 | Overdue Notification Records | ✅ |
| 10 | Inventory & Copy Management | ✅ |
| 11 | Member Borrowing History | ✅ |
| 12 | Librarian/Admin Reports | ✅ |
| 13 | Role-Based Access Control | ✅ |

## 🔐 Role-Based Access Overview

| Endpoint Area | Member | Librarian | Admin |
|---------------|--------|-----------|-------|
| Auth (register/login) | ✅ (register as member) | | |
| Books (view/search) | ✅ | ✅ | ✅ |
| Books (create/update/delete) | ❌ | ✅ | ✅ |
| Transactions (issue/return) | ❌ | ✅ | ✅ |
| Transactions (history) | ✅ (own/any) | ✅ | ✅ |
| Holds (create/cancel) | ✅ (own) | ✅ | ✅ |
| Fines (pay) | ✅ (own) | ✅ | ✅ |
| Fines (waive) | ❌ | ✅ | ✅ |
| Membership Plans (view) | ✅ | ✅ | ✅ |
| Membership Plans (manage) | ❌ | ❌ | ✅ |
| Reports | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

## 🔌 API Endpoint Reference

### Authentication (Module 1)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new library member | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/profile` | Get current user profile | Authenticated |
| GET | `/api/auth/users` | List all users | Admin |
| PUT | `/api/auth/users/:id/deactivate` | Deactivate a user | Admin |
| POST | `/api/auth/librarian` | Create a librarian account | Librarian/Admin |

### Books (Modules 2, 3)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/books` | Get all books (paginated) | Public |
| GET | `/api/books/search` | Search by title/author/category/availability | Public |
| GET | `/api/books/:id` | Get a single book | Public |
| POST | `/api/books` | Add a new book | Librarian/Admin |
| PUT | `/api/books/:id` | Update book details | Librarian/Admin |
| DELETE | `/api/books/:id` | Soft-delete a book | Librarian/Admin |

### Transactions (Modules 4, 5, 11)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/transactions/issue` | Issue a book to a member | Librarian/Admin |
| PUT | `/api/transactions/:id/return` | Return a book, auto-compute fine | Librarian/Admin |
| GET | `/api/transactions/member/:id` | Member borrowing history | Authenticated |
| GET | `/api/transactions` | Get all transactions | Librarian/Admin |
| GET | `/api/transactions/:id` | Get a single transaction | Authenticated |

### Holds (Module 6)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/holds` | Place a hold on a book | Member |
| PUT | `/api/holds/:id/cancel` | Cancel a hold | Owner/Librarian/Admin |
| GET | `/api/holds/book/:bookId` | Get holds for a book | Authenticated |
| GET | `/api/holds/member/:memberId` | Get holds for a member | Authenticated |
| GET | `/api/holds` | Get all holds | Librarian/Admin |

### Fines (Module 8)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/fines/pay` | Pay a fine for a transaction | Member (own)/Librarian |
| POST | `/api/fines/waive` | Waive a fine | Librarian/Admin |
| GET | `/api/fines/member/:memberId` | Fine payment history for member | Authenticated |
| GET | `/api/fines` | All fine payments | Librarian/Admin |

### Notifications (Module 9)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/notifications/generate-overdue` | Generate overdue reminders | Librarian/Admin |
| GET | `/api/notifications/member/:memberId` | Member's notifications | Authenticated |
| PUT | `/api/notifications/:id/read` | Mark notification as read | Member (own) |
| PUT | `/api/notifications/read-all` | Mark all as read | Member (own) |

### Membership Plans (Module 7)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/memberships` | Get all plans | Public |
| GET | `/api/memberships/:id` | Get a plan | Public |
| POST | `/api/memberships` | Create a plan | Admin |
| PUT | `/api/memberships/:id` | Update a plan | Admin |
| DELETE | `/api/memberships/:id` | Delete a plan | Admin |

### Reports (Modules 10, 12)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/reports/overdue` | Overdue books report | Librarian/Admin |
| GET | `/api/admin/reports/most-borrowed` | Most borrowed books | Librarian/Admin |
| GET | `/api/admin/reports/inventory` | Inventory health report | Librarian/Admin |
| PUT | `/api/admin/reports/inventory/:id/copy-status` | Update lost/damaged copies | Librarian/Admin |

## 🗄️ Database Schema Summary

### Collections

**users**
```
{
  name: String,
  email: String (unique),
  passwordHash: String (bcrypt-hashed),
  role: enum[member, librarian, admin],
  memberType: enum[student, faculty],
  membershipId: String (unique, e.g. MEM-2026-0001),
  phone: String,
  isActive: Boolean
}
```

**books**
```
{
  title: String,
  author: String,
  isbn: String (unique),
  category: String,
  description: String,
  totalCopies: Number,
  availableCopies: Number,
  lostCopies: Number,
  damagedCopies: Number,
  isActive: Boolean
}
```

**transactions**
```
{
  bookId: ObjectId (ref: Book),
  memberId: ObjectId (ref: User),
  issuedBy: ObjectId (ref: User),
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  fine: Number,
  finePaid: Boolean,
  status: enum[issued, returned, overdue]
}
```

**holds**
```
{
  bookId: ObjectId (ref: Book),
  memberId: ObjectId (ref: User),
  requestedAt: Date,
  status: enum[pending, fulfilled, cancelled, expired],
  expiresAt: Date
}
```

**finePayments**
```
{
  transactionId: ObjectId (ref: Transaction),
  memberId: ObjectId (ref: User),
  amount: Number,
  paidAt: Date,
  status: enum[pending, paid, waived],
  collectedBy: ObjectId (ref: User)
}
```

**membershipplans**
```
{
  name: String,
  memberType: enum[student, faculty],
  maxBooksAllowed: Number,
  loanDurationDays: Number,
  finePerDay: Number,
  isActive: Boolean
}
```

**notifications**
```
{
  memberId: ObjectId (ref: User),
  transactionId: ObjectId (ref: Transaction),
  type: enum[overdue_reminder, due_soon, hold_available],
  message: String,
  sentAt: Date,
  isRead: Boolean
}
```

### ER / Collection Diagram

```
┌──────────────┐      1:N       ┌──────────────────┐
│    users     │◄──────────────│  transactions    │
│ (member/lib/ │   memberId     │  bookId ──────┐  │
│   admin)     │                └────────────────┘ │
└──────┬───────┘                                    │
       │ 1:N                                        │
       │         ┌──────────────┐          ┌───────▼───┐
       ├────────►│    holds     │          │   books   │
       │ memberId│  bookId      │──────────│ (catalog) │
       │         └──────────────┘          └───────────┘
       │
       │ 1:N      ┌───────────────┐
       └─────────►│ finePayments  │
         memberId │ transactionId │
                  └───────────────┘

Book ──1:N── Transaction ──N:1── Member
Book ──1:N── Hold        ──N:1── Member
Member ──1:N── FinePayment ──1:1── Transaction
Member ──1:N── Notification ──1:1── Transaction
```

### Design Decisions: Referencing vs. Embedding

- **Referencing (ObjectId):** `transactions.bookId`, `transactions.memberId`, `holds.bookId`, `finePayments.transactionId`. These follow the relationship pattern where a book/user is large, shared, and updated independently — storing a full copy would cause data duplication and inconsistency.
- **Denormalized snapshot fields:** `transactions.bookTitle`, `transactions.memberName` are denormalized copies. This is deliberate: transaction history is always read together with the book/member title/name, and titles rarely change. It avoids excessive `$lookup` joins (per the project guidance).
- **Embedding:** No collections embed sub-documents because all relationships are true one-to-many across separate collections with distinct lifecycles. Embedding member data into a transaction, for instance, would bloat transactions and make independent updates (like member type changes) inconsistent.

### Indexes

| Collection | Index | Reason |
|------------|-------|--------|
| users | `{ email: 1 }` (unique) | Login lookups & uniqueness |
| users | `{ membershipId: 1 }` (unique) | Membership ID lookups |
| books | `{ title: 1 }` | Status/filter queries & search |
| books | `{ author: 1, category: 1, isbn: 1 }` | Search & filtering |
| transactions | `{ bookId: 1 }` | Fetch-by-relation queries |
| transactions | `{ memberId: 1 }` | Member history |
| transactions | `{ status: 1, dueDate: 1 }` | Overdue queries & reports |
| holds | `{ bookId: 1 }` | Fetch-by-relation queries |
| finePayments | `{ transactionId: 1 }` | Fetch-by-relation queries |

## 🧪 Testing with Postman

A Postman collection is included in the repository as `Digital-Library.postman_collection.json`. Import it into Postman:

1. Open Postman → Import → Select the JSON file
2. Set up an environment variable `baseUrl` = `http://localhost:5000`
3. Login to get a token (automatically used for protected routes)

### Key scenarios to test

1. **Happy path:** Register → Login → Search books → Issue → Return → Calculate fine
2. **Validation failure:** Register with missing name → expect 400 with `VALIDATION_ERROR`
3. **Auth failure:** Call protected route without token → 401
4. **Authorization failure:** Member calls admin route → 403
5. **Business-rule conflict:** Issue a book with no available copies → 409
6. **Not-found:** Request a book with invalid ID → 404

## ⚠️ Known Limitations

- Third-party payment gateways are not integrated; fine payment is recorded conceptually (mocked).
- No email/SMS provider integration; notifications are stored in the database only.
- Single currency and single time zone (assumed).
- Frontend is optional (Postman-only demonstration is acceptable per scope).
- Social login (Google/Facebook) not implemented.

## 🎯 Evaluation Focus Areas Implemented

- **Business-rule logic** beyond plain CRUD:
  - Borrowing limits enforced per membership plan (Module 7)
  - Duplicate issue prevention (same book to same member)
  - No-copies-available rejection (Module 4)
  - Automatic fine computation with per-day rate (Module 5)
  - Status transitions: issued → returned / overdue (transactions), pending → fulfilled (holds)
- **Security:**
  - Passwords hashed with bcrypt (`passwordHash` field, excluded from responses)
  - JWT secrets and DB URIs loaded from `.env`, never hardcoded
  - All routes protected with JWT middleware + role checks
- **Validation:** express-validator before business logic
- **Error handling:** centralized error handler returning consistent JSON with error codes
- **Schema quality:** deliberate reference/embed decisions (documented above)
