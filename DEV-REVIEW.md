Đây là nội dung format lại, giữ nguyên 100% nội dung các prompt:

---

# DEV-REVIEW.md

## 1. Technology Stack

**Backend**

- Framework: NestJS v11
- Database: MongoDB (running on Docker)
- ODM: Mongoose via `@nestjs/mongoose`
- Authentication: JWT — Passport JWT Strategy
- Password Hashing: bcrypt (12 rounds)
- File Uploads & Parsing: Multer (Memory Storage) + `csv-parse`
- Data Validation: `class-validator` + `class-transformer`
- Environment Validation: Joi

**Frontend**

- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- State Management: Zustand (persisted to localStorage)
- Forms: React Hook Form + Zod
- HTTP Client: Axios (single instance with interceptors)

**Database Schema**

`users` — `_id`, `email`, `firstName`, `lastName`, `password` (select: false), `role`, `createdAt`, `updatedAt`

`products` — `_id`, `sku`, `name`, `price`, `stock`, `lastUpdatedBy` (ref: users), `createdAt`, `updatedAt`

---

## 2. AI Prompt History

### Prompt 1 — Project scaffold & module structure

```
this is the requirement of the small project we gotta do

"Option 1: Inventory Management Portal with CSV Import
ASSIGNMENT Position: Backend Developer (Intern)
Estimated time: 3-6 hours
Submission:
● Part 1: GitHub repository
● Part 2: Link demo video (Loom / Google Drive – share link)
● Part 3: AI Usage Review (Markdown file in repo)
PART 1: INVENTORY MANAGEMENT BACKEND SYSTEM
Tech Stack Requirements
● Backend Framework: Express.js OR NestJS (NestJS is preferred for structure and
scalability)
● Database: MongoDB (using Mongoose)
● Authentication: JWT-based
● File Uploads: Multer (or equivalent) for parsing CSV files
1.1 User Authentication & Registration
Build a secure user registration and login system. The system should support two types of
users: ADMIN and STAFF. It is up to you to determine what data needs to be collected during
registration, how to secure user credentials, and what validations should be in place for a
production-ready application.
1.2 Inventory CRUD & CSV Bulk Import
Build the core inventory management features. Products must track basic information such as
SKU, name, price, and current stock count, as well as an audit trail of which user last updated
the item.
Critical Thinking Requirements:
● Data Integrity: Consider what makes a valid product. Implement appropriate validations
and database constraints.
● CSV Upload Logic: The /upload endpoint must accept a CSV file to bulk import products.
You must decide how to handle existing products (e.g., duplicate SKUs), malformed files,
or incomplete data rows without crashing the server.
● Auditability: Ensure the system accurately tracks who last modified a product.
1.3 Demo Requirement (Choose One)
Provide one of the following:
1. Postman Collection (export .json) demonstrating the full auth, CRUD, and CSV upload
flow.
2. Simple UI (HTML/CSS/JS or React) demonstrating the flow - optional, bonus points."

Check if this analyzed modules are good to meet the needs

"AppModule — module gốc, chỉ làm nhiệm vụ wire các module lại với nhau cùng ConfigModule và MongooseModule global.
AuthModule — xử lý toàn bộ vòng đời authentication: controller (2 route), service (register/login/bcrypt), và JwtStrategy. Import JwtModule + PassportModule bên trong. Depend vào UsersModule.
UsersModule — tách riêng khỏi Auth vì UsersService được export và dùng bởi AuthModule. Schema User nằm ở đây. Không có controller — không có route /users public nào trong yêu cầu.
ProductsModule — module lớn nhất, chứa controller (6 route kể cả /upload), service (CRUD + CSV import), schema Product, và register MulterModule locally với memory storage.
Common không phải module — guards, filters, interceptors, decorators được đăng ký global trong main.ts, không cần tạo CommonModule riêng."

If they are, start to create dirs of placeholders (project structure). Then start writing codes with some notes: follow eslint code, typescript strict mode, follow strictly the project structure, using absolute imports (but using alias in typescript, so we can easily use it), don't use type 'any' at all. If you need to use any type, try to use 'unknown' type instead. If there's any wonder, just ask me directly before writing a single line of code.I will give you the proper business logic after this.

The tech we gotta use are NestJS, Mongoose, JWT, docker (mongodb).
```

### Prompt 2 — Auth, registration fields & production-ready validations

```
1. User Registration — Fields & Role Logic

The RegisterDto must collect exactly these fields:

- email (string, valid email format, lowercase, trimmed)
- password (string, min 8 chars, max 72 chars, must contain at least one uppercase
  letter and one number)
- firstName (string, min 2, max 50)
- lastName (string, min 2, max 50)

DO NOT include a `role` field in RegisterDto. The role must never be accepted from
the client. All newly registered users are hardcoded to Role.STAFF in the service layer.

ADMIN accounts are created exclusively via a database seed script
(src/database/seed.ts or similar). The seed must:

- Check if an ADMIN already exists before inserting (idempotent)
- Read ADMIN credentials (email, password) from environment variables
  SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD
- Hash the password with bcrypt (rounds: 12) before saving
- Be runnable with: npx ts-node src/database/seed.ts

2. Credential Security

Apply all of the following. If any already exist, verify they are correct:

- Passwords hashed with bcrypt, rounds: 12
- The `password` field on the User schema must have `select: false` — excluded
  from all queries by default
- Login must use `.select('+password')` explicitly when fetching user for comparison
- Login error message must always be the generic "Invalid credentials" regardless
  of whether the email does not exist or the password is wrong — no email enumeration
- JWT secret loaded from ConfigService using getOrThrow('JWT_SECRET'), never hardcoded
- JWT access token TTL: 15 minutes (configurable via JWT_EXPIRES_IN env var)

3. Production-Ready Validations

Global (main.ts)
Ensure ValidationPipe is registered globally with these exact options:
{
whitelist: true,
forbidNonWhitelisted: true,
transform: true,
transformOptions: { enableImplicitConversion: true }
}

Auth validations (RegisterDto / LoginDto)
- email: IsEmail, lowercase normalized, trimmed
- password: MinLength(8), MaxLength(72), must match /[A-Z]/ and /[0-9]/
- firstName / lastName: IsString, MinLength(2), MaxLength(50)

Product validations (CreateProductDto / UpdateProductDto)
- sku: Matches /^[A-Z0-9-]+$/, MaxLength(50), uppercase normalized
- name: IsString, MinLength(2), MaxLength(200)
- price: IsNumber, positive, max 2 decimal places
- stock: IsInt, Min(0)

ObjectId validation
Before every findById() or findByIdAndUpdate() call, validate the id with
Types.ObjectId.isValid(id) — throw BadRequestException('Invalid ID format') if invalid.
Never let Mongoose throw a CastError to the client.

Mongoose schema constraints
- All schemas must have strict: true (verify it is not accidentally disabled)
- All findByIdAndUpdate / findOneAndUpdate calls must include runValidators: true
- Duplicate key errors (MongoDB error code 11000) must be caught and rethrown
  as ConflictException with a human-readable message

Business rule
- lastUpdatedBy on Product must always be set from the authenticated user's JWT
  payload via the @CurrentUser() decorator. It must never be accepted from the
  request body. Verify this is enforced in every write operation (create, update,
  CSV upsert).

4. What NOT to change

- Do not add phone number or any other field to RegisterDto
- Do not add a role promotion endpoint unless it already exists
- Do not switch from memoryStorage for Multer
- Do not add refresh token logic
- Keep the existing module structure: AppModule, AuthModule, UsersModule,
  ProductsModule, and shared common utilities (guards, filters, interceptors,
  decorators) registered globally in main.ts without a CommonModule wrapper

5. After implementing, confirm the following checklist:

- [ ] RegisterDto has no role field
- [ ] All new users saved with Role.STAFF
- [ ] Seed script creates ADMIN from env vars, idempotent
- [ ] password field has select: false on User schema
- [ ] Login returns "Invalid credentials" for both failure cases
- [ ] ValidationPipe has whitelist: true + forbidNonWhitelisted: true globally
- [ ] Every findById call has ObjectId.isValid() guard before it
- [ ] Every update call has runValidators: true
- [ ] lastUpdatedBy is never read from request body
```

### Prompt 3 — Password constraint correction

```
- password (string, min 8 chars, max 72 chars — this is a hard bcrypt limit,
  bcrypt silently truncates input beyond 72 bytes which creates a silent security
  bug where changing characters after position 72 has no effect; MaxLength(72)
  prevents this by failing explicitly. Do NOT increase this limit. No complexity
  rules required — no uppercase or number constraints)
```

### Prompt 4 — Frontend scaffold & all pages

```
okay let's move to frontend.
You are building the Next.js frontend for an Inventory Management Portal.
The Next.js app is already set up. There are no pages yet.
Read the design file currently open in the editor carefully before writing
any code — all colors, typography, spacing, and component styles must follow
it exactly.

---

Tech stack (already installed, do not change)
- Next.js 14+ with App Router
- TypeScript (strict mode, no `any`)
- Tailwind CSS
- shadcn/ui for base components
- React Hook Form + Zod for all forms
- Axios for HTTP (create a single instance with interceptors)
- Zustand for auth state

---

Backend API
Base URL from env: NEXT_PUBLIC_API_URL
All responses follow this envelope:
Success: { success: true, data: T }
Error:   { success: false, statusCode: number, message: string }

Auth: Bearer token in Authorization header.
On 401 response → clear auth state → redirect to /login.

---

Pages to build

(auth) group — no sidebar
- /login
  - Fields: email, password
  - On success: save accessToken + user (email, role) to Zustand store
  - Redirect to /products after login
  - Show inline error message on failure

- /register
  - Fields: email, password (min 8, max 72), firstName, lastName
  - No role field — backend assigns STAFF automatically
  - On success: redirect to /login with success message

(dashboard) group — with sidebar + header
Protected by an AuthGuard client component that checks Zustand store.
If not authenticated → redirect to /login.

- /products
  - Table listing all products with columns:
    SKU, Name, Price, Stock, Last Updated By, Actions
  - Pagination controls (page, limit)
  - Search input (filters by name)
  - "Add Product" button — visible to ADMIN only
  - Edit / Delete actions — visible to ADMIN only
  - STAFF sees read-only table

- /products/upload
  - ADMIN only page — redirect STAFF to /products
  - Drag and drop CSV file input (accept .csv only)
  - Show file name and size after selection
  - Upload button triggers POST /products/upload
  - After upload, display result summary:
    Inserted / Updated / Skipped counts
    Collapsible error list showing row number, SKU, reason

- /products/new
  - ADMIN only
  - Form: SKU (uppercase enforced on input), Name, Price, Stock
  - Zod validation mirrors backend DTO exactly
  - On success: redirect to /products with success toast

- /products/[id]/edit
  - ADMIN only
  - Pre-filled form with existing product data
  - Same Zod schema as /products/new
  - On success: redirect to /products with success toast

---

Shared requirements

Axios instance (lib/api.ts)
- Inject Bearer token from Zustand store on every request
- On 401: call clearAuth() then redirect to /login
- Extract error message from response.data.message for display

Auth store (store/auth.store.ts)
- Persist to localStorage via zustand/middleware persist
- Fields: accessToken, user: { email, role }
- Methods: setAuth(token, user), clearAuth()

AuthGuard (components/AuthGuard.tsx)
- Client component
- Reads from Zustand store
- If no accessToken → router.replace('/login')
- Wrap all (dashboard) layout with this

Role-based UI
- Use a useAuth() hook that exposes isAdmin boolean
- ADMIN-only buttons/pages check isAdmin before rendering
- STAFF accessing /products/new, /products/upload,
  /products/[id]/edit → redirect to /products

Forms
- All forms use React Hook Form + zodResolver
- Show field-level error messages below each input
- Disable submit button while isSubmitting is true
- Show toast notification on success and on API error

TypeScript
- No `any` types anywhere
- Type all API responses explicitly
- Type all event handlers (e.g. React.ChangeEvent<HTMLInputElement>)

---

Folder structure to follow
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx
    products/
      page.tsx
      new/page.tsx
      upload/page.tsx
      [id]/edit/page.tsx
components/
  layout/
    Sidebar.tsx
    Header.tsx
  products/
    ProductTable.tsx
    ProductForm.tsx
    CsvUploader.tsx
  AuthGuard.tsx
lib/
  api.ts
hooks/
  useAuth.ts
store/
  auth.store.ts
types/
  index.ts

---

Important constraints
- Default all new users created via /register to STAFF role (no role field in form)
- Never store raw password anywhere on the client
- SKU input must auto-uppercase on change (toUpperCase() in onChange)
- CSV upload uses multipart/form-data with field name "file"
- All list pages must show a loading skeleton while fetching
- Empty states must show a helpful message (e.g. "No products found")
- Do not create a CommonModule or any extra NestJS module —
  this is a frontend task only
```

### Prompt 5 — UI/UX: modal interactions & sidebar cleanup

```
please apply the following changes to fix the information architecture
and improve the UX by introducing modal interactions:

Sidebar (Global Navigation):

Completely remove the 'Add Product' and 'Import CSV' items from the left menu.

Keep the 'Products' item as a primary navigation link.

Add 2-3 placeholder navigation links (e.g., 'Dashboard', 'Orders', 'Customers')
to make the sidebar structurally correct. These should strictly be page navigation
links.

Keep the 'WEALTH NOIR' branding and the user profile section exactly as they are.

Main Page Area & Modal Interactions:

Retain the 'IMPORT CSV' (outlined) and '+ ADD PRODUCT' (filled primary color)
buttons at the top right of the data table.

Crucial UX Update: Specify that clicking the '+ ADD PRODUCT' button, the
'IMPORT CSV' button, or the Edit (pencil) icon in the table rows must not
navigate the user to a new page.

Instead, these actions should trigger a Modal Popup that overlays the current
'PRODUCT INVENTORY' view.

Optional task: Please generate a mockup of the '+ ADD PRODUCT' modal state.
It should include basic input fields (SKU, Name, Price, Stock), overlaying a
dimmed background of the current data table.

Style & Theme:
Maintain the exact same style and theme.
```

### Prompt 6 — CSV bulk import hardening

```
The CSV bulk import feature is already partially implemented.
Review the existing code and ensure the following are correctly handled:

File validation (before parsing):
- Reject any file that is not .csv extension or text/csv / application/vnd.ms-excel
  / text/plain MIME type — check both, do not trust MIME type alone
- Enforce 5MB file size limit at Multer level (limits.fileSize) so the stream
  is cut before loading into memory, not after
- Use memoryStorage() — never write the uploaded file to disk

Parsing:
- Use csv-parse with options: { columns: true, bom: true, trim: true,
  skip_empty_lines: true, relax_quotes: true }
- Wrap the entire parse call in try/catch — if the file cannot be parsed at all,
  throw BadRequestException('CSV file is malformed and cannot be parsed')

Header validation (immediately after parsing, before any row loop):
- Required columns: sku, name, price, stock
- If any required column is missing, throw BadRequestException listing
  the missing column names
- Do this check before processing any rows — do not discover header
  issues mid-loop

Row count limit:
- If records.length exceeds 5000, throw BadRequestException with a clear
  message stating the limit
- Check this before the row loop

Per-row processing (loop):
- Row numbers in errors must be human-readable (row 1 = header,
  so data rows start at 2: rowNum = index + 2)
- Validate each row individually with a validateCsvRow() private method
  that checks:
  - sku: required, matches /^[A-Z0-9-]+$/i
  - name: required, minLength 2
  - price: required, must be a valid number, must be >= 0
  - stock: required, must be an integer >= 0
- If a row fails validation: push to errors[], increment skipped, continue
  — do NOT throw, do NOT stop the loop
- If a row passes validation: upsert using findOneAndUpdate with
  { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  matching on SKU (uppercase normalized)
- If the DB operation throws: catch it, push to errors[], increment skipped,
  continue — do NOT crash the batch
- Track inserted vs updated separately:
  - inserted: SKU did not exist before
  - updated: SKU already existed

Return shape (always 200, never 500 due to bad rows):
{
  inserted: number,
  updated: number,
  skipped: number,
  errors: Array<{ row: number, sku: string, reason: string }>
}

Security:
- lastUpdatedBy must always come from the JWT payload via @CurrentUser()
  decorator, never from the request body or the CSV file itself
```

### Prompt 7 — Bulk delete with select mode

```
Add bulk delete functionality to the existing ProductTable component.
This is a frontend-only task. Do not modify any backend code.

---

Backend endpoint to call
DELETE /products/bulk
Body: { ids: string[] }
This endpoint already exists. Call it with the selected product _id values.

Select mode behavior

Trigger
- Add a "Select" button in the table toolbar (top right, next to "Add Product")
- Visible to ADMIN only
- Clicking "Select" enters select mode — clicking again exits select mode and
  clears all selections

When select mode is OFF (default state)
- No checkboxes visible
- Each row shows Edit and Delete icons as normal

When select mode is ON
- A checkbox column appears as the first column of the table
- A "Select All" checkbox appears in the column header — checks/unchecks all
  rows on the current page
- Each row shows a checkbox

Row action logic based on selection count
- 0 rows selected: no action buttons shown, "Delete Selected" button not visible
- Exactly 1 row selected: show both Edit and Delete icons on that row,
  show "Delete Selected" button in toolbar
- 2 or more rows selected: hide Edit and Delete icons on all rows,
  show only "Delete Selected" button in toolbar with count label
  e.g. "Delete Selected (5)"

---

Delete Selected button
- Appears in toolbar when at least 1 row is checked
- On click: show a confirm dialog before proceeding
  Text: "Are you sure you want to delete {n} product(s)? This action cannot be undone."
  Two buttons: Cancel and Confirm Delete (destructive red)
- On confirm:
  - Call DELETE /products/bulk with body { ids: selectedIds }
  - Show loading state on the button while request is in flight
  - On success: show success toast, exit select mode, clear selections,
    refresh product list
  - On error: show error toast with message from API, do not exit select mode
    so user can retry

---

State to manage (inside ProductTable or a custom hook useProductSelection)
- isSelectMode: boolean
- selectedIds: Set<string>
- Toggle selectedIds when a row checkbox changes
- Clear selectedIds and exit select mode after successful delete
- Clear selectedIds when page or search changes (stale selections)

---

TypeScript requirements
- No `any` types
- selectedIds must be typed as Set<string>
- The bulk delete API call must be typed explicitly
- Checkbox onChange must be typed as React.ChangeEvent<HTMLInputElement>

Constraints
- Only ADMIN sees the Select button, checkboxes, and Delete Selected button
- STAFF sees the table in read-only mode — no changes to their view
- Do not break existing single-row Edit and Delete functionality
- Do not modify any backend files
- Preserve existing pagination, search, and loading skeleton behavior
```

---

## 3. What the AI Got Wrong

### Issue 1 — Role accepted from client on registration

The initial generated `RegisterDto` included a `role` field, meaning any user could
self-assign the `ADMIN` role at registration. This is a fundamental authorization flaw.

**Fix applied:** Removed the `role` field from `RegisterDto` entirely. The service layer
now hardcodes `Role.STAFF` on every new registration. ADMIN accounts are provisioned
exclusively through a seed script that reads credentials from environment variables and
checks for existing ADMIN before inserting (idempotent).

## 4. Human Interventions

### Intervention 1 — Eliminated `any` types throughout the codebase

The AI generated several instances of implicit and explicit `any` usage, particularly
in CSV row processing, Axios response handlers, and Mongoose error catch blocks.

Examples found and corrected:

```ts
// AI generated
const row: any = records[i];
const err: any = error;
const response: any = axiosError.response?.data;

// Corrected
const row: Record<string, string> = records[i];
const err = error as MongoServerError;
const response = axiosError.response?.data as ApiErrorResponse;
```

In all cases where the type was genuinely unknown at runtime, the type was narrowed
using `unknown` with explicit type guards or `instanceof` checks rather than casting
to `any`. This was enforced globally across both backend and frontend code.
