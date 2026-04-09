<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { apiRequest } from "../api/http";

// 1. Initialize the auth store
const authStore = useAuthStore();

// Separate state for the two different tables
const usersmobile = ref([]);
const admins = ref([]); 

const loadError = ref("");
const isLoadingMobile = ref(true);

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

async function loadUsersmobile() {
  loadError.value = "";
  isLoadingMobile.value = true;
  try {
    const payload = await apiRequest("api/usermobile");
    usersmobile.value = Array.isArray(payload) ? payload : [];
  } catch (error) {
    loadError.value = error?.message || "Failed to load mobile number of users";
  } finally {
    isLoadingMobile.value = false;
  }
}

onMounted(() => {
  loadUsersmobile();
});
</script>

<template>
  <div class="space-y-6">

    <p v-if="loadError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {{ loadError }}
    </p>
    
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">API usersmobile</h1>
      <p class="mt-1 text-sm text-slate-600">Verified mobile number of the users and its Game ID.</p>
    </div>
    
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Phone Number</th>
              <th class="px-4 py-3">Game ID</th> 
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            
            <tr v-if="isLoadingMobile">
              <td colspan="2" class="px-4 py-10 text-center text-slate-500">Loading…</td>
            </tr>
            
            <tr v-else-if="usersmobile.length === 0">
              <td colspan="2" class="px-4 py-10 text-center text-slate-500">No mobile users found.</td>
            </tr>
            
            <tr v-for="user in usersmobile" :key="user.id" class="hover:bg-slate-50/80">
              <td class="px-4 py-3 font-semibold text-slate-900">
                {{ user.phone }}
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ user.game_id }}
              </td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>