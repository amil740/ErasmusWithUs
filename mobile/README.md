# Erasmus With Us mobile app

Expo app for ErasmusWithUs. It uses the existing ASP.NET API for university opportunities, student plans, profiles and student-to-student chat.

## Start

```sh
npm install
npm run start
```

Open the QR code with Expo Go, or run `npm run ios` / `npm run android` with a simulator configured.

The app uses the deployed API at `https://erasmuswithus-api.onrender.com` by default. For a local API, copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_BASE_URL` to an address reachable from your device. For an Android emulator, use `http://10.0.2.2:5238`; for iOS Simulator, `http://localhost:5238` works while the API runs on the same computer.

## Included

- Email registration, verification, sign-in and secure token storage
- Opportunity search, university detail, grant and cost estimates, application documents and source links
- Exchange plans for a university and intake term
- Student directory for people sharing that exchange plan
- One-to-one chat with unread counts, blocking, reporting and messages refreshed while the conversation is open
- Deadline email reminders attached to each destination
- Student stories and ratings, with alumni status clearly marked as self-reported
- A monthly budget planner for comparing listed costs and grants
- Published field, degree-level, GPA and deadline checks in the match results
- Editable account profile, community visibility and compressed JPEG profile photo upload

Chat refreshes an open conversation every six seconds. The API does not currently expose a realtime socket or mobile push notification endpoint; email deadline reminders use the server's configured SMTP provider.
