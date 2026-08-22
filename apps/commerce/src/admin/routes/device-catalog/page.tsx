import { defineRouteConfig } from "@medusajs/admin-sdk"
import { LaptopMobile } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

type DeviceBrand = {
  id: string
  name: string
  handle: string
  rank: number
  is_active: boolean
}

type DeviceModel = {
  id: string
  name: string
  handle: string
  release_year: number | null
  is_active: boolean
  brand?: { id: string; name: string } | null
}

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

const DeviceCatalogPage = () => {
  const [brands, setBrands] = useState<DeviceBrand[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [activeBrand, setActiveBrand] = useState<DeviceBrand | null>(null)
  const [newBrand, setNewBrand] = useState("")
  const [newModel, setNewModel] = useState("")
  const [newModelYear, setNewModelYear] = useState("")

  const loadBrands = useCallback(async () => {
    const res = await api("/admin/device-catalog/brands")
    setBrands(res.brands ?? [])
  }, [])

  const loadModels = useCallback(async (brandId: string) => {
    const res = await api(`/admin/device-catalog/models?brand_id=${brandId}`)
    setModels(res.models ?? [])
  }, [])

  useEffect(() => {
    loadBrands().catch(() => toast.error("Failed to load brands"))
  }, [loadBrands])

  useEffect(() => {
    if (activeBrand) {
      loadModels(activeBrand.id).catch(() =>
        toast.error("Failed to load models")
      )
    } else {
      setModels([])
    }
  }, [activeBrand, loadModels])

  const createBrand = async () => {
    if (!newBrand.trim()) return
    try {
      await api("/admin/device-catalog/brands", {
        method: "POST",
        body: JSON.stringify({ name: newBrand.trim() }),
      })
      setNewBrand("")
      await loadBrands()
      toast.success("Brand created")
    } catch {
      toast.error("Failed to create brand")
    }
  }

  const createModel = async () => {
    if (!activeBrand || !newModel.trim()) return
    try {
      await api("/admin/device-catalog/models", {
        method: "POST",
        body: JSON.stringify({
          brand_id: activeBrand.id,
          name: newModel.trim(),
          release_year: newModelYear ? Number(newModelYear) : null,
        }),
      })
      setNewModel("")
      setNewModelYear("")
      await loadModels(activeBrand.id)
      toast.success("Model created")
    } catch {
      toast.error("Failed to create model")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Container className="p-0">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Heading level="h1">Device Catalog</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Brands and models used for product compatibility
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:divide-x">
          <div>
            <div className="flex items-center gap-2 border-b px-6 py-3">
              <Input
                size="small"
                placeholder="New brand name"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createBrand()}
              />
              <Button size="small" variant="secondary" onClick={createBrand}>
                Add brand
              </Button>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Brand</Table.HeaderCell>
                  <Table.HeaderCell>Handle</Table.HeaderCell>
                  <Table.HeaderCell>Rank</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {brands.map((brand) => (
                  <Table.Row
                    key={brand.id}
                    className={
                      activeBrand?.id === brand.id
                        ? "bg-ui-bg-highlight cursor-pointer"
                        : "cursor-pointer"
                    }
                    onClick={() => setActiveBrand(brand)}
                  >
                    <Table.Cell>{brand.name}</Table.Cell>
                    <Table.Cell>{brand.handle}</Table.Cell>
                    <Table.Cell>{brand.rank}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <div>
            <div className="flex items-center gap-2 border-b px-6 py-3">
              <Input
                size="small"
                placeholder={
                  activeBrand
                    ? `New ${activeBrand.name} model`
                    : "Select a brand first"
                }
                disabled={!activeBrand}
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createModel()}
              />
              <Input
                size="small"
                placeholder="Year"
                className="w-24"
                disabled={!activeBrand}
                value={newModelYear}
                onChange={(e) => setNewModelYear(e.target.value)}
              />
              <Button
                size="small"
                variant="secondary"
                disabled={!activeBrand}
                onClick={createModel}
              >
                Add model
              </Button>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Model</Table.HeaderCell>
                  <Table.HeaderCell>Handle</Table.HeaderCell>
                  <Table.HeaderCell>Year</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {models.map((model) => (
                  <Table.Row key={model.id}>
                    <Table.Cell>{model.name}</Table.Cell>
                    <Table.Cell>{model.handle}</Table.Cell>
                    <Table.Cell>{model.release_year ?? "—"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Device Catalog",
  icon: LaptopMobile,
})

export default DeviceCatalogPage
