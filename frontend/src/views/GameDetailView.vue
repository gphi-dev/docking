<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { apiRequest } from "../api/http";

const SUBSCRIBER_PAGE_SIZE = 20;

const props = defineProps({
  gameId: {
    type: String,
    required: true,
  },
});

const game = ref(null);
const subscribers = ref([]);
const usermobiles = ref([]);
const currentPage = ref(1);
const subscribersTotal = ref(0);
const subscribersTotalPages = ref(1);
const loadError = ref("");
const usermobilesLoadError = ref("");
const isLoading = ref(true);
const isSubscribersLoading = ref(false);
const isUsermobilesLoading = ref(false);

const numericGameId = computed(() => Number(props.gameId));

const subscriberRangeLabel = computed(() => {
  if (subscribersTotal.value === 0) {
    return "0 subscribers";
  }
  const startIndex = (currentPage.value - 1) * SUBSCRIBER_PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage.value * SUBSCRIBER_PAGE_SIZE, subscribersTotal.value);
  return `Showing ${startIndex}–${endIndex} of ${subscribersTotal.value}`;
});

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

async function loadGame() {
  const gamePayload = await apiRequest(`/api/games/${numericGameId.value}`);
  game.value = gamePayload;
}

async function loadSubscribers() {
  isSubscribersLoading.value = true;
  try {
    const queryParameters = new URLSearchParams({
      page: String(currentPage.value),
      pageSize: String(SUBSCRIBER_PAGE_SIZE),
    });
    const subscribersPayload = await apiRequest(
      `/api/subscribers/games/${numericGameId.value}?${queryParameters.toString()}`,
    );
    subscribers.value = Array.isArray(subscribersPayload.items) ? subscribersPayload.items : [];
    subscribersTotal.value =
      typeof subscribersPayload.total === "number" ? subscribersPayload.total : 0;
    subscribersTotalPages.value =
      typeof subscribersPayload.totalPages === "number" ? subscribersPayload.totalPages : 1;
    if (typeof subscribersPayload.page === "number") {
      currentPage.value = subscribersPayload.page;
    }
  } finally {
    isSubscribersLoading.value = false;
  }
}

async function loadUsermobiles() {
  usermobilesLoadError.value = "";
  isUsermobilesLoading.value = true;
  try {
    // const usermobilesPayload = await apiRequest(`/api/usermobile/games/${numericGameId.value}`);
    const usermobilesPayload = await apiRequest(`/api/usermobile/games/${game.value.game_id}`);
    usermobiles.value = Array.isArray(usermobilesPayload) ? usermobilesPayload : [];
  } catch (error) {
    usermobiles.value = [];
    usermobilesLoadError.value = error?.message || "Failed to load verified mobile users";
  } finally {
    isUsermobilesLoading.value = false;
  }
}

async function loadInitial() {
  loadError.value = "";
  usermobilesLoadError.value = "";
  isLoading.value = true;
  game.value = null;
  subscribers.value = [];
  usermobiles.value = [];
  subscribersTotal.value = 0;
  subscribersTotalPages.value = 1;

  if (!Number.isFinite(numericGameId.value)) {
    loadError.value = "Invalid game id";
    isLoading.value = false;
    return;
  }

  try {
    await loadGame();
    await Promise.all([loadSubscribers(), loadUsermobiles()]);
  } catch (error) {
    loadError.value = error?.message || "Failed to load game";
    game.value = null;
    subscribers.value = [];
    usermobiles.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function goToPage(nextPage) {
  if (nextPage < 1 || nextPage > subscribersTotalPages.value) {
    return;
  }
  currentPage.value = nextPage;
  try {
    await loadSubscribers();
  } catch (error) {
    loadError.value = error?.message || "Failed to load subscribers";
  }
}

onMounted(() => {
  loadInitial();
});

watch(
  () => props.gameId,
  () => {
    currentPage.value = 1;
    loadInitial();
  },
);
</script>

<template>
  <div class="space-y-8">
    <div>
      <RouterLink
        :to="{ name: 'games' }"
        class="text-sm font-semibold text-sky-700 hover:text-sky-600"
      >
        ← Back to games
      </RouterLink>
    </div>

    <p v-if="loadError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {{ loadError }}
    </p>

    <div v-else-if="isLoading" class="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      Loading game…
    </div>

    <template v-else-if="game">

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="grid gap-6 p-6 md:grid-cols-[minmax(0,220px)_1fr] md:items-start">
          <div class="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            <img
              v-if="game.image_url"
              :src="game.image_url"
              :alt="game.name"
              class="h-full w-full max-h-56 object-cover"
            />
            <div
              v-else
              class="flex h-56 items-center justify-center text-sm font-medium text-slate-400"
            >
              No image
            </div>
          </div>
          <div class="min-w-0 space-y-2">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
              {{ game.name }}
            </h1>
            <p class="text-sm text-slate-600">
              {{ game.description || "No description provided." }}
            </p>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
              Created {{ formatDateTime(game.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <section>
        <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Subscribers</h2>
          <p class="text-sm text-slate-500">
            {{ subscriberRangeLabel }}
          </p>
        </div>
        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          :class="{ 'opacity-70': isSubscribersLoading }"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3">Phone</th>
                  <th class="px-4 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="!isSubscribersLoading && subscribers.length === 0">
                  <td colspan="2" class="px-4 py-8 text-center text-slate-500">
                    No subscribers for this game yet.
                  </td>
                </tr>
                <tr v-for="subscriber in subscribers" :key="subscriber.id" class="hover:bg-slate-50/80">
                  <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {{ subscriber.phone_number }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                    {{ formatDateTime(subscriber.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="isSubscribersLoading"
            class="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-slate-600"
          >
            Loading subscribers…
          </p>
        </div>

        <div
          v-if="subscribersTotal > 0"
          class="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"
        >
          <p class="text-xs text-slate-500">
            Page {{ currentPage }} of {{ subscribersTotalPages }}
          </p>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubscribersLoading || currentPage <= 1"
              aria-label="Previous page"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSubscribersLoading || currentPage >= subscribersTotalPages"
              aria-label="Next page"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </div>

        </div>
      </section>

      <section>
        <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Verified Mobile Users</h2>
          <p class="text-sm text-slate-500">
            {{ usermobiles.length }} Records
          </p>
        </div>

        <p
          v-if="usermobilesLoadError"
          class="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {{ usermobilesLoadError }}
        </p>

        <div
          class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          :class="{ 'opacity-70': isUsermobilesLoading }"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3">Phone Number</th>
                  <th class="px-4 py-3">Game ID</th>
                  <th class="px-4 py-3">Verified</th>
                  <th class="px-4 py-3">Added</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="!isUsermobilesLoading && usermobiles.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-slate-500">
                    No verified mobile users for this game yet.
                  </td>
                </tr>
                <tr v-for="usermobile in usermobiles" :key="usermobile.id" class="hover:bg-slate-50/80">
                  <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {{ usermobile.phone }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                    {{ usermobile.game_id }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                    {{ usermobile.is_verified ? "Yes" : "No" }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600">
                    {{ formatDateTime(usermobile.created_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            v-if="isUsermobilesLoading"
            class="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-slate-600"
          >
            Loading verified mobile users…
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
