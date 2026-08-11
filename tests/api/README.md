# Real API workflow tests

These tests call the running NestJS API directly. They do not use frontend mocks. The separate backend preparation script is the only component that updates account prerequisites in the dev database.

1. Ensure `TEST_ACCOUNT_EMAILS` in the backend environment contains the Landlord and Tenant test emails.
2. Prepare the existing test accounts from `backend` (no passwords are changed):

   `npm run test-accounts:prepare-api -- --confirm-dev-db --admin-email <admin> --landlord-email <landlord> --renter-email <tenant>`

3. Copy `.env.api.example` to `.env.api.local` and fill the three test accounts. This local file is Git-ignored.
4. Start the backend dev API (default: `http://localhost:1174`).
5. Run `npm run test:api`.

The full command typechecks first, signs in each account once in Playwright global setup, runs smoke as a dependency, and then runs the workflow project with one worker and no retries. `test:api:smoke` is read-only except for refresh-token rotation/logout. `test:api:flows` runs only the mutation flows but still performs the global authentication preflight.

The full workflow creates records prefixed with `API-E2E-*` and only cleans up records created by that run. PayOS endpoints are intentionally excluded.

Reports are written to `playwright-report/api` and `test-results/api/results.json`. Authorization credentials and tokens are not attached to reports. Upload tests are skipped unless `E2E_ENABLE_UPLOADS=true` is explicitly configured.
