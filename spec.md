# GenZesports Tournament

## Current State
Full-stack tournament management app for Free Fire and PUBG Mobile. Has:
- Backend with authorization (access-control.mo), blob storage, tournament CRUD, registration approval
- Admin panel protected by AdminGuard component
- `isCallerAdmin()` backend query used to check admin status in frontend

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: `getUserRole()` currently traps ("User is not registered") for principals not in the roles map. Change it to return `#guest` for unregistered users instead of trapping. This fixes `isCallerAdmin()` which crashes for any user who hasn't initialized their account, blocking admin panel access entirely.

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with `getUserRole` returning `#guest` (not trapping) for unregistered/unknown principals
2. All other backend logic (tournaments, registrations, authorization endpoints) remains identical
