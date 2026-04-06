<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

async function handleSubmit() {
  errorMessage.value = "";
  isSubmitting.value = true;
  try {
    await authStore.loginWithCredentials(username.value.trim(), password.value);
    const redirectTarget = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await router.replace(redirectTarget || "/");
  } catch (error) {
    errorMessage.value = error?.message || "Login failed";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center bg-slate-950 px-4 py-12">
    <div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-sky-900/20">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-lg font-bold text-sky-300"
        >
          DA
        </div>
        <h1 class="text-xl font-semibold text-white">Sign in</h1>
        <p class="mt-1 text-sm text-slate-400">Use your admin credentials</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Username
          </label>
          <input
            id="username"
            v-model="username"
            name="username"
            autocomplete="username"
            required
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-sky-500/40 placeholder:text-slate-600 focus:border-sky-500 focus:ring-2"
            placeholder="admin"
          />
        </div>
        <div>
          <label for="password" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-sky-500/40 placeholder:text-slate-600 focus:border-sky-500 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        <p v-if="errorMessage" class="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Signing in…" : "Sign in" }}
        </button>
      </form>
    </div>
  </div>
</template>
