<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiRequest } from "../api/http";
import AddGameModal from "../components/AddGameModal.vue";

const games = ref([]);
const recentSubscribers = ref([]);
const loadError = ref("");
const isLoading = ref(true);
const isAddGameModalOpen = ref(false);

function formatDateTime(isoString) {
  if (!isoString) {
    return "—";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function loadDashboardData() {
  loadError.value = "";
  isLoading.value = true;
  try {
    const [gamesPayload, recentPayload] = await Promise.all([
      apiRequest("/api/games"),
      apiRequest("/api/subscribers/recent"),
    ]);
    games.value = Array.isArray(gamesPayload) ? gamesPayload : [];
    recentSubscribers.value = Array.isArray(recentPayload) ? recentPayload : [];
  } catch (error) {
    loadError.value = error?.message || "Failed to load dashboard";
  } finally {
    isLoading.value = false;
  }
}

function handleGameCreated() {
  loadDashboardData();
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="space-y-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-600">Overview of games and the latest subscriber activity.</p>
      </div>
      <div class="flex shrink-0 justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
          @click="isAddGameModalOpen = true"
        >
          Add game
        </button>
      </div>
    </div>

    <p v-if="loadError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {{ loadError }}
    </p>

    <section>
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Games</h2>
        <RouterLink
          :to="{ name: 'games' }"
          class="text-sm font-semibold text-sky-700 hover:text-sky-600"
        >
          View all
        </RouterLink>
      </div>

      <div
        v-if="isLoading"
        class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
      >
        Loading games…
      </div>
      <div
        v-else-if="games.length === 0"
        class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
      >
        No games yet. Use <span class="font-semibold text-slate-700">Add game</span> to create one.
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="game in games"
          :key="game.id"
          :to="{ name: 'game-detail', params: { gameId: String(game.id) } }"
          class="group flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
        >
          <div class="relative h-28 w-28 shrink-0 bg-slate-100">
            <img
              v-if="game.image_url"
              :src="game.image_url"
              :alt="game.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400"
            >
              No image
            </div>
          </div>
          <div class="flex min-w-0 flex-1 flex-col p-4">
            <p class="truncate text-sm font-semibold text-slate-900 group-hover:text-sky-800">
              {{ game.name }}
            </p>
            <p class="mt-1 line-clamp-2 text-xs text-slate-600">
              {{ game.description || "No description" }}
            </p>
            <p class="mt-auto pt-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Added {{ formatDateTime(game.created_at) }}
            </p>
          </div>
        </RouterLink>
      </div>
    </section>

    <section>
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Recent subscribers (latest 10)
      </h2>
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Phone</th>
                <th class="px-4 py-3">Game</th>
                <th class="px-4 py-3">Subscribed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="isLoading">
                <td colspan="3" class="px-4 py-8 text-center text-slate-500">Loading…</td>
              </tr>
              <tr v-else-if="recentSubscribers.length === 0">
                <td colspan="3" class="px-4 py-8 text-center text-slate-500">
                  No subscribers yet.
                </td>
              </tr>
              <tr v-for="subscriber in recentSubscribers" :key="subscriber.id" class="hover:bg-slate-50/80">
                <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {{ subscriber.phone_number }}
                </td>
                <td class="px-4 py-3 text-slate-700">
                  <RouterLink
                    v-if="subscriber.game?.id"
                    :to="{ name: 'game-detail', params: { gameId: String(subscriber.game.id) } }"
                    class="font-medium text-sky-700 hover:text-sky-600"
                  >
                    {{ subscriber.game.name }}
                  </RouterLink>
                  <span v-else>—</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                  {{ formatDateTime(subscriber.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <AddGameModal
      :open="isAddGameModalOpen"
      @close="isAddGameModalOpen = false"
      @created="handleGameCreated"
    />
  </div>
</template>
