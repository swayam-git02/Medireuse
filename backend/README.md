# Medireuse Backend - SQLite Auth Flow

This backend uses SQLite through Node's built-in `node:sqlite` module.

Auth flow summary
- Register (`POST /api/auth/register`): creates a user, returns an access JWT in the response body, and sets a long-lived HttpOnly `refreshToken` cookie.
- Login (`POST /api/auth/login`): validates credentials, returns an access JWT, and sets the `refreshToken` cookie.
- Refresh (`POST /api/auth/refresh`): reads the `refreshToken` cookie (or `x-refresh-token` header or request body), rotates the refresh token, issues a new access JWT, and sets a new `refreshToken` cookie.
- Logout (`POST /api/auth/logout`): revokes the refresh token server-side and clears the cookie.

Cookies and security
- The refresh token is stored in an HttpOnly cookie named `refreshToken` with `SameSite=Strict` and `Secure` enabled in production.
- The access token is returned in the JSON response body (`token`) and should ideally be stored by the client in memory for use with the `Authorization: Bearer <token>` header.
- Refresh tokens are persisted in the SQLite `tokens` table with expiry and revocation flags to support token rotation and logout.

Environment variables
- `SQLITE_DB_PATH`: optional path for the SQLite database file. Default: `backend/data/medireuse.sqlite`.
- `JWT_SECRET`: secret for signing access tokens.
- `JWT_EXPIRE`: access token expiry (for example `15m` or `7d`).
- `REFRESH_EXPIRE_DAYS`: number of days before refresh tokens expire. Default: `30`.
- `FRONTEND_URL`: allowed frontend origin for CORS. Default: `http://localhost:5173`.

Useful commands
- `npm run test`: runs the backend test suite against an in-memory SQLite database.
- `npm run test-conn`: initializes the configured SQLite database and runs a simple health check query.

Notes
- SQLite support in Node `v24.12.0` is available out of the box but still marked experimental by Node, so you may see an experimental warning when running the server or tests.
- The API routes and response shapes were kept aligned with the existing frontend so the UI does not need a database-specific rewrite.
