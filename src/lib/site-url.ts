const productionSiteUrl = "https://www.breezevilla.ro";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return productionSiteUrl;
  }

  try {
    const url = new URL(configuredUrl);

    if (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    ) {
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // Fall back to the verified public domain below.
  }

  return productionSiteUrl;
}
