<template>
    <div>
        <form class="space-y-6" @submit.prevent="handleRegister">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label
                        for="firstName"
                        class="block text-sm font-medium text-gray-700"
                    >
                        First Name
                    </label>
                    <div class="mt-1">
                        <input
                            id="firstName"
                            v-model="form.firstName"
                            type="text"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="lastName"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Last Name
                    </label>
                    <div class="mt-1">
                        <input
                            id="lastName"
                            v-model="form.lastName"
                            type="text"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label
                    for="email"
                    class="block text-sm font-medium text-gray-700"
                >
                    Email address
                </label>
                <div class="mt-1">
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <div class="mt-1">
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label
                    for="role"
                    class="block text-sm font-medium text-gray-700"
                >
                    Register as
                </label>
                <div class="mt-1">
                    <select
                        id="role"
                        v-model="form.role"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                    </select>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Register
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "auth",
});

const form = reactive({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
});

const handleRegister = () => {
    // TODO: Implement registration
    console.log("Register:", form);
};
</script>
