<template>
  <div>
    <!-- Add form -->
    <div class="mb-4 flex gap-2 items-end flex-wrap">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Email</label>
        <InputText v-model="newEmail" placeholder="user@example.com" class="w-64" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Notes (optional)</label>
        <InputText v-model="newNotes" placeholder="Notes" class="w-64" />
      </div>
      <Button label="Add Beta Tester" icon="pi pi-plus" :loading="adding" @click="addBetaTester" />
    </div>

    <Message v-if="errorMsg" severity="error" :closable="true" @close="errorMsg = ''">{{ errorMsg }}</Message>
    <Message v-if="successMsg" severity="success" :closable="true" @close="successMsg = ''">{{ successMsg }}</Message>

    <!-- Table -->
    <DataTable :value="betaTesters" :loading="loading" stripedRows responsiveLayout="scroll">
      <Column field="email" header="Email" sortable>
        <template #body="{ data }">
          <template v-if="editingId === data.id">
            <InputText v-model="editEmail" class="w-full" />
          </template>
          <template v-else>{{ data.email }}</template>
        </template>
      </Column>
      <Column field="notes" header="Notes" sortable>
        <template #body="{ data }">
          <template v-if="editingId === data.id">
            <InputText v-model="editNotes" class="w-full" />
          </template>
          <template v-else>{{ data.notes || '-' }}</template>
        </template>
      </Column>
      <Column field="created_at" header="Created" sortable>
        <template #body="{ data }">
          {{ new Date(data.created_at).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Actions" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <template v-if="editingId === data.id">
              <Button icon="pi pi-check" severity="success" text rounded :loading="saving" @click="saveEdit(data.id)" />
              <Button icon="pi pi-times" severity="secondary" text rounded @click="cancelEdit" />
            </template>
            <template v-else>
              <Button icon="pi pi-pencil" severity="info" text rounded @click="startEdit(data)" />
              <Button icon="pi pi-trash" severity="danger" text rounded :loading="deletingId === data.id" @click="deleteBetaTester(data.id)" />
            </template>
          </div>
        </template>
      </Column>
      <template #empty>
        <div class="text-center p-4 text-gray-500">No beta testers yet.</div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { BetaTester } from '~/types'

const betaTesters = ref<BetaTester[]>([])
const loading = ref(false)
const adding = ref(false)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const errorMsg = ref('')
const successMsg = ref('')

const newEmail = ref('')
const newNotes = ref('')

const editingId = ref<string | null>(null)
const editEmail = ref('')
const editNotes = ref('')

async function fetchBetaTesters() {
  loading.value = true
  try {
    betaTesters.value = await $fetch<BetaTester[]>('/api/beta-testers')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Failed to load beta testers'
  } finally {
    loading.value = false
  }
}

async function addBetaTester() {
  if (!newEmail.value.trim()) {
    errorMsg.value = 'Email is required'
    return
  }
  adding.value = true
  errorMsg.value = ''
  try {
    const created = await $fetch<BetaTester>('/api/beta-testers', {
      method: 'POST',
      body: { email: newEmail.value.trim(), notes: newNotes.value.trim() || null }
    })
    betaTesters.value.unshift(created)
    newEmail.value = ''
    newNotes.value = ''
    successMsg.value = 'Beta tester added'
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Failed to add beta tester'
  } finally {
    adding.value = false
  }
}

function startEdit(tester: BetaTester) {
  editingId.value = tester.id
  editEmail.value = tester.email
  editNotes.value = tester.notes || ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: string) {
  saving.value = true
  errorMsg.value = ''
  try {
    const updated = await $fetch<BetaTester>(`/api/beta-testers/${id}`, {
      method: 'PATCH',
      body: { email: editEmail.value.trim(), notes: editNotes.value.trim() || null }
    })
    const idx = betaTesters.value.findIndex(t => t.id === id)
    if (idx !== -1) betaTesters.value[idx] = updated
    editingId.value = null
    successMsg.value = 'Beta tester updated'
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Failed to update beta tester'
  } finally {
    saving.value = false
  }
}

async function deleteBetaTester(id: string) {
  deletingId.value = id
  errorMsg.value = ''
  try {
    await $fetch(`/api/beta-testers/${id}`, { method: 'DELETE' })
    betaTesters.value = betaTesters.value.filter(t => t.id !== id)
    successMsg.value = 'Beta tester removed'
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Failed to delete beta tester'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchBetaTesters)
</script>
