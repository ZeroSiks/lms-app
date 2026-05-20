import { test, expect } from '@playwright/test'

test.describe('Authentication flow', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login with valid admin credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@lms.com')
    await page.fill('input[type="password"]', 'Admin@12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin**', { timeout: 10000 })
    await expect(page.locator('h1')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@lms.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    await expect(page.locator('.text-red-600, .bg-red-50')).toBeVisible({ timeout: 5000 })
  })

  test('register page renders', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Create')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="First"]')).toBeVisible()
  })

  test('landing page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Lumify')).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Authenticated navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@lms.com')
    await page.fill('input[type="password"]', 'Admin@12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin**', { timeout: 10000 })
  })

  test('admin dashboard loads with stats', async ({ page }) => {
    await expect(page.locator('text=Overview')).toBeVisible()
  })

  test('approvals page loads', async ({ page }) => {
    await page.goto('/admin/approvals')
    await expect(page.locator('h1')).toContainText('Approvals')
  })

  test('students page loads', async ({ page }) => {
    await page.goto('/admin/students')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('announcements page loads', async ({ page }) => {
    await page.goto('/admin/announcements')
    await expect(page.locator('h1')).toContainText('Announcements')
  })

  test('activity log page loads', async ({ page }) => {
    await page.goto('/admin/activity')
    await expect(page.locator('h1')).toContainText('Activity')
  })
})

test.describe('Authorization guards', () => {
  test('admin pages redirect unauthenticated users', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL('**/login**', { timeout: 5000 })
  })

  test('admin pages redirect unauthenticated from approvals', async ({ page }) => {
    await page.goto('/admin/approvals')
    await page.waitForURL('**/login**', { timeout: 5000 })
  })

  test('courses page is publicly accessible', async ({ page }) => {
    await page.goto('/courses')
    await expect(page.locator('h1')).toBeVisible({ timeout: 8000 })
  })
})
