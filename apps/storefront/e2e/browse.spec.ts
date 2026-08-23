import { test, expect } from "@playwright/test"

test.describe("browsing", () => {
  test("home page shows products and the device CTA", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("Protection that")
    await expect(page.getByRole("link", { name: /XIVY .* Case/i }).first()).toBeVisible()
    await expect(
      page.getByRole("button", { name: /find your phone/i }).first()
    ).toBeVisible()
  })

  test("shop lists every seeded product", async ({ page }) => {
    await page.goto("/products")
    const cards = page.getByRole("link", { name: /XIVY .* Case/i })
    await expect(cards).toHaveCount(4)
  })

  test("device filter narrows the listing and is shareable", async ({ page }) => {
    await page.goto("/products?device=apple-iphone-16-pro")
    await expect(page.getByRole("link", { name: /XIVY .* Case/i }).first()).toBeVisible()
    // the active chip reflects the URL, so the view can be shared
    await expect(
      page.locator('[aria-current="true"]').first()
    ).toBeVisible()
  })

  test("search finds a product by name", async ({ page }) => {
    await page.goto("/products?q=rugged")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("rugged")
    await expect(
      page.getByRole("link", { name: /Rugged Armor/i }).first()
    ).toBeVisible()
  })

  test("a search with no matches shows the empty state", async ({ page }) => {
    await page.goto("/products?q=definitelynothinghere")
    await expect(page.getByText(/nothing matches yet/i)).toBeVisible()
  })

  test("product page shows price, stock and compatible devices", async ({
    page,
  }) => {
    await page.goto("/products/xivy-silicon-mobile-case")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Silicon"
    )
    await expect(page.getByText("₹349").first()).toBeVisible()
    await expect(page.getByText(/in stock/i)).toBeVisible()
    await expect(page.getByText(/fits these phones/i)).toBeVisible()
  })

  test("product page emits Product structured data", async ({ page }) => {
    await page.goto("/products/xivy-silicon-mobile-case")
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()
    const types = blocks.map((b) => JSON.parse(b)["@type"])
    expect(types).toContain("Product")
    expect(types).toContain("BreadcrumbList")

    const product = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "Product")
    expect(product.offers.priceCurrency).toBe("INR")
    expect(product.offers.price).toBeGreaterThan(0)
  })

  test("robots and sitemap are served", async ({ request }) => {
    const robots = await request.get("/robots.txt")
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain("Disallow: /checkout")

    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain("/products/xivy-silicon-mobile-case")
  })

  test("legacy URLs redirect", async ({ page }) => {
    await page.goto("/shop")
    await expect(page).toHaveURL(/\/products$/)
  })
})
