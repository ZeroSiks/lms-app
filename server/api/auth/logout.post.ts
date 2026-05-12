export default defineEventHandler((event) => {
    deleteCookie(event, 'refresh_token', { httpOnly: true, path: '/' })
    return { ok: true }
})
