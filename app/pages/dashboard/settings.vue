<template>
    <div class="p-6 max-w-2xl space-y-6">

        <div>
            <h1 class="text-xl font-bold text-gray-900">Account Settings</h1>
            <p class="text-sm text-gray-400 mt-0.5">Manage your profile and security settings</p>
        </div>

        <!-- Profile card -->
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <h2 class="text-sm font-semibold text-gray-700">Profile Information</h2>

            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#0000ff] to-[#0033CC] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {{ initials }}
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-900">{{ profileForm.firstName }} {{ profileForm.lastName }}</p>
                    <p class="text-xs text-gray-400 capitalize">{{ user?.role?.toLowerCase() }} &bull; {{ user?.email }}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                    <input v-model="profileForm.firstName" type="text"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                    <input v-model="profileForm.lastName" type="text"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                </div>
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5">Bio <span class="text-gray-400 font-normal">(optional)</span></label>
                <textarea v-model="profileForm.bio" rows="3" placeholder="Tell us a bit about yourself..."
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff] resize-none" />
            </div>

            <div v-if="profileError" class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{{ profileError }}</div>

            <button @click="saveProfile" :disabled="savingProfile"
                class="bg-[#0000ff] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0000cc] transition-colors disabled:opacity-60 flex items-center gap-2">
                <div v-if="savingProfile" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
        </div>

        <!-- Password card -->
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <h2 class="text-sm font-semibold text-gray-700">Change Password</h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Current Password</label>
                    <input v-model="passwordForm.current" type="password" placeholder="••••••••"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
                    <input v-model="passwordForm.new" type="password" placeholder="Min. 8 characters"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                    <input v-model="passwordForm.confirm" type="password" placeholder="Repeat new password"
                        class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0000ff]/20 focus:border-[#0000ff]" />
                </div>
            </div>

            <div v-if="passwordError" class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{{ passwordError }}</div>

            <button @click="changePassword" :disabled="savingPassword"
                class="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center gap-2">
                <div v-if="savingPassword" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ savingPassword ? 'Updating...' : 'Update Password' }}
            </button>
        </div>

        <!-- Account info -->
        <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h2 class="text-sm font-semibold text-gray-700 mb-4">Account Information</h2>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Email</span>
                    <span class="text-gray-900 font-medium">{{ user?.email }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Role</span>
                    <span class="text-gray-900 font-medium capitalize">{{ user?.role?.toLowerCase() }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Member since</span>
                    <span class="text-gray-900 font-medium">{{ joinedDate }}</span>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'dashboard' as any, middleware: 'auth' })

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const toast = useAppToast()

const initials = computed(() => {
    if (!user.value) return 'U'
    return `${user.value.firstName[0] ?? ''}${user.value.lastName[0] ?? ''}`.toUpperCase()
})

const profileForm = reactive({
    firstName: user.value?.firstName ?? '',
    lastName: user.value?.lastName ?? '',
    bio: '',
})
const savingProfile = ref(false)
const profileError = ref('')

const passwordForm = reactive({ current: '', new: '', confirm: '' })
const savingPassword = ref(false)
const passwordError = ref('')

const joinedDate = ref('')

onMounted(async () => {
    try {
        const data = await $fetch<{ firstName: string; lastName: string; bio: string | null; createdAt: string }>('/api/user/profile')
        profileForm.firstName = data.firstName
        profileForm.lastName = data.lastName
        profileForm.bio = data.bio ?? ''
        joinedDate.value = new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch { /* use store data as fallback */ }
})

const saveProfile = async () => {
    profileError.value = ''
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
        profileError.value = 'First and last name are required.'
        return
    }
    savingProfile.value = true
    try {
        const updated = await $fetch<{ firstName: string; lastName: string; role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'; email: string; id: number }>('/api/user/profile', {
            method: 'PUT',
            body: { firstName: profileForm.firstName, lastName: profileForm.lastName, bio: profileForm.bio },
        })
        auth.setAuth({ ...updated }, auth.accessToken ?? '')
        toast.success('Profile updated successfully.')
    } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        profileError.value = e.data?.message ?? 'Failed to save changes.'
    } finally {
        savingProfile.value = false
    }
}

const changePassword = async () => {
    passwordError.value = ''
    if (!passwordForm.current) { passwordError.value = 'Enter your current password.'; return }
    if (passwordForm.new.length < 8) { passwordError.value = 'New password must be at least 8 characters.'; return }
    if (passwordForm.new !== passwordForm.confirm) { passwordError.value = 'Passwords do not match.'; return }

    savingPassword.value = true
    try {
        await $fetch('/api/user/password', {
            method: 'PUT',
            body: { currentPassword: passwordForm.current, newPassword: passwordForm.new },
        })
        passwordForm.current = ''
        passwordForm.new = ''
        passwordForm.confirm = ''
        toast.success('Password updated successfully.')
    } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        passwordError.value = e.data?.message ?? 'Failed to update password.'
    } finally {
        savingPassword.value = false
    }
}
</script>
