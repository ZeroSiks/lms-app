
<template>
    <div>

        <!-- ── Hero ─────────────────────────────────────────────── -->
        <section
            class="relative overflow-hidden bg-gradient-to-br from-[#020B2D] via-[#0A2472] to-[#0033CC] text-white"
        >
            <!-- Dot grid overlay -->
            <div class="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

            <!-- Floating blurred orbs -->
            <div
                class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#0000ff] opacity-20 blur-3xl pointer-events-none"
            />
            <div
                class="absolute -bottom-24 -left-24 w-[350px] h-[350px] rounded-full bg-[#0033cc] opacity-25 blur-3xl pointer-events-none"
            />

            <!-- Content -->
            <div
                class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center"
            >
                <span
                    class="inline-block text-xs font-semibold uppercase tracking-widest text-blue-300 border border-blue-400 rounded-full px-4 py-1 mb-8 animate-fade-in"
                >
                    Your University Learning Platform
                </span>

                <h1
                    class="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up"
                >
                    Learn Today.<br />
                    <span class="text-blue-300">Lead Tomorrow.</span>
                </h1>

                <p
                    class="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 animate-fade-up-delay"
                >
                    Everything you need to learn, grow, and succeed — all in
                    one place. Built for students and educators alike.
                </p>

                <div
                    class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-2"
                >
                    <NuxtLink
                        to="/register"
                        class="inline-flex items-center justify-center gap-2 bg-white text-[#0000ff] font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Get Started <ArrowRight :size="18" />
                    </NuxtLink>
                    <NuxtLink
                        to="/courses"
                        class="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-lg hover:border-white hover:bg-white/10 transition-all duration-200"
                    >
                        Browse Courses
                    </NuxtLink>
                </div>
            </div>

            <!-- Wave divider -->
            <div class="relative h-16">
                <svg
                    class="absolute bottom-0 w-full"
                    viewBox="0 0 1440 64"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>

        <!-- ── Features ──────────────────────────────────────────── -->
        <section class="bg-white py-24 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto">
                <p
                    class="text-center text-xs font-semibold uppercase tracking-widest text-[#0000ff] mb-3"
                >
                    What we offer
                </p>
                <h2
                    class="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14"
                >
                    Everything you need to succeed
                </h2>

                <div class="grid md:grid-cols-3 gap-8">
                    <div
                        v-for="feature in features"
                        :key="feature.title"
                        class="group bg-[#f0f5ff] border border-blue-100 p-8 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
                    >
                        <div
                            class="w-14 h-14 bg-[#0000ff] rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300"
                        >
                            <component
                                :is="feature.icon"
                                :size="26"
                                class="text-white"
                            />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">
                            {{ feature.title }}
                        </h3>
                        <p class="text-gray-500 text-sm leading-relaxed">
                            {{ feature.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Our Pillars ───────────────────────────────────────── -->
        <section class="bg-[#f8fafc] py-24 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto">
                <p
                    class="text-center text-xs font-semibold uppercase tracking-widest text-[#0000ff] mb-3"
                >
                    What we stand for
                </p>
                <h2
                    class="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14"
                >
                    Our Pillars
                </h2>

                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                        v-for="pillar in pillars"
                        :key="pillar.title"
                        class="group bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
                    >
                        <div
                            class="w-11 h-11 bg-[#eff6ff] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0000ff] transition-colors duration-300"
                        >
                            <component
                                :is="pillar.icon"
                                :size="20"
                                class="text-[#0000ff] group-hover:text-white transition-colors duration-300"
                            />
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">
                            {{ pillar.title }}
                        </h3>
                        <p class="text-gray-500 text-sm leading-relaxed">
                            {{ pillar.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Stats ─────────────────────────────────────────────── -->
        <section
            class="bg-gradient-to-r from-[#020B2D] to-[#0A2472] text-white py-20 px-4 sm:px-6 lg:px-8"
        >
            <div
                class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center"
            >
                <div v-for="stat in stats" :key="stat.label">
                    <p class="text-4xl sm:text-5xl font-extrabold mb-1">
                        {{ stat.value }}
                    </p>
                    <p class="text-blue-300 text-sm font-medium">
                        {{ stat.label }}
                    </p>
                </div>
            </div>
        </section>

        <!-- ── Footer CTA ────────────────────────────────────────── -->
        <section class="bg-white py-24 px-4 sm:px-6 lg:px-8 text-center">
            <div class="max-w-2xl mx-auto">
                <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Ready to start learning?
                </h2>
                <p class="text-gray-500 text-lg mb-10">
                    Join thousands of students already growing their futures
                    through our platform.
                </p>
                <NuxtLink
                    to="/register"
                    class="inline-flex items-center gap-2 bg-[#0000ff] text-white font-semibold px-10 py-3 rounded-lg hover:bg-[#0000cc] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    Create an Account <ArrowRight :size="18" />
                </NuxtLink>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import {
    GraduationCap,
    BarChart3,
    Award,
    Star,
    ShieldCheck,
    Lightbulb,
    Users,
    ArrowRight,
} from 'lucide-vue-next'

definePageMeta({ layout: 'landing' })

const features = [
    {
        icon: GraduationCap,
        title: 'Learn Online',
        description:
            'Access your courses anytime, anywhere — on any device, at your own pace.',
    },
    {
        icon: BarChart3,
        title: 'Track Progress',
        description:
            'Stay on top of your learning journey with real-time progress insights.',
    },
    {
        icon: Award,
        title: 'Get Certified',
        description:
            'Earn recognised certificates that validate your skills and hard work.',
    },
]

const pillars = [
    {
        icon: Star,
        title: 'Excellence',
        description:
            'Committed to the highest academic standards in everything we do.',
    },
    {
        icon: ShieldCheck,
        title: 'Integrity',
        description:
            'Fostering honesty, transparency, and ethical responsibility.',
    },
    {
        icon: Lightbulb,
        title: 'Innovation',
        description:
            'Embracing technology to shape the leaders of tomorrow.',
    },
    {
        icon: Users,
        title: 'Community',
        description:
            'An inclusive space where every learner is valued and heard.',
    },
]

const stats = [
    { value: '500+', label: 'Courses Available' },
    { value: '10k+', label: 'Students Enrolled' },
    { value: '200+', label: 'Expert Instructors' },
    { value: '98%', label: 'Satisfaction Rate' },
]
</script>

<style scoped>
.dot-grid {
    background-image: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.4) 1px,
        transparent 1px
    );
    background-size: 28px 28px;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
}

.animate-fade-up {
    animation: fadeUp 0.7s ease-out 0.1s both;
}

.animate-fade-up-delay {
    animation: fadeUp 0.7s ease-out 0.25s both;
}

.animate-fade-up-delay-2 {
    animation: fadeUp 0.7s ease-out 0.4s both;
}
</style>
