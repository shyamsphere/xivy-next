import { test, expect } from "@playwright/test"

const ADDRESS = {
  first_name: "Playwright Buyer",
  phone: "9876543210",
  address_1: "12 Marine Drive, Churchgate",
  city: "Mumbai",
  province: "Maharashtra",
  postal_code: "400020",
}

async function fillDelivery(page: import("@playwright/test").Page, email: string) {
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Full name").fill(ADDRESS.first_name)
  await page.getByLabel("Mobile number").fill(ADDRESS.phone)
  await page.getByLabel("Address").fill(ADDRESS.address_1)
  await page.getByLabel("City").fill(ADDRESS.city)
  await page.getByLabel("State").fill(ADDRESS.province)
  await page.getByLabel("PIN code").fill(ADDRESS.postal_code)
  await page.getByRole("button", { name: /continue to payment/i }).click()
}

test.describe("purchase path", () => {
  test("browse → add to cart → COD checkout → order confirmed", async ({
    page,
  }) => {
    await page.goto("/products/xivy-silicon-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()
    await expect(page.getByRole("button", { name: /added to cart/i })).toBeVisible()

    await page.goto("/cart")
    await expect(page.getByText("XIVY Silicon Mobile Case")).toBeVisible()
    // ₹349 is under the ₹999 threshold, so delivery is charged
    await expect(page.getByText("₹349").first()).toBeVisible()

    await page.getByRole("link", { name: /^checkout$/i }).click()
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible()

    await fillDelivery(page, `pw-${Date.now()}@example.com`)

    // delivery saved → payment step unlocks
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

  test("free delivery applies above ₹999", async ({ page }) => {
    await page.goto("/products/xivy-rugged-armor-case")
    // ₹399 × 3 = ₹1197, over the threshold
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /^add to cart$/i }).click()
      await expect(
        page.getByRole("button", { name: /added to cart/i })
      ).toBeVisible()
      await page.waitForTimeout(2600) // let the button reset
    }

    await page.goto("/checkout")
    await fillDelivery(page, `pw-free-${Date.now()}@example.com`)
    await expect(page.getByText(/free/i).first()).toBeVisible()
  })

  test("checkout redirects to the cart when there is nothing to buy", async ({
    page,
  }) => {
    await page.context().clearCookies()
    await page.goto("/checkout")
    await expect(page).toHaveURL(/\/cart$/)
  })

  test("invalid PIN code is rejected before payment", async ({ page }) => {
    await page.goto("/products/xivy-transparent-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()
    await expect(page.getByRole("button", { name: /added to cart/i })).toBeVisible()

    await page.goto("/checkout")
    await page.getByLabel("Email").fill("bad-pin@example.com")
    await page.getByLabel("Full name").fill(ADDRESS.first_name)
    await page.getByLabel("Mobile number").fill(ADDRESS.phone)
    await page.getByLabel("Address").fill(ADDRESS.address_1)
    await page.getByLabel("City").fill(ADDRESS.city)
    await page.getByLabel("State").fill(ADDRESS.province)
    await page.getByLabel("PIN code").fill("12") // too short
    await page.getByRole("button", { name: /continue to payment/i }).click()

    await expect(page.locator('p[role="alert"]')).toContainText(
      /6 digit PIN/i
    )
  })
})
