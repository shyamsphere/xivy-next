import { test, expect, type Page } from "@playwright/test"

const ADDRESS = {
  first_name: "Playwright Buyer",
  phone: "9876543210",
  address_1: "12 Marine Drive, Churchgate",
  city: "Mumbai",
  province: "Maharashtra",
  postal_code: "400020",
}

async function fillDelivery(page: Page, email: string) {
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Full name").fill(ADDRESS.first_name)
  await page.getByLabel("Mobile number").fill(ADDRESS.phone)
  await page.getByLabel("Address").fill(ADDRESS.address_1)
  await page.getByLabel("City").fill(ADDRESS.city)
  await page.getByLabel("State").fill(ADDRESS.province)
  await page.getByLabel("PIN code").fill(ADDRESS.postal_code)
  await page.getByRole("button", { name: /continue to payment/i }).click()
}

/**
 * Adding from a product page slides the drawer open over the page. Radix
 * marks content behind a modal aria-hidden, so anything asserted afterwards
 * must be scoped to the drawer (or the drawer closed first).
 */
async function addFromProductPage(page: Page, handle: string) {
  await page.goto(`/products/${handle}`)
  await page.getByRole("button", { name: /^add to cart$/i }).click()
  const drawer = page.getByRole("dialog")
  await expect(drawer).toBeVisible()
  return drawer
}

test.describe("purchase path", () => {
  test("adding from a product page opens the cart drawer", async ({ page }) => {
    await page.context().clearCookies()
    const drawer = await addFromProductPage(page, "xivy-silicon-mobile-case")

    await expect(drawer.getByText("XIVY Silicon Mobile Case")).toBeVisible()
    await expect(drawer.getByText("₹349").first()).toBeVisible()
    await expect(drawer.getByRole("link", { name: /^checkout$/i })).toBeVisible()
  })

  test("adding from a product card opens the drawer too", async ({ page }) => {
    await page.context().clearCookies()
    // Cards only add directly when the phone is known, i.e. a filtered listing
    await page.goto("/products?device=apple-iphone-16-pro")
    // cards name the phone they add for, e.g. "Add iPhone 16 Pro to cart"
    await page
      .getByRole("button", { name: /add .* to cart/i })
      .first()
      .click()

    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole("button", { name: /^remove$/i })).toBeVisible()
  })

  test("browse → add to cart → COD checkout → order confirmed", async ({
    page,
  }) => {
    await page.context().clearCookies()
    const drawer = await addFromProductPage(page, "xivy-silicon-mobile-case")

    // straight from the drawer, as a shopper would
    await drawer.getByRole("link", { name: /^checkout$/i }).click()
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible()

    await fillDelivery(page, `pw-${Date.now()}@example.com`)

    await expect(
      page.getByText("Cash on delivery", { exact: true })
    ).toBeVisible()
    // scoped: the footer also mentions Mumbai
    await expect(
      page.getByText(`${ADDRESS.city}, ${ADDRESS.province}`).first()
    ).toBeVisible()

    await page.getByRole("button", { name: /place order/i }).click()

    await expect(page).toHaveURL(/\/order\/confirmed\//)
    await expect(
      page.getByRole("heading", { name: /order confirmed/i })
    ).toBeVisible()
    await expect(page.getByText("XIVY Silicon Mobile Case")).toBeVisible()
  })

  test("cart empties after a completed order", async ({ page }) => {
    await page.goto("/cart")
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })

  test("quantity can be changed on the checkout summary", async ({ page }) => {
    await page.context().clearCookies()
    const drawer = await addFromProductPage(page, "xivy-rugged-armor-case")
    await drawer.getByRole("link", { name: /^checkout$/i }).click()

    const summary = page.getByRole("complementary")
    await expect(summary.getByText("₹399").first()).toBeVisible()

    await summary.getByRole("button", { name: /increase quantity/i }).click()
    await expect(summary.getByText("₹798").first()).toBeVisible()

    await summary.getByRole("button", { name: /decrease quantity/i }).click()
    await expect(summary.getByText("₹399").first()).toBeVisible()
  })

  test("free delivery applies above ₹999", async ({ page }) => {
    await page.context().clearCookies()
    // ₹399 × 3 = ₹1197, over the threshold. Raise the quantity in the drawer
    // rather than re-clicking the page button, which the modal hides.
    const drawer = await addFromProductPage(page, "xivy-rugged-armor-case")
    await drawer.getByRole("button", { name: /increase quantity/i }).click()
    await expect(drawer.getByText("₹798")).toBeVisible()
    await drawer.getByRole("button", { name: /increase quantity/i }).click()
    await expect(drawer.getByText("₹1,197")).toBeVisible()

    await drawer.getByRole("link", { name: /^checkout$/i }).click()
    await fillDelivery(page, `pw-free-${Date.now()}@example.com`)

    const summary = page.getByRole("complementary")
    await expect(summary.getByText("Free").first()).toBeVisible()
  })

  test("checkout redirects to the cart when there is nothing to buy", async ({
    page,
  }) => {
    await page.context().clearCookies()
    await page.goto("/checkout")
    await expect(page).toHaveURL(/\/cart$/)
  })

  test("invalid PIN code is rejected before payment", async ({ page }) => {
    await page.context().clearCookies()
    const drawer = await addFromProductPage(
      page,
      "xivy-transparent-mobile-case"
    )
    await drawer.getByRole("link", { name: /^checkout$/i }).click()

    await page.getByLabel("Email").fill("bad-pin@example.com")
    await page.getByLabel("Full name").fill(ADDRESS.first_name)
    await page.getByLabel("Mobile number").fill(ADDRESS.phone)
    await page.getByLabel("Address").fill(ADDRESS.address_1)
    await page.getByLabel("City").fill(ADDRESS.city)
    await page.getByLabel("State").fill(ADDRESS.province)
    await page.getByLabel("PIN code").fill("12") // too short
    await page.getByRole("button", { name: /continue to payment/i }).click()

    await expect(page.locator('p[role="alert"]')).toContainText(/6 digit PIN/i)
  })
})
