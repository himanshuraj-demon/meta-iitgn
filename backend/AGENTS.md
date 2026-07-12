# AGENTS.md

## Project Overview
This is only applicable to the backend part of the project. This is a guideline for an Express API that serves both a Next.js web application, Flutter mobile applications and others. It acts purely as a stateless data machine.

## Architectural Rules
- **Pure JSON:** Accept only JSON payloads and return only JSON responses. Never send HTML, redirects, or UI strings.
- **Statelessness:** Do not use server-side sessions (`express-session`). Every request must be stateless.
- **Authentication:** Use JWTs (JSON Web Tokens) passed via the `Authorization: Bearer <token>` header. Never rely on cookies, as the Flutter client does not support them natively.
- **Versioning:** Prefix all routes with `/api/v1/` (e.g., `/api/v1/products`).

## Standardized JSON Envelopes
All endpoint responses must strictly follow these formats. Do not deviate.

### Success Response (200, 201)
```json
{
  "success": true,
  "data": { ... }
}

```

### Error Response (400, 401, 404, 500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR_CODE",
    "message": "Human readable message here."
  }
}

```

## Data Types & Mobile Optimization

* **Dates:** Always return dates as ISO 8601 strings (e.g., `2026-07-13T03:25:00Z`).
* **Pagination:** Always implement query-based pagination (`?page=1&limit=20`) for list endpoints. Do not return massive unpaginated arrays.
