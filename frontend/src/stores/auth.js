import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiRequest } from "../api/http";

const localStorageTokenKey = "docking_admin_token";
const localStorageAdminKey = "docking_admin_user";

function readJsonFromLocalStorage(key) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return null;
    }
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem(localStorageTokenKey) || "");
  const adminUser = ref(readJsonFromLocalStorage(localStorageAdminKey));

  const isAuthenticated = computed(() => Boolean(token.value));

  function persistSession(nextToken, nextAdminUser) {
    token.value = nextToken;
    adminUser.value = nextAdminUser;
    if (nextToken) {
      localStorage.setItem(localStorageTokenKey, nextToken);
    } else {
      localStorage.removeItem(localStorageTokenKey);
    }
    if (nextAdminUser) {
      localStorage.setItem(localStorageAdminKey, JSON.stringify(nextAdminUser));
    } else {
      localStorage.removeItem(localStorageAdminKey);
    }
  }

  async function loginWithCredentials(username, password) {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    // #region agent log
    fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
      body: JSON.stringify({
        sessionId: "a3da39",
        hypothesisId: "E",
        location: "auth.js:loginWithCredentials:afterRequest",
        message: "login payload shape",
        data: {
          payloadType: typeof payload,
          hasToken: Boolean(payload?.token),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!payload?.token) {
      throw new Error("Login response missing token");
    }
    persistSession(payload.token, payload.admin || null);
    return payload;
  }

  function logout() {
    persistSession("", null);
  }

  return {
    token,
    adminUser,
    isAuthenticated,
    loginWithCredentials,
    logout,
  };
});
