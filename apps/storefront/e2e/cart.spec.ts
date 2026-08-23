import { test, expect } from "@playwright/test"

test.describe("cart drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test("starts empty", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /^cart, 0 items$/i }).click()
    const drawer = page.getByRole("dialog")
    await expect(drawer.getByText(/your cart is empty/i)).toBeVisible()
  })

  test("badge counts items and quantity controls work", async ({ page }) => {
    await page.goto("/products/xivy-crystal-clear-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()
    await expect(page.getByRole("button", { name: /added to cart/i })).toBeVisible()

    // wait for the badge to reflect the new line before opening the drawer
    const trigger = page.getByRole("button", { name: /^cart, 1 item$/i })
    await expect(trigger).toBeVisible()
    await trigger.click()

    // Scoped to the dialog: the product title also appears in the page
    // heading behind it.
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText(/loading/i)).toBeHidden()
    await expect(
      drawer.getByText("XIVY Crystal Clear Mobile Case")
    ).toBeVisible()
    await expect(drawer.getByText("₹299").first()).toBeVisible()

    await drawer.getByRole("button", { name: /increase quantity/i }).click()
    await expect(drawer.getByText("₹598")).toBeVisible()

    await drawer.getByRole("button", { name: /^remove$/i }).click()
    await expect(drawer.getByText(/your cart is empty/i)).toBeVisible()
  })

  test("closes with Escape", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /^cart, 0 items$/i }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toBeHidden()
  })
})

test.describe("phone picker", () => {
  test("picking a model filters the catalog and is remembered", async ({
    page,
  }) => {
    await page.context().clearCookies()
    await page.goto("/products")

    await page.getByRole("button", { name: /find your phone/i }).first().click()
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Apple" }).click()
    await dialog.getByRole("button", { name: "iPhone 16 Pro", exact: true }).click()

    await expect(page).toHaveURL(/device=apple-iphone-16-pro/)

    // the choice is remembered on a later visit
    await page.goto("/")
    await expect(
      page.getByRole("button", { name: /iPhone 16 Pro/i }).first()
    ).toBeVisible()
  })
})
