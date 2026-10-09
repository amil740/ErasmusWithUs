# Render deployment

ErasmusWithUs deploys as two Render services:

- `erasmuswithus-api`: ASP.NET Core API built from `ErasmusWithUs.Api/Dockerfile`
- `erasmuswithus-frontend`: Vite static site built from `frontend`

## Steps

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render detects `render.yaml` and creates both services.
4. Set the secret environment values on the API service:
   - `Jwt__Key`: a long random production secret
   - `Email__SmtpHost`, `Email__Username`, `Email__Password`, `Email__From`
5. Update `VITE_API_BASE_URL` on the frontend service if the generated API URL differs from `https://erasmuswithus-api.onrender.com`.
6. Redeploy the frontend after changing that URL.
7. Check the API at `/api/health`, then open the frontend URL.

## Important for production

The current API uses SQLite. On Render's ephemeral filesystem, accounts and catalogue changes can be lost when the service restarts. Use a persistent Render disk mounted at `/var/data` or move the API to PostgreSQL before treating this as a production deployment. The SMTP values must be configured for real verification emails; without them, development mode logs the six-letter code instead.
