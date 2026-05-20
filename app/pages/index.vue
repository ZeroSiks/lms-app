<template>
    <div class="bg-[#050a18] min-h-screen">

        <!-- ── Nav ─────────────────────────────────────────────── -->
        <nav class="relative z-30 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 bg-[#0000ff] rounded-lg flex items-center justify-center">
                    <span class="text-white font-black text-sm">L</span>
                </div>
                <span class="text-white font-extrabold text-lg tracking-tight">Lumify<span class="text-[#4466ff]">.</span></span>
            </div>
            <div class="flex items-center gap-3">
                <NuxtLink to="/login" class="text-sm text-white/60 hover:text-white transition-colors font-medium px-4 py-2">Sign in</NuxtLink>
                <NuxtLink to="/register" class="text-sm bg-[#0000ff] hover:bg-[#0000cc] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                    Register
                </NuxtLink>
            </div>
        </nav>

        <!-- ── Hero ─────────────────────────────────────────────── -->
        <section class="relative overflow-hidden">
            <!-- Mesh gradient orbs -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#0000ff] opacity-[0.12] blur-[120px] pointer-events-none" />
            <div class="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-purple-600 opacity-[0.08] blur-[100px] pointer-events-none" />
            <div class="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-cyan-500 opacity-[0.06] blur-[100px] pointer-events-none" />
            <div class="absolute inset-0 grid-overlay opacity-[0.04] pointer-events-none" />

            <div class="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <!-- Term badge -->
                <div class="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
                    <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span class="text-xs font-medium text-white/70">Spring 2026 &nbsp;·&nbsp; Enrollment is open</span>
                </div>

                <!-- Headline -->
                <h1 class="text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight text-white mb-6 animate-fade-up">
                    Your campus.<br />
                    <span class="gradient-text">Your courses.</span>
                </h1>

                <p class="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-delay">
                    Lumify is your university's digital learning home. Access your courses, submit assignments, track your progress, and stay connected with your instructors — all in one place.
                </p>

                <!-- CTAs -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up-delay-2">
                    <NuxtLink to="/login"
                        class="inline-flex items-center justify-center gap-2 bg-[#0000ff] hover:bg-[#1a1aff] text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(0,0,255,0.3)] hover:shadow-[0_0_40px_rgba(0,0,255,0.5)]">
                        Sign in to your account <ArrowRight :size="16" />
                    </NuxtLink>
                    <NuxtLink to="/register"
                        class="inline-flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200">
                        New student? Register here
                    </NuxtLink>
                </div>

                <!-- Dashboard preview card -->
                <div class="relative mx-auto max-w-4xl animate-fade-up-delay-3">
                    <div class="rounded-2xl bg-white/5 border border-white/10 p-1 shadow-[0_0_80px_rgba(0,0,255,0.1)]">
                        <div class="rounded-xl bg-[#0a0f1f] border border-white/8 overflow-hidden">
                            <div class="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-white/3">
                                <div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                                <div class="flex-1 mx-4 h-5 bg-white/5 rounded-md"></div>
                            </div>
                            <div class="flex h-44 sm:h-56">
                                <div class="w-40 bg-[#020B2D] flex-shrink-0 p-3 space-y-1.5">
                                    <div class="h-7 bg-[#0000ff] rounded-md opacity-90"></div>
                                    <div class="h-5 bg-white/5 rounded-md"></div>
                                    <div class="h-5 bg-white/5 rounded-md"></div>
                                    <div class="h-5 bg-white/5 rounded-md"></div>
                                    <div class="h-5 bg-white/5 rounded-md"></div>
                                </div>
                                <div class="flex-1 p-4 space-y-3">
                                    <div class="grid grid-cols-3 gap-2">
                                        <div class="h-14 bg-white/4 rounded-xl border border-white/6"></div>
                                        <div class="h-14 bg-[#0000ff]/15 rounded-xl border border-[#0000ff]/20"></div>
                                        <div class="h-14 bg-white/4 rounded-xl border border-white/6"></div>
                                    </div>
                                    <div class="h-4 bg-white/6 rounded-md w-3/4"></div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="h-16 bg-white/4 rounded-xl border border-white/6"></div>
                                        <div class="h-16 bg-white/4 rounded-xl border border-white/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[#0000ff] opacity-[0.15] blur-3xl rounded-full pointer-events-none"></div>
                </div>
            </div>
        </section>

        <!-- ── Live courses this term ────────────────────────────── -->
        <section class="py-24 px-6 border-t border-white/6">
            <div class="max-w-7xl mx-auto">
                <div class="flex items-end justify-between gap-4 mb-10">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-widest text-[#4466ff] mb-2">Spring 2026</p>
                        <h2 class="text-3xl sm:text-4xl font-black text-white leading-tight">Courses available<br /><span class="text-white/40">this term</span></h2>
                    </div>
                    <NuxtLink to="/courses" class="text-sm text-[#4466ff] hover:text-white font-medium transition-colors whitespace-nowrap flex items-center gap-1.5">
                        View all <ArrowRight :size="14" />
                    </NuxtLink>
                </div>

                <!-- Loading -->
                <div v-if="loadingCourses" class="grid md:grid-cols-3 gap-5">
                    <div v-for="i in 3" :key="i" class="h-48 rounded-2xl bg-white/3 border border-white/8 animate-pulse"></div>
                </div>

                <!-- Empty -->
                <div v-else-if="courses.length === 0" class="rounded-2xl bg-white/3 border border-white/8 p-12 text-center">
                    <BookOpen :size="36" class="text-white/20 mx-auto mb-3" />
                    <p class="text-white/40 text-sm">No courses published yet — check back soon.</p>
                </div>

                <!-- Course grid -->
                <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div
                        v-for="course in courses.slice(0, 6)"
                        :key="course.id"
                        class="group rounded-2xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-white/15 transition-all duration-300 p-6 flex flex-col"
                    >
                        <div class="flex items-start justify-between gap-3 mb-4">
                            <div class="w-10 h-10 bg-[#0000ff]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BookOpen :size="18" class="text-[#4466ff]" />
                            </div>
                            <span class="text-xs font-mono text-white/35 bg-white/5 px-2 py-1 rounded-md">{{ course.code }}</span>
                        </div>
                        <h3 class="text-sm font-bold text-white leading-snug mb-1.5 group-hover:text-[#4466ff] transition-colors">{{ course.title }}</h3>
                        <p class="text-xs text-white/35 leading-relaxed line-clamp-2 flex-1 mb-4">{{ course.description }}</p>
                        <div class="flex items-center justify-between pt-4 border-t border-white/6">
                            <div v-if="course.User" class="flex items-center gap-2">
                                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-[#0000ff] to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                    {{ course.User.firstName[0] }}
                                </div>
                                <span class="text-xs text-white/40">{{ course.User.firstName }} {{ course.User.lastName }}</span>
                            </div>
                            <span v-if="course.duration" class="text-xs text-white/30 flex items-center gap-1 ml-auto">
                                <Clock :size="11" /> {{ course.duration }}
                            </span>
                        </div>
                    </div>
                </div>

                <p class="text-center text-sm text-white/30 mt-8">
                    <NuxtLink to="/login" class="text-[#4466ff] hover:underline font-medium">Sign in</NuxtLink>
                    &nbsp;or&nbsp;
                    <NuxtLink to="/register" class="text-[#4466ff] hover:underline font-medium">create an account</NuxtLink>
                    &nbsp;to enroll in a course.
                </p>
            </div>
        </section>

        <!-- ── Student / Faculty cards ───────────────────────────── -->
        <section class="py-24 px-6 border-t border-white/6">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl sm:text-4xl font-black text-white">Who is Lumify for?</h2>
                    <p class="text-white/40 text-sm mt-3 max-w-xl mx-auto">Whether you're here to learn or to teach, Lumify gives you everything you need — without the clutter.</p>
                </div>

                <div class="grid lg:grid-cols-2 gap-8">
                    <!-- Students -->
                    <div class="rounded-2xl bg-gradient-to-br from-[#0000ff]/20 to-[#0000ff]/5 border border-[#0000ff]/25 p-8">
                        <div class="w-10 h-10 bg-[#0000ff] rounded-xl flex items-center justify-center mb-5">
                            <GraduationCap :size="18" class="text-white" />
                        </div>
                        <h3 class="text-xl font-black text-white mb-2">I'm a student</h3>
                        <p class="text-white/50 text-sm mb-6 leading-relaxed">Enroll in your courses, complete lessons at your own pace, submit your assignments, and see how you're progressing through the semester.</p>
                        <ul class="space-y-2.5 mb-7">
                            <li v-for="item in studentPoints" :key="item" class="flex items-center gap-2.5 text-sm text-white/70">
                                <div class="w-5 h-5 rounded-full bg-[#0000ff]/30 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-3 h-3 text-[#4466ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                                </div>
                                {{ item }}
                            </li>
                        </ul>
                        <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-[#0000ff] hover:bg-[#0000cc] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                            Get started <ArrowRight :size="14" />
                        </NuxtLink>
                    </div>

                    <!-- Faculty -->
                    <div class="rounded-2xl bg-gradient-to-br from-purple-600/15 to-purple-600/5 border border-purple-500/20 p-8">
                        <div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mb-5">
                            <BookOpen :size="18" class="text-white" />
                        </div>
                        <h3 class="text-xl font-black text-white mb-2">I'm faculty</h3>
                        <p class="text-white/50 text-sm mb-6 leading-relaxed">Build your course content, set assignments with deadlines, grade student work, and keep track of how your class is doing — all from your instructor dashboard.</p>
                        <ul class="space-y-2.5 mb-7">
                            <li v-for="item in facultyPoints" :key="item" class="flex items-center gap-2.5 text-sm text-white/70">
                                <div class="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                                </div>
                                {{ item }}
                            </li>
                        </ul>
                        <NuxtLink to="/register" class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                            Request access <ArrowRight :size="14" />
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <!-- ── Final CTA ─────────────────────────────────────────── -->
        <section class="py-28 px-6 text-center border-t border-white/6">
            <div class="max-w-xl mx-auto">
                <div class="w-16 h-16 bg-[#0000ff] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,0,255,0.4)]">
                    <span class="text-white font-black text-2xl">L</span>
                </div>
                <h2 class="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                    Already enrolled?
                </h2>
                <p class="text-white/45 text-base mb-8">Sign in and pick up right where you left off.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <NuxtLink to="/login"
                        class="inline-flex items-center justify-center gap-2 bg-[#0000ff] hover:bg-[#1a1aff] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 text-base shadow-[0_0_40px_rgba(0,0,255,0.3)] hover:shadow-[0_0_60px_rgba(0,0,255,0.5)]">
                        Sign in <ArrowRight :size="18" />
                    </NuxtLink>
                    <NuxtLink to="/register"
                        class="inline-flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/10 text-white font-medium px-10 py-4 rounded-xl transition-all duration-200 text-base">
                        New here? Register
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- ── Footer ────────────────────────────────────────────── -->
        <footer class="border-t border-white/6 py-8 px-6">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-[#0000ff] rounded-md flex items-center justify-center">
                        <span class="text-white font-black text-xs">L</span>
                    </div>
                    <span class="text-white/40 text-sm font-medium">Lumify</span>
                </div>
                <p class="text-white/25 text-xs">© {{ new Date().getFullYear() }} Lumify. All rights reserved.</p>
            </div>
        </footer>

    </div>
</template>

<script setup lang="ts">
import { GraduationCap, BookOpen, ArrowRight, Clock } from 'lucide-vue-next'

definePageMeta({ layout: false })

useHead({
  bodyAttrs: {
    style: 'background-color: #050a18'
  }
})

interface Course {
    id: number; title: string; description: string; code: string
    duration: string | null
    User: { firstName: string; lastName: string } | null
}

const courses = ref<Course[]>([])
const loadingCourses = ref(true)

onMounted(async () => {
    try {
        courses.value = await $fetch<Course[]>('/api/courses')
    } catch { /* non-fatal */ } finally {
        loadingCourses.value = false
    }
})

const studentPoints = [
    'Browse and enroll in courses each semester',
    'Follow structured lessons at your own pace',
    'Submit text and file-based assignments',
    'Receive grades and feedback from your instructor',
    'Message your instructor directly',
]

const facultyPoints = [
    'Organise your course into modules and lessons',
    'Set assignments with due dates and point values',
    'Review and grade student submissions',
    'Monitor individual student progress',
    'Message students directly from the platform',
]
</script>

<style scoped>
.gradient-text {
    background: linear-gradient(135deg, #4488ff 0%, #a855f7 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.grid-overlay {
    background-image:
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
.animate-fade-up { animation: fadeUp 0.7s ease-out 0.1s both; }
.animate-fade-up-delay { animation: fadeUp 0.7s ease-out 0.25s both; }
.animate-fade-up-delay-2 { animation: fadeUp 0.7s ease-out 0.4s both; }
.animate-fade-up-delay-3 { animation: fadeUp 0.7s ease-out 0.55s both; }
</style>
