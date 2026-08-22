import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { XMark } from "@medusajs/icons"
import { useCallback, useEffect, useState } from "react"

type DeviceModel = {
  id: string
  name: string
  handle: string
  display_name: string | null
  brand?: { id: string; name: string } | null
}

type DeviceBrand = { id: string; name: string }

const api = async (path: string, init?: RequestInit) => {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`)
  }
  return res.json()
}

const ProductDeviceCompatWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [linked, setLinked] = useState<DeviceModel[]>([])
  const [brands, setBrands] = useState<DeviceBrand[]>([])
  const [brandModels, setBrandModels] = useState<DeviceModel[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [busy, setBusy] = useState(false)

  const refreshLinked = useCallback(async () => {
    const res = await api(
      `/admin/device-catalog/products/${product.id}/devices`
    )
    setLinked(res.device_models ?? [])
  }, [product.id])

  useEffect(() => {
    refreshLinked().catch(() => toast.error("Failed to load linked devices"))
    api(`/admin/device-catalog/brands`)
      .then((res) => setBrands(res.brands ?? []))
      .catch(() => toast.error("Failed to load device brands"))
  }, [refreshLinked])

  useEffect(() => {
    if (!selectedBrand) {
      setBrandModels([])
      return
    }
    api(`/admin/device-catalog/models?brand_id=${selectedBrand}`)
      .then((res) => setBrandModels(res.models ?? []))
      .catch(() => toast.error("Failed to load device models"))
  }, [selectedBrand])

  const mutate = async (payload: { add?: string[]; remove?: string[] }) => {
    setBusy(true)
    try {
      await api(`/admin/device-catalog/products/${product.id}/devices`, {
        method: "POST",
        body: JSON.stringify({ add: [], remove: [], ...payload }),
      })
      await refreshLinked()
      toast.success("Compatibility updated")
    } catch {
      toast.error("Failed to update compatibility")
    } finally {
      setBusy(false)
    }
  }

  const linkedIds = new Set(linked.map((m) => m.id))
  const addable = brandModels.filter((m) => !linkedIds.has(m.id))

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Device Compatibility</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {linked.length} device{linked.length === 1 ? "" : "s"}
        </Text>
      </div>

      <div className="flex flex-wrap gap-2 px-6 py-4">
        {linked.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">
            No devices linked yet. Generic products can stay unlinked.
          </Text>
        )}
        {linked.map((model) => (
          <Badge key={model.id} size="small" className="flex items-center gap-1">
            {model.brand?.name ? `${model.brand.name} ` : ""}
            {model.display_name || model.name}
            <button
              type="button"
              disabled={busy}
              onClick={() => mutate({ remove: [model.id] })}
              aria-label={`Remove ${model.name}`}
              className="text-ui-fg-subtle hover:text-ui-fg-base"
            >
              <XMark />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex items-end gap-2 px-6 py-4">
        <div className="w-48">
          <Text size="xsmall" className="text-ui-fg-subtle mb-1">
            Brand
          </Text>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <Select.Trigger>
              <Select.Value placeholder="Select brand" />
            </Select.Trigger>
            <Select.Content>
              {brands.map((brand) => (
                <Select.Item key={brand.id} value={brand.id}>
                  {brand.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="w-64">
          <Text size="xsmall" className="text-ui-fg-subtle mb-1">
            Model
          </Text>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={!selectedBrand}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select model" />
            </Select.Trigger>
            <Select.Content>
              {addable.map((model) => (
                <Select.Item key={model.id} value={model.id}>
                  {model.display_name || model.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={!selectedModel || busy}
          onClick={() => {
            mutate({ add: [selectedModel] })
            setSelectedModel("")
          }}
        >
          Add device
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductDeviceCompatWidget
