async function buildAuthorizationHeader() {
  const { useAuthStore } = await import("../stores/auth.js");
  const authStore = useAuthStore();
  if (!authStore.token) {
    return {};
  }
  return { Authorization: `Bearer ${authStore.token}` };
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl === undefined || configuredBaseUrl === null) {
    return "";
  }
  return String(configuredBaseUrl).replace(/\/$/, "");
}

export async function apiRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const requestHeaders = new Headers(options.headers || {});
  if (!requestHeaders.has("Content-Type") && options.body && typeof options.body === "string") {
    requestHeaders.set("Content-Type", "application/json");
  }

  const authorizationHeader = await buildAuthorizationHeader();
  Object.entries(authorizationHeader).forEach(([headerName, headerValue]) => {
    requestHeaders.set(headerName, headerValue);
  });

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const responseBody = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    if (response.status === 401 && !normalizedPath.startsWith("/api/auth/login")) {
      const { useAuthStore } = await import("../stores/auth.js");
      useAuthStore().logout();
      if (typeof window !== "undefined") {
        const basePath = import.meta.env.BASE_URL || "/";
        const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
        window.location.assign(`${normalizedBasePath}login`);
      }
    }
    const errorMessage =
      responseBody && typeof responseBody === "object" && responseBody.message
        ? responseBody.message
        : `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return responseBody;
}
