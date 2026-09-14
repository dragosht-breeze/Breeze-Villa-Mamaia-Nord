"use client";

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new Event("breeze-villa-open-cookie-preferences")
        )
      }
      className="transition hover:text-white"
    >
      Preferințe cookie
    </button>
  );
}
