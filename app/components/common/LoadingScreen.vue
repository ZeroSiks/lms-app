<script setup lang="ts">
const visible = ref(true)

onMounted(() => {
    setTimeout(() => {
        visible.value = false
    }, 2000)
})
</script>

<template>
    <Transition name="splash">
        <div
            v-if="visible"
            class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#020B2D] via-[#0A2472] to-[#0033CC] select-none"
        >
            <!-- Dot grid overlay -->
            <div
                class="absolute inset-0 dot-grid opacity-10 pointer-events-none"
            />

            <!-- Logo mark -->
            <div class="relative animate-logo-in mb-6">
                <div
                    class="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                    <span class="text-2xl font-extrabold text-white tracking-tight">
                        Lumify<span class="text-[#0000ff]">.</span>
                    </span>
                </div>
                <!-- Glow ring -->
                <div
                    class="absolute inset-0 rounded-2xl ring-2 ring-white/20 animate-pulse-ring"
                />
            </div>

            <!-- Name + tagline -->
            <p class="text-blue-200 text-base font-medium tracking-wide animate-text-in mb-2">
                Learning Management System
            </p>
            <p class="text-blue-400 text-sm animate-text-in-delay">
                Learn Today. Lead Tomorrow.
            </p>

            <!-- Progress bar -->
            <div class="mt-10 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden animate-text-in">
                <div class="h-full bg-white/60 rounded-full animate-progress" />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.dot-grid {
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.4) 1px,
        transparent 1px
    );
    background-size: 28px 28px;
}

/* Logo box entrance */
@keyframes logoIn {
    from { opacity: 0; transform: scale(0.8) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Text entrance */
@keyframes textIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* Progress bar fill */
@keyframes progress {
    from { width: 0%; }
    to   { width: 100%; }
}

/* Glow ring pulse */
@keyframes pulseRing {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(1.06); }
}

.animate-logo-in {
    animation: logoIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.animate-text-in {
    animation: textIn 0.5s ease-out 0.4s both;
}

.animate-text-in-delay {
    animation: textIn 0.5s ease-out 0.55s both;
}

.animate-progress {
    animation: progress 1.6s ease-in-out 0.5s both;
}

.animate-pulse-ring {
    animation: pulseRing 1.5s ease-in-out infinite;
}

/* Splash screen exit */
.splash-leave-active {
    transition: opacity 0.4s ease-in;
}
.splash-leave-to {
    opacity: 0;
}
</style>
