<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const navigationLinks = [
  { to: { name: "dashboard" }, label: "Dashboard" },
  { to: { name: "games" }, label: "Games" },
  { to: { name: "admins" }, label: "Admin users" },
  { to: { name: "user-api" }, label: "Usermobile List" },
];

function handleLogout() {
  authStore.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="flex min-h-full">
    <aside
      class="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 md:flex"
    >
      <div class="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sm font-semibold text-sky-300"
        >
          DA
        </div>
        <div>
          <p class="text-sm font-semibold tracking-tight">Docking Admin</p>
          <p class="text-xs text-slate-400">Operations</p>
        </div>
      </div>
      <nav class="flex flex-1 flex-col gap-1 p-3">
        <RouterLink
          v-for="navigationItem in navigationLinks"
          :key="navigationItem.label"
          :to="navigationItem.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          active-class="bg-slate-800 text-white"
        >
          {{ navigationItem.label }}
        </RouterLink>
      </nav>
      <div class="border-t border-slate-800 p-4 text-xs text-slate-500">
        Signed in as
        <span class="font-medium text-slate-300">{{ authStore.adminUser?.username || "admin" }}</span>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-8"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sm font-semibold text-sky-700 md:hidden"
          >
            DA
          </div>
          <div class="min-w-0 md:hidden">
            <p class="truncate text-sm font-semibold text-slate-900">Docking Admin</p>
          </div>
        </div>

        <nav class="flex flex-1 items-center justify-center gap-1 overflow-x-auto md:hidden">
          <RouterLink
            v-for="navigationItem in navigationLinks"
            :key="`m-${navigationItem.label}`"
            :to="navigationItem.to"
            class="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            active-class="bg-slate-900 text-white hover:bg-slate-900"
          >
            {{ navigationItem.label }}
          </RouterLink>
        </nav>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          @click="handleLogout"
        >
          Logout
        </button>
      </header>

      <main class="flex-1 px-4 py-6 md:px-8 md:py-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
