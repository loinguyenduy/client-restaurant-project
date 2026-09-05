const isProduction = process.env.NODE_ENV === "production";

const parseHttpUrl = (rawValue, label, { requireApiPath = false, requireOriginOnly = false } = {}) => {
  let parsed;
  try {
    parsed = new URL(rawValue);
  } catch (error) {
    throw new Error(`${label} must be a valid absolute HTTP(S) URL.`);
  }

  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${label} must be an HTTP(S) URL without credentials, query, or hash.`);
  }
  if (isProduction && parsed.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS in production.`);
  }

  const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
  if (requireOriginOnly && normalizedPath !== "/") {
    throw new Error(`${label} must contain only the backend origin.`);
  }
  if (requireApiPath) {
    const apiPathMatches = normalizedPath.match(/\/api\/v1/g) || [];
    if (normalizedPath !== "/api/v1" || apiPathMatches.length !== 1) {
      throw new Error(`${label} must end with exactly one /api/v1 path.`);
    }
  }

  return normalizedPath === "/" ? parsed.origin : `${parsed.origin}${normalizedPath}`;
};

const configuredApiUrl = process.env.REACT_APP_API_URL?.trim();
if (isProduction && !configuredApiUrl) {
  throw new Error("REACT_APP_API_URL is required in production.");
}

const developmentApiUrl = `${window.location.protocol}//${window.location.hostname}:8080/api/v1`;
const apiBaseUrl = parseHttpUrl(
  configuredApiUrl || developmentApiUrl,
  "REACT_APP_API_URL",
  { requireApiPath: true },
);

const configuredSocketUrl = process.env.REACT_APP_SOCKET_URL?.trim();
const socketUrl = configuredSocketUrl
  ? parseHttpUrl(configuredSocketUrl, "REACT_APP_SOCKET_URL", { requireOriginOnly: true })
  : apiBaseUrl.replace(/\/api\/v1$/, "");

export { apiBaseUrl, socketUrl };
