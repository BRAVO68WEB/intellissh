<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click.self="close"
  >
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('message.generate_ssh_key') }}
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="generateKey">
          <!-- Key Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.key_name') }}
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('message.enter_key_name')"
            />
          </div>

          <!-- Key Type -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.key_type') }}
            </label>
            <select
              v-model="form.keyType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="rsa">RSA</option>
              <option value="ed25519">Ed25519</option>
              <option value="ecdsa">ECDSA</option>
            </select>
          </div>

          <!-- Key Size (for RSA and ECDSA) -->
          <div v-if="form.keyType === 'rsa' || form.keyType === 'ecdsa'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.key_size') }}
            </label>
            <select
              v-model="form.keySize"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <template v-if="form.keyType === 'rsa'">
                <option value="2048">2048 bits</option>
                <option value="4096">4096 bits (Recommended)</option>
                <option value="8192">8192 bits</option>
              </template>
              <template v-else-if="form.keyType === 'ecdsa'">
                <option value="256">256 bits</option>
                <option value="384">384 bits</option>
                <option value="521">521 bits</option>
              </template>
            </select>
          </div>

          <!-- Username -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.ssh_username') }} ({{ $t('message.optional') }})
            </label>
            <input
              v-model="form.username"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('message.enter_ssh_username')"
            />
          </div>

          <!-- Comment -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.comment') }} ({{ $t('message.optional') }})
            </label>
            <input
              v-model="form.comment"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('message.enter_key_comment')"
            />
          </div>

          <!-- Passphrase -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.passphrase') }} ({{ $t('message.optional') }})
            </label>
            <input
              v-model="form.passphrase"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('message.enter_passphrase')"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ $t('message.passphrase_info') }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {{ $t('message.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="generating"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="generating" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ generating ? $t('message.generating') : $t('message.generate_key') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Generated Key Display Modal -->
  <div 
    v-if="showGeneratedKey" 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click.self="closeGeneratedKey"
  >
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-screen overflow-y-auto">
      <div class="mt-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('message.ssh_key_generated') }}
          </h3>
          <button @click="closeGeneratedKey" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Key Information -->
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800 dark:text-green-200">{{ $t('message.key_generated_successfully') }}</h3>
                <div class="mt-2 text-sm text-green-700 dark:text-green-300">
                  <div class="grid grid-cols-2 gap-4">
                    <div><strong>{{ $t('message.key_type') }}:</strong> {{ generatedKeyInfo.keyType }}</div>
                    <div v-if="generatedKeyInfo.keySize"><strong>{{ $t('message.key_size') }}:</strong> {{ generatedKeyInfo.keySize }} bits</div>
                    <div v-if="generatedKeyInfo.fingerprint"><strong>{{ $t('message.fingerprint') }}:</strong> {{ generatedKeyInfo.fingerprint }}</div>
                    <div><strong>{{ $t('message.passphrase_protected') }}:</strong> {{ generatedKeyInfo.hasPassphrase ? $t('message.yes') : $t('message.no') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Public Key -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('message.public_key') }}
            </label>
            <div class="relative">
              <textarea
                :value="generatedPublicKey"
                readonly
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              ></textarea>
              <button
                @click="copyToClipboard(generatedPublicKey)"
                class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                :title="$t('message.copy_to_clipboard')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ $t('message.public_key_info') }}
            </p>
          </div>

          <!-- Instructions -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">{{ $t('message.next_steps') }}</h3>
                <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ol class="list-decimal list-inside space-y-1">
                    <li>{{ $t('message.copy_public_key_instruction') }}</li>
                    <li>{{ $t('message.add_to_authorized_keys_instruction') }}</li>
                    <li>{{ $t('message.test_connection_instruction') }}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="closeGeneratedKey"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {{ $t('message.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'generated'])

// Reactive state
const generating = ref(false)
const showGeneratedKey = ref(false)
const generatedPublicKey = ref('')
const generatedKeyInfo = ref({})

const form = reactive({
  name: '',
  keyType: 'rsa',
  keySize: 4096,
  username: '',
  comment: '',
  passphrase: ''
})

// Methods
const close = () => {
  emit('close')
  resetForm()
}

const closeGeneratedKey = () => {
  showGeneratedKey.value = false
  generatedPublicKey.value = ''
  generatedKeyInfo.value = {}
  close()
}

const resetForm = () => {
  form.name = ''
  form.keyType = 'rsa'
  form.keySize = 4096
  form.username = ''
  form.comment = ''
  form.passphrase = ''
}

const generateKey = async () => {
  if (!form.name.trim()) {
    alert(t('message.name_required'))
    return
  }

  generating.value = true

  try {
    const payload = {
      name: form.name.trim(),
      keyType: form.keyType,
      keySize: form.keyType !== 'ed25519' ? parseInt(form.keySize) : undefined,
      username: form.username.trim() || undefined,
      comment: form.comment.trim() || undefined,
      passphrase: form.passphrase || undefined
    }

    const response = await axios.post('/api/credentials/generate-key', payload)
    
    if (response.data.success) {
      generatedPublicKey.value = response.data.publicKey
      generatedKeyInfo.value = response.data.keyInfo
      showGeneratedKey.value = true
      
      // Emit the generated credential to parent
      emit('generated', response.data.credential)
    } else {
      throw new Error('Failed to generate key')
    }
  } catch (error) {
    console.error('Key generation failed:', error)
    alert(t('message.key_generation_failed') + ': ' + (error.response?.data?.message || error.message))
  } finally {
    generating.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add a toast notification here
    alert(t('message.copied_to_clipboard'))
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      alert(t('message.copied_to_clipboard'))
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      alert(t('message.copy_failed'))
    }
    document.body.removeChild(textArea)
  }
}
</script>