import { useMemo, useState } from 'react'
import { Ban, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ServiceCards from '@/features/services/ServiceCards'
import ServiceForm from '@/features/services/ServiceForm'
import {
  getInitials,
  getServiceStats,
  makeServiceCode,
  mockServices,
} from '@/features/services/mockData'
import type { ServiceFormValues } from '@/features/services/serviceSchema'
import type { Service } from '@/features/services/types'

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Service | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    )
  }, [services, search])

  const stats = useMemo(() => getServiceStats(services), [services])

  const openCreate = () => {
    setSelected(null)
    setDialogMode('create')
  }

  const openEdit = (service: Service) => {
    setSelected(service)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelected(null)
  }

  const handleCreate = (values: ServiceFormValues) => {
    const next: Service = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      code: makeServiceCode(values.name, services),
      category: values.category.trim(),
      description: values.description?.trim() || 'No description provided.',
      price: values.price,
      duration: values.duration,
      isActive: values.isActive,
    }
    setServices((prev) => [next, ...prev])
    closeDialog()
  }

  const handleEdit = (values: ServiceFormValues) => {
    if (!selected) return
    setServices((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              name: values.name.trim(),
              category: values.category.trim(),
              description: values.description?.trim() || 'No description provided.',
              price: values.price,
              duration: values.duration,
              isActive: values.isActive,
            }
          : s,
      ),
    )
    closeDialog()
  }

  const toggleActive = (service: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor medical service catalogs and departmental offerings.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
          <Plus className="h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <ServiceCards stats={stats} />

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="gap-4 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Service catalog</CardTitle>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services or codes..."
                className="h-10 rounded-lg pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Service Name &amp; Code</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((service) => (
                    <tr key={service.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F4F4] text-xs font-semibold text-[#0F5C66]">
                            {getInitials(service.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                          {service.category}
                        </span>
                      </td>
                      <td className="max-w-[280px] py-4 text-muted-foreground">
                        <span className="line-clamp-2">{service.description}</span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            service.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(service)}
                            className="rounded-md p-2 text-[#0F5C66] hover:bg-muted"
                            aria-label={`Edit ${service.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(service)}
                            className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                            aria-label={
                              service.isActive
                                ? `Deactivate ${service.name}`
                                : `Activate ${service.name}`
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length}{' '}
              services
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5C66] text-xs font-semibold text-white">
                1
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {dialogMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {dialogMode === 'create' ? 'Add New Service' : 'Edit Service'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dialogMode === 'create'
                ? 'Create a service that can be assigned to appointments.'
                : 'Update service details or active status.'}
            </p>
            <div className="mt-5">
              <ServiceForm
                defaultValues={
                  selected
                    ? {
                        name: selected.name,
                        category: selected.category,
                        description: selected.description,
                        price: selected.price,
                        duration: selected.duration,
                        isActive: selected.isActive,
                      }
                    : undefined
                }
                onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
                onCancel={closeDialog}
                submitLabel={dialogMode === 'create' ? 'Create service' : 'Save changes'}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}