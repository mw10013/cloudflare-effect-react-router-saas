---
applyTo: "**/functions/shared/**/D1.ts"
---

# Cloudflare D1 Guidelines

- Utilize Cloudflare D1's read replicas to enhance read performance and availability.
- Implement session consistency (read-your-writes) by using D1 bookmarks.
- A write operation returns a bookmark. Subsequent read operations within the same logical session must use this bookmark.
- Store the D1 session bookmark in the user's `SessionData`.
- When performing database operations, retrieve the bookmark from `SessionData` to initialize a `D1DatabaseSession`.
- After database operations, especially writes, update `SessionData` with the `session.latestBookmark` for subsequent requests.
