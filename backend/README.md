# Medireuse Backend — Auth Flow

This document describes the authentication flow and cookie requirements used by the backend.

Auth flow summary
- Register (`POST /api/auth/register`): creates a user, returns an access JWT in response body and sets a long-lived HttpOnly `refreshToken` cookie.
- Login (`POST /api/auth/login`): validates credentials, returns access JWT and sets `refreshToken` cookie.
- Refresh (`POST /api/auth/refresh`): reads the `refreshToken` cookie (or `x-refresh-token` header or body), validates and rotates the refresh token, issues a new access JWT and sets a new `refreshToken` cookie.
- Logout (`POST /api/auth/logout`): revokes the refresh token server-side and clears the cookie.

Cookies and security
- The refresh token is stored in an HttpOnly cookie named `refreshToken` with `SameSite=Strict` and `Secure` enabled in production.
- The access token is returned in the JSON response body (`token`) and should be stored by the client in memory (not localStorage) for use with the `Authorization: Bearer <token>` header.
- On the server we persist refresh tokens in the `Token` collection with expiry and `revoked` flags to allow token rotation and revocation.

Environment variables
- `MONGODB_URI` or `MONGO_URI`: MongoDB connection string (recommended: Atlas).
- `JWT_SECRET`: secret for signing access tokens.
- `JWT_EXPIRE`: access token expiry (e.g. `15m` or `7d`).
- `REFRESH_EXPIRE_DAYS`: number of days before refresh tokens expire (default 30).

Notes
- To protect against XSS/CSRF, we use HttpOnly cookies for refresh tokens and require the access token in `Authorization` headers for API calls.
- For deployments behind a proxy/load balancer, ensure `trust proxy` is configured and cookies transmitted over TLS.
