# v0.9.0-beta.1 — Data Layer Foundation

## Added

- Generic typed `JsonFileRepository<T>`.
- Atomic temporary-file writes.
- Per-file in-process write serialization.
- Optional `BREEZE_STORAGE_DIR` configuration.
- Data-layer architecture documentation and environment example.

## Migrated

- Booking Sync store.
- Rate Rules store.
- Reservation Center folder store.
- Reservation Requests store.
- CRM metadata store.

## Compatibility

- Existing JSON file names and shapes are preserved.
- Existing service and API function signatures remain unchanged.
- No manual data migration is required for this release.
