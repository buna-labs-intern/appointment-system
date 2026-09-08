import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import { Eye, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import LoadingState from '@/components/common/LoadingState'
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
import { formatDate } from '@/utils/formatDate'
import { canManagePatients as canManagePatientsRole } from '@/utils/permissions'
import {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  type Patient,
  type PatientPayload,
} from '@/features/patients/patientAPI'
import { toast } from '@/lib/toastStore'
import {
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_REGEX,
} from '@/utils/validation'

const patientSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(PHONE_MIN_LENGTH, 'Phone number must be at least 7 digits')
    .max(PHONE_MAX_LENGTH, 'Phone number cannot exceed 16 digits')
    .regex(PHONE_REGEX, 'Enter a valid phone number'),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().max(255, 'Address cannot exceed 255 characters').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
})

type PatientFormValues = z.infer<typeof patientSchema>

type DialogMode = 'add' | 'edit' | 'details' | null

const emptyValues: PatientFormValues = {
  fullName: '',
  phone: '',
  gender: 'FEMALE',
  dateOfBirth: '',
  address: '',
  notes: '',
}

const genderLabel: Record<Patient['gender'], string> = {
  MALE: 'Male',
  FEMALE: 'Female',
}

export default function PatientList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null)
  const [formError, setFormError] = useState('')

  /** Admin and receptionist can manage patients (access matrix). */
  const canManagePatients = canManagePatientsRole(user?.role)

  const patientsQuery = useQuery({
    queryKey: ['patients', debouncedSearch],
    queryFn: () => getPatients({ search: debouncedSearch }),
  })

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyValues,
  })

  const createMutation = useMutation({
    mutationFn: (payload: PatientPayload) => createPatient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient registered')
    },
    onError: () => {
      setFormError('Could not register patient. Try again.')
      toast.error('Could not register patient')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: PatientPayload }) =>
      updatePatient(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient updated')
    },
    onError: () => {
      setFormError('Could not update patient. Try again.')
      toast.error('Could not update patient')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deletePatient(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient deleted')
      setPendingDelete(null)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not delete patient'
      toast.error(msg)
    },
  })

  const patients = patientsQuery.data ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

  const dialogTitle = useMemo(() => {
    if (dialogMode === 'add') return 'Register patient'
    if (dialogMode === 'edit') return 'Edit patient'
    if (dialogMode === 'details') return 'Patient details'
    return ''
  }, [dialogMode])

  function openAdd() {
    if (!canManagePatients) return
    setSelectedPatient(null)
    setFormError('')
    form.reset(emptyValues)
    setDialogMode('add')
  }

  function openEdit(patient: Patient) {
    if (!canManagePatients) return
    setSelectedPatient(patient)
    setFormError('')
    form.reset({
      fullName: patient.fullName,
      phone: patient.phone,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address ?? '',
      notes: patient.notes ?? '',
    })
    setDialogMode('edit')
  }

  function openDetails(patient: Patient) {
    setSelectedPatient(patient)
    setFormError('')
    setDialogMode('details')
  }

  function closeDialog() {
    setDialogMode(null)
    setSelectedPatient(null)
    setFormError('')
    form.reset(emptyValues)
  }

  function toPayload(values: PatientFormValues): PatientPayload {
    return {
      fullName: values.fullName,
      phone: values.phone,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      address: values.address?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    }
  }

  function onSubmit(values: PatientFormValues) {
    if (!canManagePatients) return
    setFormError('')
    const payload = toPayload(values)

    if (dialogMode === 'add') {
      createMutation.mutate(payload, { onSuccess: () => closeDialog() })
      return
    }

    if (dialogMode === 'edit' && selectedPatient) {
      updateMutation.mutate(
        { id: selectedPatient.id, payload },
        { onSuccess: () => closeDialog() },
      )
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Patients</h3>
          <p className="text-sm text-muted-foreground">
            Find patient records and keep contact details up to date.
          </p>
        </div>
        {canManagePatients ? (
          <Button onClick={openAdd} className="bg-[#0F5C66] hover:bg-[#0C4B53]">
            <Plus className="h-4 w-4" />
            Register patient
          </Button>
        ) : null}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, or address"
          className="pl-9"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {patientsQuery.isLoading ? (
          <LoadingState label="Loading patients..." />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description="Register a patient or clear your search."
          />
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{patient.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{patient.phone}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {genderLabel[patient.gender]} · {formatDate(patient.dateOfBirth)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openDetails(patient)}
                    aria-label={`View ${patient.fullName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManagePatients ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(patient)}
                      aria-label={`Edit ${patient.fullName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Gender</th>
                <th className="px-4 py-3 font-medium">Date of birth</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patientsQuery.isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <LoadingState label="Loading patients..." />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No patients found"
                      description="Register a patient or clear your search."
                    />
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <Users className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-foreground">{patient.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{patient.phone}</td>
                    <td className="px-4 py-3 text-foreground">{genderLabel[patient.gender]}</td>
                    <td className="px-4 py-3 text-foreground">
                      {formatDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetails(patient)}
                          aria-label={`View ${patient.fullName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManagePatients ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(patient)}
                              aria-label={`Edit ${patient.fullName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => setPendingDelete(patient)}
                              aria-label={`Delete ${patient.fullName}`}
                            >
                              <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'details'
                ? 'View patient information before scheduling an appointment.'
                : 'Search existing patients first when possible, then register or update details.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'details' && selectedPatient ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Full name" value={selectedPatient.fullName} />
              <DetailRow label="Phone" value={selectedPatient.phone} />
              <DetailRow label="Gender" value={genderLabel[selectedPatient.gender]} />
              <DetailRow label="Date of birth" value={formatDate(selectedPatient.dateOfBirth)} />
              <DetailRow label="Address" value={selectedPatient.address || '—'} />
              <DetailRow label="Notes" value={selectedPatient.notes || '—'} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                {canManagePatients ? (
                  <Button type="button" onClick={() => openEdit(selectedPatient)}>
                    Edit
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          ) : canManagePatients ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Hassan Omar" {...field} />
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
                        <Input placeholder="+252 61 000 0000" maxLength={PHONE_MAX_LENGTH} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="FEMALE">Female</option>
                            <option value="MALE">Male</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="City / neighborhood" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Any useful notes for reception"
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving
                      ? 'Saving...'
                      : dialogMode === 'edit'
                        ? 'Save changes'
                        : 'Register patient'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete Patient"
        description={`Are you sure you want to delete ${pendingDelete?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id)
          }
        }}
      />
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
