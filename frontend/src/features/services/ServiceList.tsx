import { useMemo, useState } from 'react'
import { Ban, CheckCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import LoadingState from '@/components/common/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useAuth from '@/hooks/useAuth'
import ServiceCards from '@/features/services/ServiceCards'
import ServiceForm from '@/features/services/ServiceForm'
import { getInitials } from '@/utils/text'
import { getServiceStats } from '@/features/services/serviceUtils'
import type { ServiceFormValues } from '@/features/services/serviceSchema'
import type { Service } from '@/features/services/types'
import {
  getServices,
  createService,
  updateService,
  activateService,
  deactivateService,
  deleteService,
} from '@/features/services/serviceAPI'
import { toast } from '@/lib/toastStore'
import { canManageServices } from '@/utils/permissions'

export default function ServiceList() {
  const { user } = useAuth()
  const canManage = canManageServices(user?.role)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Service | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null)

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await getServices()
      } catch {
        return []
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) =>
      createService({
        name: values.name.trim(),
        description: values.description?.trim() || '',
        price: values.price,
        duration: values.duration,
        isActive: values.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service created successfully')
      closeDialog()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not create service'
      toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: ServiceFormValues }) =>
      updateService(id, {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        price: values.price,
        duration: values.duration,
        isActive: values.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service updated successfully')
      closeDialog()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not update service'
      toast.error(msg)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (service: Service) =>
      service.isActive ? deactivateService(service.id) : activateService(service.id),
    onSuccess: (_, service) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success(service.isActive ? 'Service deactivated' : 'Service activated')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to toggle service status'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service deleted')
      setPendingDelete(null)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not delete service'
      toast.error(msg)
      setPendingDelete(null)
    },
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)),
    )
  }, [services, search])

  const stats = useMemo(() => getServiceStats(services), [services])

  const openCreate = () => {
    if (!canManage) return
    setSelected(null)
    setDialogMode('create')
  }

  const openEdit = (service: Service) => {
    if (!canManage) return
    setSelected(service)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelected(null)
  }

  const handleFormSubmit = (values: ServiceFormValues) => {
    if (dialogMode === 'create') {
      createMutation.mutate(values)
    } else if (dialogMode === 'edit' && selected) {
      updateMutation.mutate({ id: selected.id, values })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor medical service catalogs and departmental offerings.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openCreate} className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
            <Plus className="h-4 w-4" />
            Add New Service
          </Button>
        ) : null}
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
                placeholder="Search services..."
                className="h-10 rounded-lg pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12">
              <LoadingState label="Loading services from clinic database..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 font-medium">Service Name</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          title="No services found"
                          description="Add a service or clear your search."
                        />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((service) => (
                      <tr key={service.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F4F4] text-xs font-semibold text-[#0F5C66]">
                              {getInitials(service.name)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{service.name}</p>
                              {service.code && (
                                <p className="text-xs text-muted-foreground">{service.code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-foreground font-medium">
                          {service.duration || 30} mins
                        </td>
                        <td className="py-4 text-foreground font-semibold">
                          ${service.price ?? 0}
                        </td>
                        <td className="max-w-[280px] py-4 text-muted-foreground">
                          <span className="line-clamp-2">{service.description || '—'}</span>
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
                          {canManage ? (
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
                                onClick={() => toggleMutation.mutate(service)}
                                disabled={toggleMutation.isPending}
                                className={`rounded-md p-2 hover:bg-muted ${
                                  service.isActive ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                                aria-label={
                                  service.isActive
                                    ? `Deactivate ${service.name}`
                                    : `Activate ${service.name}`
                                }
                              >
                                {service.isActive ? (
                                  <Ban className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(service)}
                                className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                aria-label={`Delete ${service.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">View only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length}{' '}
              services
            </p>
          </div>
        </CardContent>
      </Card>

      {dialogMode && canManage ? (
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
                        category: selected.category || 'General',
                        description: selected.description || '',
                        price: selected.price,
                        duration: selected.duration,
                        isActive: selected.isActive,
                      }
                    : undefined
                }
                onSubmit={handleFormSubmit}
                onCancel={closeDialog}
                isSubmitting={isSubmitting}
                submitLabel={dialogMode === 'create' ? 'Create service' : 'Save changes'}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete service"
        description={
          pendingDelete
            ? `Delete service "${pendingDelete.name}"? This cannot be undone.`
            : ''
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id)
          }
        }}
      />
    </div>
  )
}