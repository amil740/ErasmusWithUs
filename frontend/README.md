# ErasmusWithUs frontend

React, TypeScript, and Vite client for discovering exchange opportunities, researching universities, matching with other Erasmus students, comparing destinations, and planning an application.

The student community matches verified students by destination university and intake. Profiles stay private until the student enables community visibility in **My account**. The account also stores the student's home university, study profile, exchange intake, introduction, and an optional compressed profile photo.

## Run locally

From this directory:

```sh
npm ci
npm run dev
```

Run the API from the repository root in a second terminal:

```sh
dotnet run --project ErasmusWithUs.Api
```

The frontend uses `http://localhost:5238` by default. Set `VITE_API_BASE_URL` in a `.env` file when the API runs elsewhere.

## Checks

```sh
npm run build
npm run lint
```

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for production deployment and required environment settings.
