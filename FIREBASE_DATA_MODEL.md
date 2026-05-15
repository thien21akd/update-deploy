# Firebase Data Model

## User data

- `users/{uid}/profile`
- `users/{uid}/trackedCourses/{courseId}`
- `users/{uid}/customCourses/{courseId}`
- `users/{uid}/courseProgress/{courseId}/{lessonIndex}`
- `users/{uid}/tasks/{taskId}`
- `users/{uid}/notes/{noteId}`
- `users/{uid}/schedule/{scheduleId}`
- `users/{uid}/problemStatuses/{problemId}`
- `users/{uid}/submissions/{submissionId}`
- `users/{uid}/stats`
- `users/{uid}/pomodoro/settings`
- `users/{uid}/pomodoro/stats`
- `users/{uid}/settings/notifications`

## Public data

- `leaderboard/{uid}`
- `userEmails/{encodedEmail}`: lightweight email-to-uid index used during registration checks.

## Seed data strategy

- Catalog seed remains in source code for now:
  - `src/data/courses.js`
  - `src/data/problems.js`
- User-specific data is empty for new accounts and created on demand.

## Auth and profile synchronization

- Firebase Authentication is the source of truth for identity.
- Realtime Database user profiles are recoverable application data. If a signed-in Auth user is missing `users/{uid}`, the app recreates the DB profile instead of deleting Auth.
- Account deletion must go through the centralized auth service. Manual deletion of `users/{uid}` does not release the email because Firebase Auth owns email uniqueness.
- Browser clients can only delete the currently signed-in Firebase Auth user. Production-grade two-way cleanup, including deleting DB-only records whose Auth user no longer exists, needs a trusted Firebase Admin SDK endpoint or Cloud Function that deletes Auth, `users/{uid}`, `leaderboard/{uid}`, and `userEmails/{encodedEmail}` in one controlled flow.
