# Breeze OS Data Layer Foundation

## Scope

Release `v0.9.0-beta.1` centralizes JSON persistence behind `JsonFileRepository<T>`.
Business modules no longer import `node:fs` or construct storage paths directly.

## Repository responsibilities

- resolves the persistent storage directory;
- creates missing storage files from a typed default value;
- normalizes malformed or incomplete JSON data;
- performs atomic writes through a temporary file and rename;
- serializes writes per file inside the Node.js process;
- exposes `read`, `write`, and atomic `update` operations.

## Storage location

By default, files remain under `<project>/storage`, preserving current behavior.
Set `BREEZE_STORAGE_DIR` to an absolute path to move runtime data outside the deployment directory.

Example:

```env
BREEZE_STORAGE_DIR=/var/lib/breeze-os
```

## Migrated stores

- reservation requests;
- reservation folders;
- rate rules;
- Booking Sync;
- CRM customer metadata.

## PostgreSQL migration path

The public service APIs remain unchanged. A later release can implement a PostgreSQL/Prisma repository while keeping the UI and business services stable.
