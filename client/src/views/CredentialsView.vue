<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ $t('message.credential_management') }}</h1>
          </div>
          <div class="flex space-x-3">
            <button
              @click="openSSHKeyGenerator"
              class="btn-secondary"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {{ $t('message.generate_ssh_key') }}
            </button>
            <button
              @click="openBulkOperations"
              class="btn-secondary"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {{ $t('message.bulk_operations') }}
            </button>
            <button
              @click="openAddModal"
              class="btn-primary"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('message.add_new_credential') }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{{ $t('message.your_saved_credentials') }}</h2>
        <p v-if="credentialStore.loading" class="text-gray-600 dark:text-gray-400">{{ $t('message.loading_credentials') }}</p>
        <p v-else-if="credentialStore.credentials.length === 0" class="text-gray-600 dark:text-gray-400">{{ $t('message.no_credentials_saved') }}</p>
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CredentialCard
            v-for="credential in credentialStore.credentials"
            :key="credential.id"
            :credential="credential"
            @edit="openEditModal"
            @delete="confirmDelete"
          />
        </div>
      </div>

      <CredentialFormModal
        v-if="showCredentialModal"
        :credential="selectedCredentialForEdit"
        @close="closeModal"
        @saved="handleCredentialSaved"
      />
      
      <SSHKeyGeneratorModal
        :show="showSSHKeyGenerator"
        @close="closeSSHKeyGenerator"
        @generated="handleKeyGenerated"
      />
      
      <BulkOperationsModal
        :show="showBulkOperations"
        :credentials="credentialStore.credentials"
        @close="closeBulkOperations"
        @operation-completed="handleBulkOperationCompleted"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCredentialStore } from '../stores/credentialStore';
import { useI18n } from 'vue-i18n';
import CredentialCard from '../components/CredentialCard.vue';
import CredentialFormModal from '../components/CredentialFormModal.vue';
import SSHKeyGeneratorModal from '../components/SSHKeyGeneratorModal.vue';
import BulkOperationsModal from '../components/BulkOperationsModal.vue';

const credentialStore = useCredentialStore();
const { t } = useI18n();

const showCredentialModal = ref(false);
const selectedCredentialForEdit = ref(null);
const showSSHKeyGenerator = ref(false);
const showBulkOperations = ref(false);

onMounted(() => {
  credentialStore.fetchCredentials();
});

const openAddModal = () => {
  selectedCredentialForEdit.value = null; // For adding new
  showCredentialModal.value = true;
};

const openEditModal = (credential) => {
  selectedCredentialForEdit.value = credential;
  showCredentialModal.value = true;
};

const closeModal = () => {
  showCredentialModal.value = false;
  selectedCredentialForEdit.value = null;
  credentialStore.error = null; // Clear any previous errors
};

const handleCredentialSaved = () => {
  credentialStore.fetchCredentials(); // Refresh the list after save
};

const confirmDelete = async (id) => {
  if (confirm(t('message.confirm_delete_credential'))) {
    try {
      await credentialStore.deleteCredential(id);
    } catch (error) {
      console.error('Failed to delete credential:', error);
    }
  }
};

// SSH Key Generator methods
const openSSHKeyGenerator = () => {
  showSSHKeyGenerator.value = true;
};

const closeSSHKeyGenerator = () => {
  showSSHKeyGenerator.value = false;
};

const handleKeyGenerated = (credential) => {
  // Refresh credentials list to show the new generated key
  credentialStore.fetchCredentials();
  showSSHKeyGenerator.value = false;
};

// Bulk Operations methods
const openBulkOperations = () => {
  showBulkOperations.value = true;
};

const closeBulkOperations = () => {
  showBulkOperations.value = false;
};

const handleBulkOperationCompleted = (operationType, result) => {
  // Refresh credentials list after bulk operations
  credentialStore.fetchCredentials();
};
</script>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-slate-800;
}

.btn-secondary {
  @apply inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-slate-800;
}
</style>
