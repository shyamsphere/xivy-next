import type {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createPricePreferencesWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updatePricePreferencesWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { DEVICE_CATALOG_MODULE } from "../modules/device-catalog"
import type DeviceCatalogModuleService from "../modules/device-catalog/service"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

// The devices the current cover designs are made for. Option values are
// buyer-facing labels; discovery runs through the device-catalog link.
const DEVICE_OPTION = {
  title: "Device",
  values: ["iPhone 16 Pro", "iPhone 16", "Galaxy S24"],
}
const DEVICE_HANDLES = [
  "apple-iphone-16-pro",
  "apple-iphone-16",
  "samsung-galaxy-s24",
]
const DEVICE_SKU_SUFFIX: Record<string, string> = {
  "iPhone 16 Pro": "IP16P",
  "iPhone 16": "IP16",
  "Galaxy S24": "S24",
}

const XIVY_PRODUCTS = [
  {
    title: "XIVY Silicon Mobile Case",
    handle: "xivy-silicon-mobile-case",
    description:
      "Soft-touch liquid silicone case with a plush microfibre lining. Slim, grippy and shock-absorbent — everyday protection that feels premium.",
    image: "silicon.jpg",
    price: 349,
    mrp: 599,
    skuCode: "SIL",
  },
  {
    title: "XIVY Rugged Armor Case",
    handle: "xivy-rugged-armor-case",
    description:
      "Dual-layer rugged protection with reinforced corners and a raised bezel. Military-grade drop resistance without the bulk.",
    image: "rugged.jpeg",
    price: 399,
    mrp: 699,
    skuCode: "RUG",
  },
  {
    title: "XIVY Transparent Mobile Case",
    handle: "xivy-transparent-mobile-case",
    description:
      "Crystal-clear TPU case that shows off your phone, not the case. Yellowing-resistant with precise cutouts and a slim profile.",
    image: "transparent.jpg",
    price: 249,
    mrp: 399,
    skuCode: "TRA",
  },
  {
    title: "XIVY Crystal Clear Mobile Case",
    handle: "xivy-crystal-clear-mobile-case",
    description:
      "Hybrid hard-back clear case with flexible bumpers. High transparency, scratch resistance and clean edge protection.",
    image: "crystal.webp",
    price: 299,
    mrp: 499,
    skuCode: "CRY",
  },
]

export default async function seedXivyData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const productModuleService = container.resolve(Modules.PRODUCT)

  logger.info("Seeding Xivy store data...")
  const [store] = await storeModuleService.listStores()

  let [salesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Xivy Web",
  })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Xivy Web" }] },
    })
    salesChannel = result[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [{ currency_code: "inr", is_default: true }],
        default_sales_channel_id: salesChannel.id,
      },
    },
  })

  // ₹299 means ₹299 at checkout — prices are entered GST-inclusive.
  logger.info("Setting INR tax-inclusive price preference...")
  const pricingModuleService = container.resolve(Modules.PRICING)
  const [existingPreference] = await pricingModuleService.listPricePreferences(
    { attribute: "currency_code", value: "inr" }
  )
  if (existingPreference) {
    await updatePricePreferencesWorkflow(container).run({
      input: {
        selector: { attribute: "currency_code", value: "inr" },
        update: { is_tax_inclusive: true },
      },
    })
  } else {
    await createPricePreferencesWorkflow(container).run({
      input: [
        { attribute: "currency_code", value: "inr", is_tax_inclusive: true },
      ],
    })
  }

  logger.info("Seeding region + tax data...")
  const regionModuleService = container.resolve(Modules.REGION)
  let [region] = await regionModuleService.listRegions({ name: "India" })
  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(
      container
    ).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = regionResult[0]
  }

  const taxModuleService = container.resolve(Modules.TAX)
  const existingTaxRegions = await taxModuleService.listTaxRegions({
    country_code: "in",
  })
  if (!existingTaxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "in",
          provider_id: "tp_system",
          default_tax_rate: { name: "GST", code: "GST", rate: 18 },
        },
      ],
    })
  }

  logger.info("Seeding stock location...")
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  let [stockLocation] = await stockLocationModuleService.listStockLocations({
    name: "Xivy Warehouse Mumbai",
  })
  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Xivy Warehouse Mumbai",
            address: {
              city: "Mumbai",
              country_code: "IN",
              address_1: "",
            },
          },
        ],
      },
    })
    stockLocation = stockLocationResult[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  logger.info("Seeding fulfillment data...")
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfile = result[0]
  }

  let [fulfillmentSet] = await fulfillmentModuleService.listFulfillmentSets(
    { name: "India delivery" },
    { relations: ["service_zones"] }
  )
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "India delivery",
      type: "shipping",
      service_zones: [
        {
          name: "India",
          geo_zones: [{ country_code: "in", type: "country" }],
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })
  }

  // Standard delivery ₹49, free once the cart crosses ₹999 — the same
  // rule the current xivy.in enforces.
  const existingOptions = await fulfillmentModuleService.listShippingOptions({
    name: "Standard Delivery",
  })
  if (!existingOptions.length) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivered in 3-7 days across India.",
          code: "standard",
        },
        prices: [
          { currency_code: "inr", amount: 49 },
          {
            currency_code: "inr",
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte", value: 999 }],
          },
        ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })
  }

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  })

  logger.info("Seeding publishable API key...")
  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token"],
    filters: { type: "publishable" },
  })
  let publishableApiKey: { id: string; token: string } | undefined =
    existingKeys?.[0]
  if (!publishableApiKey) {
    const {
      result: [created],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [{ title: "Xivy Web", type: "publishable", created_by: "" }],
      },
    })
    publishableApiKey = { id: created.id, token: created.token }
  }
  // The key must map to exactly ONE sales channel, otherwise the Store API
  // refuses to calculate inventory availability ("provide a single sales
  // channel id or configure a single sales channel in the publishable key").
  // Medusa ships a "Default Sales Channel" and a default key, so strip any
  // channel that isn't ours.
  const { data: keyWithChannels } = await query.graph({
    entity: "api_key",
    fields: ["id", "sales_channels.id"],
    filters: { id: publishableApiKey.id },
  })
  const linkedChannelIds: string[] = (
    keyWithChannels?.[0]?.sales_channels ?? []
  ).flatMap((channel) => (channel?.id ? [channel.id] : []))

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: linkedChannelIds.includes(salesChannel.id) ? [] : [salesChannel.id],
      remove: linkedChannelIds.filter((id) => id !== salesChannel.id),
    },
  })

  logger.info("Seeding products...")
  const existingProducts = await productModuleService.listProducts({
    handle: XIVY_PRODUCTS.map((p) => p.handle),
  })
  if (existingProducts.length) {
    logger.info("Products already seeded — skipping product creation.")
  } else {
    const { result: categoryResult } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [{ name: "Mobile Covers", is_active: true }],
      },
    })
    const mobileCovers = categoryResult[0]

    await createProductsWorkflow(container).run({
      input: {
        products: XIVY_PRODUCTS.map((product) => ({
          title: product.title,
          handle: product.handle,
          description: product.description,
          category_ids: [mobileCovers.id],
          weight: 50,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile!.id,
          metadata: { mrp: product.mrp },
          images: [{ url: `${BACKEND_URL}/static/${product.image}` }],
          options: [DEVICE_OPTION],
          variants: DEVICE_OPTION.values.map((device) => ({
            title: device,
            sku: `XIVY-${product.skuCode}-${DEVICE_SKU_SUFFIX[device]}`,
            options: { Device: device },
            prices: [{ amount: product.price, currency_code: "inr" }],
          })),
          sales_channels: [{ id: salesChannel.id }],
        })),
      },
    })

    logger.info("Seeding inventory levels...")
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })
    const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.map(
      (item: { id: string }) => ({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: item.id,
      })
    )
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    })
  }

  logger.info("Linking products to compatible devices...")
  const deviceCatalog: DeviceCatalogModuleService = container.resolve(
    DEVICE_CATALOG_MODULE
  )
  const deviceModels = await deviceCatalog.listDeviceModels({
    handle: DEVICE_HANDLES,
  })
  if (!deviceModels.length) {
    logger.warn(
      "No device models found — run `npm run seed:devices` first, then re-run this seed to create compatibility links."
    )
  } else {
    const products = await productModuleService.listProducts({
      handle: XIVY_PRODUCTS.map((p) => p.handle),
    })
    let linked = 0
    for (const product of products) {
      const { data: productWithDevices } = await query.graph({
        entity: "product",
        fields: ["id", "device_models.id"],
        filters: { id: product.id },
      })
      const alreadyLinked = new Set(
        (productWithDevices?.[0]?.device_models ?? [])
          .filter((deviceModel): deviceModel is { id: string } & typeof deviceModel => !!deviceModel)
          .map((deviceModel) => deviceModel.id)
      )
      for (const deviceModel of deviceModels) {
        if (alreadyLinked.has(deviceModel.id)) continue
        await link.create({
          [DEVICE_CATALOG_MODULE]: { device_model_id: deviceModel.id },
          [Modules.PRODUCT]: { product_id: product.id },
        })
        linked++
      }
    }
    logger.info(
      `Created ${linked} compatibility links across ${products.length} products and ${deviceModels.length} device models.`
    )
  }

  logger.info("Xivy seed complete.")
  logger.info(`Publishable API key token: ${publishableApiKey.token}`)
}
