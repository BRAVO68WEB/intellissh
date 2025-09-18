<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click.self="close"
  >
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-screen overflow-y-auto">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('message.bulk_operations') }}
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ $t(tab.label) }}
            </button>
          </nav>
        </div>

        <!-- Bulk Delete Tab -->
        <div v-if="activeTab === 'delete'" class="space-y-6">
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">{{ $t('message.warning') }}</h3>
                <p class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  {{ $t('message.bulk_delete_warning') }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ $t('message.select_credentials_to_delete') }}
            </h4>
            <div class="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
              <label v-for="credential in credentials" :key="credential.id" class="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <input
                  type="checkbox"
                  :value="credential.id"
                  v-model="selectedForDelete"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ credential.name }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ credential.type }} • {{ credential.username || 'No username' }}</div>
                </div>
              </label>
              <div v-if="credentials.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
                {{ $t('message.no_credentials_available') }}
              </div>
            </div>
            <div class="mt-4 flex justify-between items-center">
              <div class="flex space-x-2">
                <button
                  @click="selectAllForDelete"
                  class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  {{ $t('message.select_all') }}
                </button>
                <button
                  @click="selectedForDelete = []"
                  class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {{ $t('message.select_none') }}
                </button>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedForDelete.length }} {{ $t('message.selected') }}
              </span>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {{ $t('message.cancel') }}
            </button>
            <button
              @click="performBulkDelete"
              :disabled="selectedForDelete.length === 0 || processing"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="processing" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('message.delete_selected') }} ({{ selectedForDelete.length }})
            </button>
          </div>
        </div>

        <!-- Bulk Import Tab -->
        <div v-if="activeTab === 'import'" class="space-y-6">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">{{ $t('message.import_instructions') }}</h3>
                <p class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  {{ $t('message.import_credentials_info') }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.credentials_json') }}
            </label>
            <textarea
              v-model="importJson"
              rows="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              :placeholder="importPlaceholder"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {{ $t('message.cancel') }}
            </button>
            <button
              @click="performBulkImport"
              :disabled="!importJson.trim() || processing"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="processing" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('message.import_credentials') }}
            </button>
          </div>
        </div>

        <!-- Export Tab -->
        <div v-if="activeTab === 'export'" class="space-y-6">
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800 dark:text-green-200">{{ $t('message.export_info') }}</h3>
                <p class="mt-2 text-sm text-green-700 dark:text-green-300">
                  {{ $t('message.export_credentials_info') }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="exportData" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ $t('message.export_data') }}
              </label>
              <textarea
                :value="JSON.stringify(exportData, null, 2)"
                readonly
                rows="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              ></textarea>
            </div>
            
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p class="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>{{ $t('message.security_note') }}:</strong> {{ $t('message.export_security_warning') }}
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {{ $t('message.close') }}
            </button>
            <button
              @click="performExport"
              :disabled="processing"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="processing" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('message.generate_export') }}
            </button>
            <button
              v-if="exportData"
              @click="downloadExport"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {{ $t('message.download') }}
            </button>
          </div>
        </div>

        <!-- Results Display -->
        <div v-if="operationResults" class="mt-6 p-4 border rounded-md" :class="operationResults.success ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'">
          <div class="flex items-start">
            <svg v-if="operationResults.success" class="h-5 w-5 text-green-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium" :class="operationResults.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'">
                {{ operationResults.title }}
              </h4>
              <div class="mt-2 text-sm" :class="operationResults.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                <p>{{ operationResults.message }}</p>
                <div v-if="operationResults.details" class="mt-2 space-y-1">
                  <div v-for="detail in operationResults.details" :key="detail.id" class="text-xs">
                    {{ detail.message }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  credentials: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'operation-completed'])

// Reactive state
const activeTab = ref('delete')
const processing = ref(false)
const selectedForDelete = ref([])
const importJson = ref('')
const exportData = ref(null)
const operationResults = ref(null)

const tabs = [
  { id: 'delete', label: 'message.bulk_delete' },
  { id: 'import', label: 'message.bulk_import' },
  { id: 'export', label: 'message.export_data' }
]

const importPlaceholder = computed(() => {
  return JSON.stringify([
    {
      name: "Example Credential",
      type: "password",
      username: "user",
      password: "password123"
    },
    {
      name: "Example Key",
      type: "private_key",
      username: "user",
      privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
      passphrase: "optional"
    }
  ], null, 2)
})

// Methods
const close = () => {
  emit('close')
  resetState()
}

const resetState = () => {
  activeTab.value = 'delete'
  processing.value = false
  selectedForDelete.value = []
  importJson.value = ''
  exportData.value = null
  operationResults.value = null
}

const selectAllForDelete = () => {
  selectedForDelete.value = props.credentials.map(c => c.id)
}

const performBulkDelete = async () => {
  if (selectedForDelete.value.length === 0) return

  processing.value = true
  operationResults.value = null

  try {
    const response = await axios.delete('/api/credentials/bulk/delete', {
      data: { credentialIds: selectedForDelete.value }
    })

    if (response.data.success) {
      operationResults.value = {
        success: true,
        title: t('message.bulk_delete_successful'),
        message: t('message.credentials_deleted_count', { count: response.data.deleted }),
        details: response.data.errors?.map(error => ({
          id: error.id,
          message: `${error.id}: ${error.error}`
        })) || []
      }
      
      emit('operation-completed', 'delete', response.data)
      selectedForDelete.value = []
    } else {
      throw new Error('Bulk delete failed')
    }
  } catch (error) {
    console.error('Bulk delete failed:', error)
    operationResults.value = {
      success: false,
      title: t('message.bulk_delete_failed'),
      message: error.response?.data?.message || error.message
    }
  } finally {
    processing.value = false
  }
}

const performBulkImport = async () => {
  if (!importJson.value.trim()) return

  processing.value = true
  operationResults.value = null

  try {
    const credentials = JSON.parse(importJson.value)
    
    if (!Array.isArray(credentials)) {
      throw new Error(t('message.import_must_be_array'))
    }

    const response = await axios.post('/api/credentials/bulk/create', { credentials })

    if (response.data.success) {
      operationResults.value = {
        success: true,
        title: t('message.bulk_import_successful'),
        message: t('message.credentials_imported_count', { 
          created: response.data.created,
          failed: response.data.failed
        }),
        details: response.data.errors?.map(error => ({
          id: error.credential?.name || 'Unknown',
          message: `${error.credential?.name || 'Unknown'}: ${error.error}`
        })) || []
      }
      
      emit('operation-completed', 'import', response.data)
      importJson.value = ''
    } else {
      throw new Error('Bulk import failed')
    }
  } catch (error) {
    console.error('Bulk import failed:', error)
    operationResults.value = {
      success: false,
      title: t('message.bulk_import_failed'),
      message: error.name === 'SyntaxError' 
        ? t('message.invalid_json_format') 
        : (error.response?.data?.message || error.message)
    }
  } finally {
    processing.value = false
  }
}

const performExport = async () => {
  processing.value = true
  operationResults.value = null

  try {
    const response = await axios.get('/api/credentials/export')
    
    if (response.data.success) {
      exportData.value = response.data
      operationResults.value = {
        success: true,
        title: t('message.export_successful'),
        message: t('message.credentials_exported_count', { count: response.data.credentials.length })
      }
    } else {
      throw new Error('Export failed')
    }
  } catch (error) {
    console.error('Export failed:', error)
    operationResults.value = {
      success: false,
      title: t('message.export_failed'),
      message: error.response?.data?.message || error.message
    }
  } finally {
    processing.value = false
  }
}

const downloadExport = () => {
  if (!exportData.value) return

  const dataStr = JSON.stringify(exportData.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `intellissh-credentials-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
</script>