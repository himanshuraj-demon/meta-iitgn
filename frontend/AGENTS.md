# AGENTS.md

## Scope and Goal

These instructions apply only to the Next.js frontend. Build a fast, accessible,
responsive web client for the Meta IITGN wiki. Treat this document as target
architecture: improve existing code toward these rules when touching it, without
unrelated rewrites.

## Stack and Structure

- Use Next.js App Router, React, TypeScript, and Tailwind CSS.
- Keep route pages and layouts in `src/app`; put reusable UI in
  `src/components` (or the existing feature component location when it is more
  cohesive).
- Keep HTTP calls and API-specific types in `src/api`; do not scatter Axios or
  `fetch` calls through presentational components.
- Use `@/` imports where the project configuration supports them. Do not add a
  new state-management or UI-library dependency without a clear need.

## Rendering and Data Flow

- Prefer Server Components for static or server-fetched content. Add
  `"use client"` only for browser APIs, local interaction, hooks, or client
  side state.
- Keep pages thin: compose components and delegate data access to the API layer.
- Show deliberate loading, empty, and error states for asynchronous content.
- Read the backend's `{ success, data }` / `{ success, error }` envelope in the
  API layer, and expose typed, UI-ready data or errors to components.

## Authentication and API Calls

- Use the configured API base URL from environment variables; never hard-code
  deployment URLs or commit secrets.
- Send JWTs as `Authorization: Bearer <token>` when calling protected backend
  endpoints. Do not build new cookie-based authentication flows.
- Handle expired or invalid authentication predictably: clear invalid client
  auth state and route the user to sign in when appropriate.
- Do not rely on a client-side role check as authorization. It is only for UI
  affordances; the API remains authoritative.

## UI, Accessibility, and Quality

- Use semantic HTML first. Every interactive control needs a visible label or
  accessible name; support keyboard navigation and visible focus states.
- Make layouts work at narrow mobile widths as well as desktop widths; avoid
  fixed widths that cause horizontal scrolling.
- Reuse existing design tokens, utilities, and components before introducing
  one-off styling.
- Sanitize or safely render user-authored content. Do not inject untrusted HTML
  with `dangerouslySetInnerHTML`.
- Avoid `any`; define interfaces for API payloads, component props, and state.

## Verification

- Run `npm run lint` after frontend changes.
- Run `npm run build` for routing, rendering, dependency, or configuration
  changes only when practical.
