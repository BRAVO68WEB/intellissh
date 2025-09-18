<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ $t('message.activity_logs') }}</h1>
          </div>
          <div class="flex space-x-3">
            <button
              @click="refreshLogs"
              :disabled="loading"
              class="btn-secondary"
            >
              <svg v-if="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('message.refresh') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.activity_type') }}
            </label>
            <select
              v-model="filters.activityType"
              @change="applyFilters"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">{{ $t('message.all_types') }}</option>
              <option value="connect">{{ $t('message.connection') }}</option>
              <option value="disconnect">{{ $t('message.disconnection') }}</option>
              <option value="command">{{ $t('message.command') }}</option>
              <option value="error">{{ $t('message.error') }}</option>
              <option value="file_transfer">{{ $t('message.file_transfer') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.session') }}
            </label>
            <select
              v-model="filters.sessionId"
              @change="applyFilters"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">{{ $t('message.all_sessions') }}</option>
              <option v-for="session in sessions" :key="session.id" :value="session.id">
                {{ session.name }} ({{ session.hostname }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.time_period') }}
            </label>
            <select
              v-model="filters.days"
              @change="loadStats"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="1">{{ $t('message.last_day') }}</option>
              <option value="7">{{ $t('message.last_week') }}</option>
              <option value="30">{{ $t('message.last_month') }}</option>
              <option value="90">{{ $t('message.last_3_months') }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ $t('message.connections') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totals.connect || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ $t('message.commands') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totals.command || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <svg class="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ $t('message.errors') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totals.error || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ $t('message.disconnections') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.totals.disconnect || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Logs -->
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ $t('message.recent_activity') }}</h2>
        </div>
        
        <div v-if="loading" class="p-6">
          <div class="text-center">
            <svg class="animate-spin h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-gray-500 dark:text-gray-400">{{ $t('message.loading') }}</p>
          </div>
        </div>

        <div v-else-if="logs.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          {{ $t('message.no_activity_logs') }}
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="log in logs" :key="log.id" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div :class="getActivityIcon(log.activity_type)" class="w-10 h-10 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="log.activity_type === 'connect'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      <path v-else-if="log.activity_type === 'disconnect'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      <path v-else-if="log.activity_type === 'command'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path v-else-if="log.activity_type === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ getActivityDescription(log) }}
                    </p>
                    <span :class="getActivityTypeClass(log.activity_type)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ log.activity_type }}
                    </span>
                  </div>
                  <div class="mt-1">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      <span class="font-medium">{{ log.session_name }}</span> • {{ log.hostname }}:{{ log.event_data.port || 22 }} • {{ log.ssh_username }}
                    </p>
                  </div>
                  <div v-if="log.event_data.command" class="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                    {{ log.event_data.command }}
                  </div>
                  <div v-if="log.event_data.error" class="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                    {{ log.event_data.error }}
                  </div>
                </div>
              </div>
              <div class="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(log.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="logs.length > 0 && hasMore" class="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="w-full btn-secondary"
          >
            <svg v-if="loadingMore" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('message.load_more') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()

// Reactive state
const loading = ref(false)
const loadingMore = ref(false)
const logs = ref([])
const sessions = ref([])
const stats = ref(null)
const hasMore = ref(false)
const offset = ref(0)
const limit = ref(50)

const filters = ref({
  activityType: '',
  sessionId: '',
  days: 30
})

// Load activity logs
const loadLogs = async (append = false) => {
  try {
    if (!append) {
      loading.value = true
      offset.value = 0
      logs.value = []
    } else {
      loadingMore.value = true
    }

    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (filters.value.activityType) {
      params.type = filters.value.activityType
    }

    let endpoint = '/api/activity/user'
    if (filters.value.sessionId) {
      endpoint = `/api/activity/session/${filters.value.sessionId}`
    }

    const response = await axios.get(endpoint, { params })
    
    if (append) {
      logs.value = [...logs.value, ...response.data.logs]
    } else {
      logs.value = response.data.logs
    }
    
    hasMore.value = response.data.logs.length === limit.value
    offset.value += limit.value
  } catch (error) {
    console.error('Failed to load activity logs:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Load statistics
const loadStats = async () => {
  try {
    const response = await axios.get('/api/activity/stats', {
      params: { days: filters.value.days }
    })
    stats.value = response.data.stats
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// Load sessions for filter
const loadSessions = async () => {
  try {
    const response = await axios.get('/api/sessions')
    sessions.value = response.data.sessions
  } catch (error) {
    console.error('Failed to load sessions:', error)
  }
}

// Apply filters
const applyFilters = () => {
  loadLogs(false)
}

// Load more logs
const loadMore = () => {
  loadLogs(true)
}

// Refresh data
const refreshLogs = () => {
  loadLogs(false)
  loadStats()
}

// Utility functions
const getActivityIcon = (activityType) => {
  const baseClass = 'text-white'
  switch (activityType) {
    case 'connect':
      return `bg-green-500 ${baseClass}`
    case 'disconnect':
      return `bg-yellow-500 ${baseClass}`
    case 'command':
      return `bg-blue-500 ${baseClass}`
    case 'error':
      return `bg-red-500 ${baseClass}`
    case 'file_transfer':
      return `bg-purple-500 ${baseClass}`
    default:
      return `bg-gray-500 ${baseClass}`
  }
}

const getActivityTypeClass = (activityType) => {
  switch (activityType) {
    case 'connect':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'disconnect':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'command':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'file_transfer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getActivityDescription = (log) => {
  switch (log.activity_type) {
    case 'connect':
      return t('message.connected_to_session')
    case 'disconnect':
      return t('message.disconnected_from_session')
    case 'command':
      return t('message.executed_command')
    case 'error':
      return t('message.connection_error')
    case 'file_transfer':
      return t('message.file_transfer_activity')
    default:
      return t('message.unknown_activity')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// Initialize component
onMounted(() => {
  loadSessions()
  loadLogs(false)
  loadStats()
})
</script>