# README.md

## 1. Technology Stack

**Backend**
- **Framework**: NestJS v11
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (Passport Strategy) + bcrypt (12 rounds)
- **Validation**: `class-validator` + `class-transformer` + `Joi` (env validation)
- **File Upload**: Multer (Memory Storage) + `csv-parse`

**Frontend**
- **Framework**: Next.js 14+ (App Router, React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: Zustand (Persisted in localStorage)
- **Forms**: React Hook Form + Zod

---

## 2. Environment Configuration

### Backend
Create a `backend/.env` file (needed only for manual local setup, Docker Compose handles this via environment variables):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/inventory
JWT_SECRET=minimum_32_character_secret_here_change_in_prod
JWT_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@inventory.com
SEED_ADMIN_PASSWORD=Password123
```

### Frontend
Create a `frontend/.env.local` file (needed only for manual local setup):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 3. Quick Start with Docker Compose (Recommended)

Run the entire application stack (Frontend, Backend, and MongoDB) with a single command. The backend container will automatically run the database seeding script before starting.

1. **Start the application stack**:
   ```bash
   docker compose up --build
   ```
2. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api/v1
3. **Log in with the default seeded Admin account**:
   - **Email**: `admin@inventory.com`
   - **Password**: `Password123`

---

## 4. Manual Setup Guide (Alternative)

### Step 1: Spin up MongoDB Container
```bash
docker run -d --name inventory-mongo -p 27017:27017 mongo:latest
```

### Step 2: Initialize Backend & Seed Admin
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database seeding script:
   ```bash
   npx ts-node src/database/seed.ts
   ```
4. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```

### Step 3: Initialize Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend in development mode:
   ```bash
   npm run dev
   ```

---

## 5. Main Features & Usage Guide

### 1. User Roles
*   **ADMIN**: Full privileges (View, Create, Update, Delete products, Import CSV, Bulk Delete).
*   **STAFF**: Read-only access to the products list. Action buttons are hidden.

### 2. Authentication
*   **Registration (`/register`)**: Self-register a new user. The system automatically assigns the STAFF role.
*   **Login (`/login`)**: Log in using your registered STAFF credentials or the seeded ADMIN credentials (`admin@inventory.com` / `Password123`).

### 3. Inventory CRUD
*   **Add Product**: Click the `+ ADD PRODUCT` button in the top right to open the creation modal.
*   **Edit Product**: Click the pencil icon in the Action column of a product row to open the editing modal.
*   **Delete Product**: Click the trash icon in the Action column of a product row.
    *(These actions are restricted to ADMIN users only)*

### 4. CSV Bulk Import
*   Click the `IMPORT CSV` button to open the upload modal.
*   Drag and drop or select a `.csv` file (File size limit: `< 5MB`, max rows: `5000`).
*   **Required CSV Format**: The file must contain headers: `sku`, `name`, `price`, `stock`.
*   The upload result shows a summary of successfully inserted rows, updated rows (matching SKU automatically triggers an update), skipped rows, and a collapsible list of validation errors with specific row numbers.

### 5. Bulk Delete (Select Mode)
*   ADMINs can click the `Select` button in the toolbar to toggle select mode.
*   Check individual checkboxes or the "Select All" checkbox in the table header to select products on the current page.
*   Click the `Delete Selected` button and confirm the action in the confirmation dialog to delete multiple products simultaneously.

---

## 6. CI/CD Pipeline

The project is configured with a automated CI/CD pipeline using **GitHub Actions** (`.github/workflows/ci.yml`).

On every `push` or `pull_request` to `main`/`master`/`dev` branches, the pipeline will:
1.  **Backend CI**: Install dependencies, run ESLint, and build the NestJS project.
2.  **Frontend CI**: Install dependencies, run ESLint, and build the Next.js project.
3.  **Docker Compose Build Verification**: Verify that the entire stack builds successfully via `docker compose build`.

