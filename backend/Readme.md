# Wiki Backend (Express & Prisma)

Minimal guide for local development and Render deployment.

---

## 1. Local Setup

### Prerequisites
- Node.js (v18+)

### Steps
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the root of the backend folder:
   ```env
   # Runtime connection (transaction pooler) — safe for the app server
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   PORT=3001

   # Direct connection (port 5432) for DDL operations (prisma db push / migrate)
   DATABASE_URL_DDL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```
   > **Why two URLs?** Supabase's `:6543` connection pooler runs in transaction mode and rejects DDL statements (`CREATE TABLE`, etc.). `prisma db push` / `migrate` must connect directly on `:5432`, so use `DATABASE_URL_DDL` for those commands.

3. **Synchronize database & generate Prisma client:**
   ```bash
   # DDL requires the direct connection (port 5432)
   DATABASE_URL=$DATABASE_URL_DDL npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend will be live at `http://localhost:3001`.

---

## 2. Render Deployment Setup

Deploy the backend as a **Web Service** on Render:

### Environment Variables
Configure the following in the Render Dashboard under **Environment**:
- `DATABASE_URL`: Your Supabase connection string (use the connection-pooled URL ending in `?pgbouncer=true` if using serverless or connection-heavy environments).
- `NODE_ENV`: `production`

### Build Settings
- **Root Directory**: `backend` (if deploying from a monorepo root)
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```
