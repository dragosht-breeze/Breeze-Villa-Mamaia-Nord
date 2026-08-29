# Breeze OS v0.9.4-hotfix.4

## Chrome iOS hydration fix

- Localized the mismatch to `src/components/booking/VacationPlanner.tsx`.
- Added `suppressHydrationWarning` directly on the affected `<form>` because Chrome iOS injects the external `__gcruniqueid` attribute before React hydration.
- Added `autoComplete="off"` to reduce browser autofill mutations on the planning form.
- No visual or functional booking-flow changes.

The suppression is intentionally scoped to the single form element where the browser-added attribute appears.
