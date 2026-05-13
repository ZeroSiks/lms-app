interface Toast {
    id: number
    message: string
    type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useAppToast() {
    function show(message: string, type: Toast['type'] = 'success', duration = 4000) {
        const id = ++nextId
        toasts.value.push({ id, message, type })
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id)
        }, duration)
    }

    const success = (msg: string) => show(msg, 'success')
    const error = (msg: string) => show(msg, 'error')
    const info = (msg: string) => show(msg, 'info')

    return { toasts: readonly(toasts), success, error, info }
}
