import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import { Eye, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import LoadingState from '@/components/common/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useAuth from '@/hooks/useAuth'
import useDebounce from '@/hooks/useDebounce'
import { canManageDoctors } from '@/utils/permissions'
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
  type Doctor,
  type DoctorPayload,
} from '@/features/doctors/doctorAPI'
import { toast } from '@/lib/toastStore'

const doctorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  isActive: z.boolean(),
})

type DoctorFormValues = z.infer<typeof doctorSchema>

type DialogMode = 'add' | 'edit' | 'details' | null

const emptyValues: DoctorFormValues = {
  fullName: '',
  specialty: '',
  phone: '',
  isActive: true,
}

export default function DoctorList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canManage = canManageDoctors(user?.role)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null)
  const [formError, setFormError] = useState('')

  const doctorsQuery = useQuery({
    queryKey: ['doctors', debouncedSearch],
    queryFn: () => getDoctors({ search: debouncedSearch }),
  })

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: emptyValues,
  })

  const createMutation = useMutation({
    mutationFn: (payload: DoctorPayload) => createDoctor(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor saved')
    },
    onError: () => {
      setFormError('Could not create doctor. Try again.')
      toast.error('Could not create doctor')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<DoctorPayload> }) =>
      updateDoctor(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor updated')
    },
    onError: () => {
      setFormError('Could not update doctor. Try again.')
      toast.error('Could not update doctor')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDoctor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('Doctor deleted')
    },
    onError: () => toast.error('Could not delete doctor'),
  })

  const doctors = doctorsQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const dialogTitle = useMemo(() => {
    if (dialogMode === 'add') return 'Add doctor'
    if (dialogMode === 'edit') return 'Edit doctor'
    if (dialogMode === 'details') return 'Doctor details'
    return ''
  }, [dialogMode])

  function openAdd() {
    if (!canManage) return
    setSelectedDoctor(null)
    setFormError('')
    form.reset(emptyValues)
    setDialogMode('add')
  }

  function openEdit(doctor: Doctor) {
    if (!canManage) return
    setSelectedDoctor(doctor)
    setFormError('')
    form.reset({
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      phone: doctor.phone,
      isActive: doctor.isActive,
    })
    setDialogMode('edit')
  }

  function openDetails(doctor: Doctor) {
    setSelectedDoctor(doctor)
    setFormError('')
    setDialogMode('details')
  }

  function closeDialog() {
    setDialogMode(null)
    setSelectedDoctor(null)
    setFormError('')
    form.reset(emptyValues)
  }

  function onSubmit(values: DoctorFormValues) {
    if (!canManage) return
    setFormError('')
    if (dialogMode === 'add') {
      createMutation.mutate(values, { onSuccess: () => closeDialog() })
      return
    }
    if (dialogMode === 'edit' && selectedDoctor) {
      updateMutation.mutate(
        { id: selectedDoctor.id, payload: values },
        { onSuccess: () => closeDialog() },
      )
    }
  }

  function toggleStatus(doctor: Doctor) {
    if (!canManage) return
    updateMutation.mutate({
      id: doctor.id,
      payload: { isActive: !doctor.isActive },
    })
  }

  function handleDelete(doctor: Doctor) {
    if (!canManage) return
    setPendingDelete(doctor)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id, {
      onSettled: () => setPendingDelete(null),
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Doctors</h3>
          <p className="text-sm text-muted-foreground">
            Browse clinic doctors, specialties, and availability status.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openAdd} className="bg-[#0F5C66] hover:bg-[#0C4B53]">
            <Plus className="h-4 w-4" />
            Add doctor
          </Button>
        ) : null}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, specialty, or phone"
          className="pl-9"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {doctorsQuery.isLoading ? (
          <LoadingState label="Loading doctors..." />
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="Add a doctor or clear your search."
          />
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{doctor.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{doctor.specialty}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{doctor.phone}</p>
                  <div className="mt-2">
                    <Badge variant={doctor.isActive ? 'success' : 'danger'}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openDetails(doctor)}
                    aria-label={`View ${doctor.fullName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManage ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(doctor)}
                        aria-label={`Edit ${doctor.fullName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(doctor)}
                        disabled={updateMutation.isPending}
                      >
                        {doctor.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doctor)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Delete ${doctor.fullName}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Specialty</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctorsQuery.isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <LoadingState label="Loading doctors..." />
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No doctors found"
                      description="Add a doctor or clear your search."
                    />
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-foreground">{doctor.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{doctor.specialty}</td>
                    <td className="px-4 py-3 text-foreground">{doctor.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant={doctor.isActive ? 'success' : 'danger'}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetails(doctor)}
                          aria-label={`View ${doctor.fullName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManage ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(doctor)}
                              aria-label={`Edit ${doctor.fullName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(doctor)}
                              disabled={updateMutation.isPending}
                            >
                              {doctor.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doctor)}
                              disabled={deleteMutation.isPending}
                              aria-label={`Delete ${doctor.fullName}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'details'
                ? 'View doctor information and current status.'
                : 'Enter doctor details. Inactive doctors cannot receive new appointments.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'details' && selectedDoctor ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Full name" value={selectedDoctor.fullName} />
              <DetailRow label="Specialty" value={selectedDoctor.specialty} />
              <DetailRow label="Phone" value={selectedDoctor.phone} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={selectedDoctor.isActive ? 'success' : 'danger'}>
                  {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                {canManage ? (
                  <Button type="button" onClick={() => openEdit(selectedDoctor)}>
                    Edit
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          ) : canManage ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Sara Ahmed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="General Practice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+252 61 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="h-4 w-4 rounded border-input"
                        />
                        Active (can receive appointments)
                      </label>
                    </FormItem>
                  )}
                />

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : dialogMode === 'edit' ? 'Save changes' : 'Add doctor'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete doctor"
        description={
          pendingDelete
            ? `Delete ${pendingDelete.fullName}? This cannot be undone.`
            : ''
        }
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
