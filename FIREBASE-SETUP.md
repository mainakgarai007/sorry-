# sorry- Firebase setup (safe, no-login plan)

This repository is separate from `Love-me`. Do not edit the `Love-me` repository or replace the existing Firestore rules blindly.

## Current status

- The site uses the Firebase web client config for project `all-in-a5f3b`.
- `firebase.js` writes visitor activity to `sorryEvents` and messages to `sorryMessages`.
- The rules supplied for the existing project do not grant access to either collection. They will therefore reject these writes.
- `expiresAt` is only a timestamp field. It does not automatically delete records.
- No unauthenticated dashboard should be granted public read access to visitor messages or private analytics.

## Important no-login limitation

A browser-only site cannot safely authenticate the creator just by keeping a secret in JavaScript or localStorage. Anyone can inspect the published files and copy that secret. If the creator must not log in, the safe options are:

1. Keep creator settings and the dashboard local to the creator's browser/device. This does not sync settings or cloud analytics to other devices.
2. Use a trusted server/backend that protects creator access with a separate secure mechanism.
3. Use Firebase Authentication for a protected cloud dashboard.

Visitor submissions can be enabled without granting public read access, but that alone does not provide a secure way for the creator to read cloud messages without authentication or a trusted backend.

## Before changing Firestore rules

1. Open Firebase Console for `all-in-a5f3b` and copy/export the currently deployed rules.
2. Preserve every existing match block used by `Love-me`.
3. Add narrowly scoped rules for the `sorry-` collections only; never add a broad public read/write rule.
4. Test in the Firestore Rules Playground or Emulator before publishing.
5. Verify `Love-me` reads and writes still work after any rules deployment.

## Data retention

The site currently attaches an `expiresAt` field 30 days after the event/message is created. This is metadata only. Since the owner intends to delete records manually, delete old documents in the Firebase Console as needed. Do not describe these records as automatically expiring.
