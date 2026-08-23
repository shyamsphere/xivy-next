import { test, expect } from "@playwright/test"

const password = "supersecret123"

test.describe("accounts", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test("account area redirects anonymous visitors to sign in", async ({
    page,
  }) => {
    await page.goto("/account")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("sign up lands in the account area", async ({ page }) => {
    const email = `pw-signup-${Date.now()}@example.com`

    await page.goto("/signup")
    await page.getByLabel("Full name").fill("Playwright Tester")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: /create account/i }).click()

    // Regression guard: the registration token isn't bound to a customer, so
    // without a token refresh this bounced straight back to /login.
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByText(email)).toBeVisible()
  })

  test("sign in, view empty orders, sign out", async ({ page }) => {
    const email = `pw-login-${Date.now()}@example.com`

    await page.goto("/signup")
    await page.getByLabel("Full name").fill("Returning Buyer")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page).toHaveURL(/\/account$/)

    await page.getByRole("button", { name: /sign out/i }).click()
    await expect(page).toHaveURL("/")

    await page.goto("/login")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: /^sign in$/i }).click()
    await expect(page).toHaveURL(/\/account$/)

    await page.getByRole("link", { name: /^orders$/i }).click()
    await expect(page.getByText(/no orders yet/i)).toBeVisible()
  })

  test("wrong password is rejected", async ({ page }) => {
    const email = `pw-bad-${Date.now()}@example.com`

    await page.goto("/signup")
    await page.getByLabel("Full name").fill("Wrong Pass")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page).toHaveURL(/\/account$/)
    await page.getByRole("button", { name: /sign out/i }).click()
    // wait for sign-out to land, otherwise the session cookie may still be
    // set and /login redirects straight back to /account
    await expect(page).toHaveURL("/")

    await page.goto("/login")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill("totally-wrong-password")
    await page.getByRole("button", { name: /^sign in$/i }).click()

    await expect(page.locator('p[role="alert"]')).toContainText(
      /don't match/i
    )
    await expect(page).toHaveURL(/\/login$/)
  })

  test("an order placed while signed in appears in order history", async ({
    page,
  }) => {
    const email = `pw-order-${Date.now()}@example.com`

    await page.goto("/signup")
    await page.getByLabel("Full name").fill("Order History")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: /create account/i }).click()
    await expect(page).toHaveURL(/\/account$/)

    await page.goto("/products/xivy-silicon-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()
    await expect(page.getByRole("button", { name: /added to cart/i })).toBeVisible()

    await page.goto("/checkout")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Full name").fill("Order History")
    await page.getByLabel("Mobile number").fill("9876543210")
    await page.getByLabel("Address").fill("12 Marine Drive")
    await page.getByLabel("City").fill("Mumbai")
    await page.getByLabel("State").fill("Maharashtra")
    await page.getByLabel("PIN code").fill("400020")
    await page.getByRole("button", { name: /continue to payment/i }).click()
    await page.getByRole("button", { name: /place order/i }).click()
    await expect(page).toHaveURL(/\/order\/confirmed\//)

    await page.goto("/account/orders")
    await expect(page.getByText(/^Order #/).first()).toBeVisible()
    await page.getByRole("link", { name: /view details/i }).first().click()
    await expect(page.getByText("XIVY Silicon Mobile Case")).toBeVisible()
  })
})
