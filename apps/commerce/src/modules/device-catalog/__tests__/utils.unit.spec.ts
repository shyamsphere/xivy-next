import { toHandle } from "../utils"

describe("toHandle", () => {
  it("slugifies a device name", () => {
    expect(toHandle("Apple iPhone 16 Pro")).toBe("apple-iphone-16-pro")
  })

  it("keeps '+' models distinct from their base model", () => {
    expect(toHandle("Samsung Galaxy S24 Plus")).toBe("samsung-galaxy-s24-plus")
    expect(toHandle("Samsung Galaxy S24+")).toBe("samsung-galaxy-s24-plus")
    expect(toHandle("Samsung Galaxy S24")).toBe("samsung-galaxy-s24")
    // the collision that silently dropped a model before
    expect(toHandle("Samsung Galaxy S24+")).not.toBe(
      toHandle("Samsung Galaxy S24")
    )
  })

  it("collapses punctuation and trims separators", () => {
    expect(toHandle("Nothing Phone (2a)")).toBe("nothing-phone-2a")
    expect(toHandle("  Moto G85  ")).toBe("moto-g85")
  })
})
