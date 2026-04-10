<script setup>
import { ref, watch } from "vue";
import { apiRequest } from "../api/http.js";

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  mode: {
    type: String,
    default: "create",
    validator: (value) => ["create", "edit"].includes(value),
  },
  game: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "created", "updated"]);

const name = ref("");
const description = ref("");
const imageUrl = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

function isEditMode() {
  return props.mode === "edit";
}

function resetForm() {
  name.value = "";
  description.value = "";
  imageUrl.value = "";
  errorMessage.value = "";
  isSubmitting.value = false;
}

function populateForm() {
  name.value = props.game?.name ?? "";
  description.value = props.game?.description ?? "";
  imageUrl.value = props.game?.image_url ?? "";
  errorMessage.value = "";
  isSubmitting.value = false;
}

watch(
  () => [props.open, props.mode, props.game],
  ([isOpen]) => {
    if (!isOpen) {
      return;
    }

    if (isEditMode()) {
      populateForm();
      return;
    }

    resetForm();
  },
  { immediate: true },
);

function handleBackdropClick() {
  if (!isSubmitting.value) {
    emit("close");
  }
}

async function handleSubmit() {
  errorMessage.value = "";
  if (!name.value.trim()) {
    errorMessage.value = "Name is required";
    return;
  }
  isSubmitting.value = true;
  try {
    const savedGame = await apiRequest(isEditMode() ? `/api/games/${props.game?.id}` : "/api/games", {
      method: isEditMode() ? "PUT" : "POST",
      body: JSON.stringify({
        name: name.value.trim(),
        description: description.value.trim() || null,
        image_url: imageUrl.value.trim() || null,
      }),
    });

    if (isEditMode()) {
      emit("updated", savedGame);
    } else {
      emit("created", savedGame);
    }

    emit("close");
  } catch (error) {
    errorMessage.value = error?.message || `Could not ${isEditMode() ? "update" : "create"} game`;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      @click.self="handleBackdropClick"
    >
      <div
        class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        @click.stop
      >
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ isEditMode() ? "Update game" : "Add game" }}
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ isEditMode() ? "Update the selected game entry." : "Create a new game entry for your catalog." }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </label>
            <input
              v-model="name"
              required
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              placeholder="e.g. Lunar Quest"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              v-model="description"
              rows="3"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              placeholder="Short summary"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Image URL
            </label>
            <input
              v-model="imageUrl"
              type="url"
              class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2"
              placeholder="https://…"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-rose-600">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              :disabled="isSubmitting"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Saving…" : isEditMode() ? "Update game" : "Create game" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
