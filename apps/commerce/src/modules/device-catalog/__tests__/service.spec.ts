import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { DEVICE_CATALOG_MODULE } from ".."
import DeviceCatalogModuleService from "../service"

jest.setTimeout(60_000)

moduleIntegrationTestRunner<DeviceCatalogModuleService>({
  moduleName: DEVICE_CATALOG_MODULE,
  resolve: "./src/modules/device-catalog",
  testSuite: ({ service }) => {
    describe("DeviceCatalogModuleService", () => {
      it("creates a brand with models and lists them", async () => {
        const brand = await service.createDeviceBrands({
          name: "Apple",
          handle: "apple",
          rank: 1,
        })
        expect(brand.id).toMatch(/^devbr/)

        await service.createDeviceModels([
          {
            name: "iPhone 16 Pro",
            handle: "apple-iphone-16-pro",
            release_year: 2024,
            brand_id: brand.id,
          },
          {
            name: "iPhone 16",
            handle: "apple-iphone-16",
            release_year: 2024,
            brand_id: brand.id,
          },
        ])

        const models = await service.listDeviceModels(
          { brand_id: brand.id },
          { relations: ["brand"] }
        )
        expect(models).toHaveLength(2)
        expect(models[0].brand.name).toBe("Apple")
      })

      it("enforces unique handles on brands", async () => {
        await service.createDeviceBrands({ name: "Samsung", handle: "samsung" })
        await expect(
          service.createDeviceBrands({ name: "Samsung 2", handle: "samsung" })
        ).rejects.toThrow()
      })

      it("enforces unique (brand, name) on models", async () => {
        const brand = await service.createDeviceBrands({
          name: "OnePlus",
          handle: "oneplus",
        })
        await service.createDeviceModels({
          name: "OnePlus 13",
          handle: "oneplus-13",
          brand_id: brand.id,
        })
        await expect(
          service.createDeviceModels({
            name: "OnePlus 13",
            handle: "oneplus-13-duplicate",
            brand_id: brand.id,
          })
        ).rejects.toThrow()
      })

      it("updates and soft-deletes a model", async () => {
        const brand = await service.createDeviceBrands({
          name: "Google",
          handle: "google",
        })
        const model = await service.createDeviceModels({
          name: "Pixel 9",
          handle: "google-pixel-9",
          brand_id: brand.id,
        })

        const updated = await service.updateDeviceModels({
          id: model.id,
          release_year: 2024,
        })
        expect(updated.release_year).toBe(2024)

        await service.softDeleteDeviceModels([model.id])
        const remaining = await service.listDeviceModels({
          handle: "google-pixel-9",
        })
        expect(remaining).toHaveLength(0)
      })
    })
  },
})
