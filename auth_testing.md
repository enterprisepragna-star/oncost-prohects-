# Auth Testing Playbook

## Test Credentials
- Admin Email: admin@oncost.shop
- Admin Password: oncost@2026
- Role: admin

## Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

## Verification
1. Login should set httpOnly cookies access_token + refresh_token
2. /me with cookies should return admin user
3. Bcrypt hash starts with $2b$
4. Index on users.email is unique
