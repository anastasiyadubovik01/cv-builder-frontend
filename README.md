# CV Builder

Frontend for CV Builder, an application for managing employee profiles and creating CVs.

The application helps companies keep employee data consistent and lets employees build focused CVs from their profiles, skills, languages, and project experience.

## Features

- Authentication: sign in, sign up, email verification, password reset, and password change.
- Role-based access for administrators and employees.
- Employee management: profiles, departments, positions, avatars, skills, and languages.
- Administrative catalogs: departments, positions, projects, skills, and languages.
- Account settings and password management.
- CV management: create, edit, delete, and manage CV details.
- CV skills and projects.
- CV preview and PDF export.
- Search, sorting, pagination, loading states, error states, and retry actions.
- Light and dark themes.
- Interface translations for English, Russian, French, German, Italian, Polish, Portuguese, Spanish, and Ukrainian.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Apollo Client
- GraphQL
- Zod
- i18next
- Vitest
- React Testing Library
- Playwright

## Project Structure

```text
src/
  api/          GraphQL queries, mutations, and API types
  app/          Routes, pages, layouts, and server actions
  components/   Shared UI components, layout components, and common hooks
  features/     Business features: users, CVs, projects, skills, and more
  i18n/         Translation files
  lib/          Validation, authentication, error handling, and helpers
  providers/    Global providers such as Apollo and theme providers
```

## Prerequisites

- Node.js 20 or later
- pnpm 10.34.5
- A running CV Builder backend
- Docker Desktop, if the backend is started locally with Docker

Backend repository:

<https://github.com/innowise-frontend/cv-backend>

## Installation

```bash
git clone https://github.com/anastasiyadubovik01/cv-builder-frontend.git
cd cv-builder-frontend
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the backend GraphQL URL:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/api/graphql
```

## Development

Start the development server:

```bash
pnpm dev
```

Open <http://localhost:3000> in your browser.

## Production Build

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Environment Variables

| Variable                  | Required | Description                                                          |
| ------------------------- | -------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes      | URL of the backend GraphQL API.                                      |
| `BASE_URL`                | No       | Frontend URL for Playwright tests. Default: `http://localhost:3000`. |
| `E2E_ADMIN_FIRST_NAME`    | For E2E  | First name of the administrator test account.                        |
| `E2E_ADMIN_EMAIL`         | For E2E  | Email of the administrator test account.                             |
| `E2E_ADMIN_PASSWORD`      | For E2E  | Password of the administrator test account.                          |
| `E2E_EMPLOYEE_FIRST_NAME` | For E2E  | First name of the employee test account.                             |
| `E2E_EMPLOYEE_EMAIL`      | For E2E  | Email of the employee test account.                                  |
| `E2E_EMPLOYEE_PASSWORD`   | For E2E  | Password of the employee test account.                               |

Do not commit `.env` files or real credentials.

## Code Quality

Check formatting, linting, and TypeScript types:

```bash
pnpm check
```

Automatically fix formatting and lint issues:

```bash
pnpm check:fix
```

## Unit Tests

The project uses Vitest and React Testing Library.

Run tests in watch mode:

```bash
pnpm test
```

Run all unit tests once:

```bash
pnpm test:run
```

Generate a coverage report:

```bash
pnpm test:coverage
```

Unit tests are stored next to the source files:

```text
Component.tsx
Component.test.tsx

useFeature.ts
useFeature.test.ts
```

Unit tests cover:

- Validation schemas.
- Formatting and helper functions.
- Shared hooks for search, sorting, loading, and pagination.
- Feature hooks for creating, editing, and deleting data.
- UI components, forms, tables, loading states, and error states.
- Authentication and access-related logic.

### Current Unit Test Coverage

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 86.04%   |
| Branches   | 80.02%   |
| Functions  | 83.64%   |
| Lines      | 85.99%   |

Coverage excludes unit test files, E2E specifications, and E2E fixtures because they are not application source code executed by Vitest.

## E2E Tests

The project uses Playwright for end-to-end testing.

Install the required Playwright browser once:

```bash
pnpm exec playwright install chromium
```

Before running E2E tests:

1. Make sure the backend is running.
2. Fill in the E2E administrator and employee credentials in `.env`.
3. Make sure both accounts exist in the database.
4. Stop any frontend server running on `http://localhost:3000`.

Run E2E tests:

```bash
pnpm test:e2e
```

Run E2E tests with the Playwright interface:

```bash
pnpm test:e2e:ui
```

Playwright starts the frontend development server automatically for E2E tests.

### E2E Test Structure

Current E2E tests are located in:

```text
src/features/users/user-profile.spec.ts
```

| Test Case                        | User Role     | Expected Result                                                                                                        |
| -------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| View an employee profile         | Administrator | The administrator can find an employee, open the profile, and view profile fields.                                     |
| Update an employee name          | Administrator | The administrator can update a first name and see the updated value immediately. The test restores the original value. |
| Update an employee position      | Administrator | The administrator can choose another position and see the saved change. The test restores the original value.          |
| Protect another employee profile | Employee      | The employee can open another profile but cannot edit fields, update data, or create users.                            |

## PDF Export

The frontend sends the prepared CV preview to the backend for PDF generation.

For PDF export to work, the backend must be configured according to its README, including its PDF browser service settings.

## Main User Flow

1. An administrator manages employees and common catalogs.
2. An employee profile stores personal information, skills, languages, department, and position.
3. An employee creates one or more CVs.
4. A CV can contain selected skills and projects.
5. The employee opens the CV preview and exports it as a PDF file.
