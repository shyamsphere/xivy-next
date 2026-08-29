import { test, expect, type Locator } from "@playwright/test"

test.describe("interaction affordances", () => {
  test("buttons show a pointer cursor", async ({ page }) => {
    await page.goto("/products?device=apple-iphone-16-pro")

    const cursorOf = (loc: Locator) =>
      loc.first().evaluate((el) => getComputedStyle(el).cursor)

    // Tailwind v4's preflight leaves buttons at the default cursor, so this
    // guards the base rule that restores the pointer.
    expect(await cursorOf(page.getByRole("button", { name: /^cart/i }))).toBe(
      "pointer"
    )
    expect(
      await cursorOf(page.getByRole("button", { name: /add .* to cart/i }))
    ).toBe("pointer")

    await page.getByRole("button", { name: /add .* to cart/i }).first().click()
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()

    for (const name of [/increase quantity/i, /^remove$/i, /close cart/i]) {
      expect(await cursorOf(drawer.getByRole("button", { name }))).toBe(
        "pointer"
      )
    }
  })

  test("cart item name links through to the product", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/products/xivy-silicon-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()

    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await drawer.getByRole("link", { name: "XIVY Silicon Mobile Case" }).click()

    await expect(page).toHaveURL(/\/products\/xivy-silicon-mobile-case$/)
    await expect(page.getByRole("dialog")).toBeHidden()
  })
})

test.describe("remembered phone", () => {
  test("cards add for the remembered phone with no URL param", async ({
    page,
  }) => {
    await page.context().clearCookies()
    await page.goto("/products")
    await page.getByRole("button", { name: /find your phone/i }).first().click()
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Apple" }).click()
    await dialog
      .getByRole("button", { name: "iPhone 16 Pro", exact: true })
      .click()
    await expect(page).toHaveURL(/device=apple-iphone-16-pro/)

    // Regression guard: the choice used to be forgotten on any page without
    // ?device=, so every card fell back to "Choose phone" after a refresh.
    for (const url of ["/", "/products"]) {
      await page.goto(url)
      await page.reload()
      await expect(
        page.getByRole("button", { name: /add iphone 16 pro to cart/i }).first()
      ).toBeVisible()
      await expect(
        page.getByRole("link", { name: /choose phone/i })
      ).toHaveCount(0)
    }

    // and it adds the variant for that phone
    await page
      .getByRole("button", { name: /add iphone 16 pro to cart/i })
      .first()
      .click()
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText("iPhone 16 Pro")).toBeVisible()
  })

  test("with no phone chosen, cards ask you to choose", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/products")
    await expect(
      page.getByRole("link", { name: /choose phone/i }).first()
    ).toBeVisible()
  })
})

test.describe("product imagery and variant preselect", () => {
  test("a single-image card stays visible on hover", async ({ page }) => {
    await page.goto("/products")
    const card = page
      .getByRole("link", { name: /XIVY Transparent Mobile Case/i })
      .first()
    await card.hover()

    // Regression guard: the card used to cross-fade to a second image that
    // did not exist, so hovering blanked it.
    const opacity = await page
      .locator("img")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity)
    expect(Number(opacity)).toBeGreaterThan(0.9)
  })

  test("product page preselects the remembered phone", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/products")
    await page.getByRole("button", { name: /find your phone/i }).first().click()
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Apple" }).click()
    await dialog
      .getByRole("button", { name: "iPhone 16 Pro", exact: true })
      .click()
    await expect(page).toHaveURL(/device=apple-iphone-16-pro/)

    await page.goto("/products/xivy-silicon-mobile-case")

    // Without this the picker defaulted to the first variant (a Galaxy),
    // so an iPhone shopper could add the wrong fit.
    await expect(
      page.getByRole("radio", { name: "iPhone 16 Pro" })
    ).toHaveAttribute("aria-checked", "true")
    await expect(page.getByText(/SKU XIVY-SIL-IP16P/)).toBeVisible()
  })

  test("cart badge empties after an order completes", async ({ page }) => {
    await page.context().clearCookies()
    await page.goto("/products/xivy-crystal-clear-mobile-case")
    await page.getByRole("button", { name: /^add to cart$/i }).click()
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await drawer.getByRole("link", { name: /^checkout$/i }).click()

    await page.getByLabel("Email").fill(`badge-${Date.now()}@example.com`)
    await page.getByLabel("Full name").fill("Badge Check")
    await page.getByLabel("Mobile number").fill("9876543210")
    await page.getByLabel("Address").fill("12 Marine Drive")
    await page.getByLabel("City").fill("Mumbai")
    await page.getByLabel("State").fill("Maharashtra")
    await page.getByLabel("PIN code").fill("400020")
    await page.getByRole("button", { name: /continue to payment/i }).click()
    await page.getByRole("button", { name: /place order/i }).click()
    await expect(page).toHaveURL(/\/order\/confirmed\//)

    // The redirect is a client navigation, so the badge needs telling.
    await expect(
      page.getByRole("button", { name: /^cart, 0 items$/i })
    ).toBeVisible()
  })
})
