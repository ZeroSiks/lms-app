<template>
    <div class="flex h-full overflow-hidden">

        <!-- Conversations list -->
        <aside class="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
            <div class="p-4 border-b border-gray-100 flex-shrink-0">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-base font-bold text-gray-900">Messages</h1>
                        <p class="text-xs text-gray-400 mt-0.5">Direct messages</p>
                    </div>
                    <button @click="openNewMessage"
                        class="w-8 h-8 bg-[#0000ff] rounded-lg flex items-center justify-center hover:bg-[#0000cc] transition-colors flex-shrink-0"
                        title="New message">
                        <Plus class="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
                <div v-if="loadingConversations" class="flex items-center justify-center py-8">
                    <div class="w-5 h-5 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div v-else-if="conversations.length === 0" class="p-6 text-center">
                    <MessageCircle class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p class="text-sm text-gray-500 font-medium">No messages yet</p>
                    <p class="text-xs text-gray-400 mt-1">Press + to start a conversation.</p>
                </div>
                <button
                    v-for="conv in conversations"
                    :key="conv.id"
                    @click="openConversation(conv)"
                    :class="[
                        'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left',
                        active?.id === conv.id ? 'bg-blue-50/50' : ''
                    ]"
                >
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ conv.firstName[0] }}{{ conv.lastName[0] }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">{{ conv.firstName }} {{ conv.lastName }}</p>
                        <p class="text-xs text-gray-400 truncate mt-0.5">{{ conv.lastMessage ?? 'No messages yet' }}</p>
                    </div>
                    <span v-if="conv.lastTime" class="text-[10px] text-gray-300 flex-shrink-0">{{ relTime(conv.lastTime) }}</span>
                </button>
            </div>
        </aside>

        <!-- Chat area -->
        <main class="flex-1 flex flex-col overflow-hidden">
            <div v-if="!active" class="flex-1 flex items-center justify-center text-center">
                <div>
                    <MessageCircle class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p class="text-sm font-medium text-gray-500">Select a conversation</p>
                    <p class="text-xs text-gray-400 mt-1">or press <span class="font-semibold">+</span> to start a new one</p>
                </div>
            </div>

            <template v-else>
                <!-- Header -->
                <div class="h-16 border-b border-gray-100 flex items-center px-6 gap-3 bg-white flex-shrink-0">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {{ active.firstName[0] }}{{ active.lastName[0] }}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-gray-900">{{ active.firstName }} {{ active.lastName }}</p>
                        <p class="text-xs text-gray-400 capitalize">{{ active.role?.toLowerCase() }}</p>
                    </div>
                </div>

                <!-- Messages -->
                <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
                    <div v-if="loadingMessages" class="flex items-center justify-center py-8">
                        <div class="w-5 h-5 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div v-for="msg in messages" :key="msg.id"
                        :class="['flex', msg.senderId === currentUserId ? 'justify-end' : 'justify-start']">
                        <div :class="['max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm', msg.senderId === currentUserId ? 'bg-[#0000ff] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm']">
                            {{ msg.content }}
                            <p :class="['text-[10px] mt-1', msg.senderId === currentUserId ? 'text-white/60' : 'text-gray-400']">{{ relTime(msg.createdAt) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                    <div class="flex items-end gap-3">
                        <textarea
                            v-model="newMessage"
                            @keydown.enter.exact.prevent="sendMessage"
                            rows="1"
                            placeholder="Type a message… (Enter to send)"
                            class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none"
                        ></textarea>
                        <button @click="sendMessage" :disabled="!newMessage.trim() || sending"
                            class="w-10 h-10 bg-[#0000ff] rounded-xl flex items-center justify-center hover:bg-[#0000cc] transition-colors disabled:opacity-40 flex-shrink-0">
                            <Send class="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            </template>
        </main>

        <!-- New Message Modal -->
        <Teleport to="body">
            <div v-if="showNewMsg" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showNewMsg = false">
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
                    <h2 class="text-sm font-bold text-gray-900 mb-4">New Message</h2>
                    <div class="relative mb-3">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                        </svg>
                        <input v-model="recipientSearch" type="text" placeholder="Search by name…"
                            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                    </div>
                    <div v-if="loadingRecipients" class="flex items-center justify-center py-6">
                        <div class="w-5 h-5 border-2 border-[#0000ff] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div v-else-if="filteredRecipients.length === 0" class="py-6 text-center text-sm text-gray-400">
                        {{ recipientSearch ? 'No users found.' : 'No users available to message.' }}
                    </div>
                    <div v-else class="space-y-1 max-h-64 overflow-y-auto">
                        <button
                            v-for="r in filteredRecipients"
                            :key="r.id"
                            @click="startConversation(r)"
                            class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        >
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {{ r.firstName[0] }}{{ r.lastName[0] }}
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-900">{{ r.firstName }} {{ r.lastName }}</p>
                                <p class="text-xs text-gray-400 capitalize">{{ r.role?.toLowerCase() }}</p>
                            </div>
                        </button>
                    </div>
                    <button @click="showNewMsg = false" class="mt-4 w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { MessageCircle, Send, Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const currentUserId = computed(() => user.value?.id)

interface ConvUser { id: number; firstName: string; lastName: string; role: string; lastMessage?: string; lastTime?: string }
interface Message { id: number; content: string; senderId: number; receiverId: number; createdAt: string }

const conversations = ref<ConvUser[]>([])
const loadingConversations = ref(true)
const active = ref<ConvUser | null>(null)
const messages = ref<Message[]>([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sending = ref(false)
const msgContainer = ref<HTMLElement>()

// New message modal
const showNewMsg = ref(false)
const recipients = ref<ConvUser[]>([])
const loadingRecipients = ref(false)
const recipientSearch = ref('')

const filteredRecipients = computed(() => {
    const q = recipientSearch.value.toLowerCase()
    if (!q) return recipients.value
    return recipients.value.filter(r =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.role?.toLowerCase().includes(q)
    )
})

onMounted(async () => {
    try {
        conversations.value = await $fetch<ConvUser[]>('/api/messages/conversations')
    } catch {
        conversations.value = []
    } finally {
        loadingConversations.value = false
    }
})

const openNewMessage = async () => {
    showNewMsg.value = true
    recipientSearch.value = ''
    if (recipients.value.length) return
    loadingRecipients.value = true
    try {
        recipients.value = await $fetch<ConvUser[]>('/api/messages/recipients')
    } catch {
        recipients.value = []
    } finally {
        loadingRecipients.value = false
    }
}

const startConversation = (r: ConvUser) => {
    showNewMsg.value = false
    // If conversation already exists, open it; otherwise create a new one in the sidebar
    const existing = conversations.value.find(c => c.id === r.id)
    if (existing) {
        openConversation(existing)
    } else {
        const newConv: ConvUser = { id: r.id, firstName: r.firstName, lastName: r.lastName, role: r.role }
        conversations.value.unshift(newConv)
        openConversation(newConv)
    }
}

const openConversation = async (conv: ConvUser) => {
    active.value = conv
    loadingMessages.value = true
    messages.value = []
    try {
        messages.value = await $fetch<Message[]>(`/api/messages/${conv.id}`)
        await nextTick()
        if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    } finally {
        loadingMessages.value = false
    }
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !active.value) return
    sending.value = true
    const content = newMessage.value.trim()
    newMessage.value = ''
    try {
        const msg = await $fetch<Message>('/api/messages', {
            method: 'POST',
            body: { receiverId: active.value.id, content },
        })
        messages.value.push(msg)
        // Update conversation preview
        const conv = conversations.value.find(c => c.id === active.value?.id)
        if (conv) { conv.lastMessage = content; conv.lastTime = msg.createdAt }
        await nextTick()
        if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    } catch {
        newMessage.value = content
    } finally {
        sending.value = false
    }
}

const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
