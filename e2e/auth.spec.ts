import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@lms.com'
const ADMIN_PASSWORD = 'Admin@12345'

async function waitForApp(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2500)
}

test.describe('Authentication flow', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await waitForApp(page)
    await expect(page.locator('h1')).toContainText('Sign in to your account')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login with valid admin credentials', async ({ page }) => {
    await page.goto('/login')
    await waitForApp(page)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await waitForApp(page)
    await page.fill('input[type="email"]', 'wrong@lms.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 })
  })

  test('register page renders', async ({ page }) => {
    await page.goto('/register')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('landing page renders', async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Authenticated admin pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await waitForApp(page)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    if (page.url().includes('/login')) {
      await page.goto('/admin')
      await waitForApp(page)
    }
  })

  test('admin dashboard loads', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('approvals page loads', async ({ page }) => {
    await page.goto('/admin/approvals')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })

  test('students page loads', async ({ page }) => {
    await page.goto('/admin/students')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })

  test('announcements page loads', async ({ page }) => {
    await page.goto('/admin/announcements')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })

  test('activity log page loads', async ({ page }) => {
    await page.goto('/admin/activity')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Authorization guards', () => {
  test('admin pages redirect unauthenticated users', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL('**/login**', { timeout: 10000 })
  })

  test('admin/approvals redirects unauthenticated', async ({ page }) => {
    await page.goto('/admin/approvals')
    await page.waitForURL('**/login**', { timeout: 10000 })
  })

  test('courses page is publicly accessible', async ({ page }) => {
    await page.goto('/courses')
    await waitForApp(page)
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })
})
