<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { apiRequest } from "../api/http";

const router = useRouter();
const games = ref([]);
const loadError = ref("");
const isLoading = ref(true);

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

async function loadGames() {
  loadError.value = "";
  isLoading.value = true;
  try {
    const payload = await apiRequest("/api/games");
    games.value = Array.isArray(payload) ? payload : [];
  } catch (error) {
    loadError.value = error?.message || "Failed to load games";
  } finally {
    isLoading.value = false;
  }
}

function openGameRow(gameId) {
  router.push({ name: "game-detail", params: { gameId: String(gameId) } });
}

onMounted(() => {
  loadGames();
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Games</h1>
      <p class="mt-1 text-sm text-slate-600">Select a game to view details and subscribers.</p>
    </div>

    <p v-if="loadError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {{ loadError }}
    </p>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Game ID</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
              <td colspan="4" class="px-4 py-10 text-center text-slate-500">Loading games…</td>
            </tr>
            <tr v-else-if="games.length === 0">
              <td colspan="4" class="px-4 py-10 text-center text-slate-500">No games found.</td>
            </tr>
            <tr
              v-for="game in games"
              :key="game.id"
              class="cursor-pointer transition hover:bg-sky-50/60"
              role="link"
              tabindex="0"
              @click="openGameRow(game.id)"
              @keydown.enter.prevent="openGameRow(game.id)"
            >
              <td class="px-4 py-3 font-semibold text-slate-900">
                {{ game.name }}
              </td>
              <td class="px-4 py-3 font-semibold text-slate-900">
                {{ game.game_id || "—" }}
              </td>
              <td class="max-w-md px-4 py-3 text-slate-600">
                <span class="line-clamp-2">{{ game.description || "—" }}</span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                {{ formatDateTime(game.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
