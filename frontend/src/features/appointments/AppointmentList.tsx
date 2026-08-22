import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
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
import { formatDate } from '@/utils/formatDate'
import { canManageAppointments } from '@/utils/permissions'
import { APPOINTMENT_TIME_OPTIONS, todayKey } from '@/utils/clinicHours'
import { getDoctors } from '@/features/doctors/doctorAPI'
import { getPatients } from '@/features/patients/patientAPI'
import { getServices } from '@/features/services/serviceAPI'
import type { Service } from '@/features/services/types'
import {
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
  createAppointment,
  getAppointments,
  noShowAppointment,
  updateAppointment,
  type Appointment,
  type AppointmentPayload,
  type AppointmentStatus,
} from '@/features/appointments/appointmentAPI'
import {
  appointmentSchema,
  type AppointmentFormValues,
} from '@/features/appointments/appointmentSchema'
import { toast } from '@/lib/toastStore'

type DialogMode = 'create' | 'edit' | 'reschedule' | 'details' | null

const emptyValues: AppointmentFormValues = {
  patientId: '',
  doctorId: '',
  serviceId: '',
  date: '',
  startTime: '09:00',
  endTime: '09:30',
  reason: '',
  notes: '',
}

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
}

const statusVariant: Record<
  AppointmentStatus,
  'default' | 'secondary' | 'success' | 'danger' | 'outline'
> = {
  SCHEDULED: 'secondary',
  CHECKED_IN: 'default',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'outline',
}

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default function AppointmentList() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [formError, setFormError] = useState('')

  /** Admin and receptionist can manage appointments (access matrix). */
  const canManage = canManageAppointments(user?.role)

  const appointmentsQuery = useQuery({
    queryKey: ['appointments', debouncedSearch],
    queryFn: () => getAppointments({ search: debouncedSearch }),
  })

  const patientsQuery = useQuery({
    queryKey: ['patients', 'appointment-options'],
    queryFn: () => getPatients(),
  })

  const doctorsQuery = useQuery({
    queryKey: ['doctors', 'appointment-options'],
    queryFn: () => getDoctors(),
  })

  const servicesQuery = useQuery({
    queryKey: ['services', 'appointment-options'],
    queryFn: (): Promise<Service[]> => getServices(),
  })

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: emptyValues,
  })

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Appointment created')
    },
    onError: () => {
      setFormError('Could not create appointment. Try again.')
      toast.error('Could not create appointment')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<AppointmentPayload>
    }) => updateAppointment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Appointment updated')
    },
    onError: () => {
      setFormError('Could not update appointment. Try again.')
      toast.error('Could not update appointment')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: AppointmentStatus
    }) => {
      switch (status) {
        case 'CHECKED_IN':
          return checkInAppointment(id)
        case 'COMPLETED':
          return completeAppointment(id)
        case 'CANCELLED':
          return cancelAppointment(id)
        case 'NO_SHOW':
          return noShowAppointment(id)
        default:
          throw new Error('Unsupported status change')
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Appointment status updated')
    },
    onError: () => toast.error('Could not update appointment status'),
  })

  const appointments = appointmentsQuery.data ?? []
  const patients = patientsQuery.data ?? []
  const doctors = (doctorsQuery.data ?? []).filter((doctor) => doctor.isActive)
  const services = (servicesQuery.data ?? []).filter((service) => service.isActive)
  const isSaving = createMutation.isPending || updateMutation.isPending
  const isUpdatingStatus = statusMutation.isPending

  const dialogTitle = useMemo(() => {
    if (dialogMode === 'create') return 'Create appointment'
    if (dialogMode === 'edit') return 'Edit appointment'
    if (dialogMode === 'reschedule') return 'Reschedule appointment'
    if (dialogMode === 'details') return 'Appointment details'
    return ''
  }, [dialogMode])

  function openCreate() {
    if (!canManage) return
    setSelected(null)
    setFormError('')
    form.reset(emptyValues)
    setDialogMode('create')
  }

  function openEdit(appointment: Appointment) {
    if (!canManage || appointment.status !== 'SCHEDULED') return
    setSelected(appointment)
    setFormError('')
    form.reset({
      patientId: String(appointment.patientId),
      doctorId: String(appointment.doctorId),
      serviceId: appointment.serviceId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      reason: appointment.reason ?? '',
      notes: appointment.notes ?? '',
    })
    setDialogMode('edit')
  }

  function openReschedule(appointment: Appointment) {
    if (!canManage || appointment.status !== 'SCHEDULED') return
    setSelected(appointment)
    setFormError('')
    form.reset({
      patientId: String(appointment.patientId),
      doctorId: String(appointment.doctorId),
      serviceId: appointment.serviceId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      reason: appointment.reason ?? '',
      notes: appointment.notes ?? '',
    })
    setDialogMode('reschedule')
  }

  function openDetails(appointment: Appointment) {
    setSelected(appointment)
    setFormError('')
    setDialogMode('details')
  }

  function closeDialog() {
    setDialogMode(null)
    setSelected(null)
    setFormError('')
    form.reset(emptyValues)
  }

  function toPayload(values: AppointmentFormValues): AppointmentPayload {
    const patient = patients.find((item) => String(item.id) === values.patientId)
    const doctor = doctors.find((item) => item.id === values.doctorId)
    const service = services.find((item) => item.id === values.serviceId)

    return {
      patientId: values.patientId,
      doctorId: values.doctorId,
      serviceId: values.serviceId,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      reason: values.reason?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      patientName: patient?.fullName,
      patientPhone: patient?.phone,
      doctorName: doctor?.fullName,
      serviceName: service?.name,
    }
  }

  function onSubmit(values: AppointmentFormValues) {
    if (!canManage) return
    setFormError('')
    const payload = toPayload(values)

    if (dialogMode === 'create') {
      createMutation.mutate(
        { ...payload, status: 'SCHEDULED' },
        { onSuccess: () => closeDialog() },
      )
      return
    }

    if ((dialogMode === 'edit' || dialogMode === 'reschedule') && selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        { onSuccess: () => closeDialog() },
      )
    }
  }

  function setStatus(appointment: Appointment, status: AppointmentStatus) {
    if (!canManage) return
    statusMutation.mutate({
      id: appointment.id,
      status,
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Appointments</h3>
          <p className="text-sm text-muted-foreground">
            Schedule visits, reschedule, and update appointment status.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openCreate} className="bg-[#0F5C66] hover:bg-[#0C4B53]">
            <Plus className="h-4 w-4" />
            Create appointment
          </Button>
        ) : null}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search patient, doctor, service, date, or status"
          className="pl-9"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {appointmentsQuery.isLoading ? (
          <LoadingState label="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="Create an appointment or clear your search."
          />
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{appointment.patientName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{appointment.doctorName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(appointment.date)} · {appointment.startTime} –{' '}
                    {appointment.endTime}
                  </p>
                  <div className="mt-2">
                    <Badge variant={statusVariant[appointment.status]}>
                      {statusLabel[appointment.status]}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openDetails(appointment)}
                  aria-label={`View appointment for ${appointment.patientName}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {canManage && appointment.status === 'SCHEDULED' ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(appointment)}
                    aria-label="Edit appointment"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openReschedule(appointment)}
                    aria-label="Reschedule appointment"
                  >
                    <CalendarClock className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus(appointment, 'CHECKED_IN')}
                    disabled={isUpdatingStatus}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Check in
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus(appointment, 'NO_SHOW')}
                    disabled={isUpdatingStatus}
                  >
                    <UserX className="h-3.5 w-3.5" />
                    No-show
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus(appointment, 'CANCELLED')}
                    disabled={isUpdatingStatus}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              ) : null}

              {canManage && appointment.status === 'CHECKED_IN' ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus(appointment, 'COMPLETED')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete
                  </Button>
                </div>
              ) : null}
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
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsQuery.isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <LoadingState label="Loading appointments..." />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No appointments found"
                      description="Create an appointment or clear your search."
                    />
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{appointment.patientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.patientPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{appointment.doctorName}</td>
                    <td className="px-4 py-3 text-foreground">{appointment.serviceName}</td>
                    <td className="px-4 py-3 text-foreground">
                      <div>{formatDate(appointment.date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.startTime} – {appointment.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[appointment.status]}>
                        {statusLabel[appointment.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetails(appointment)}
                          aria-label={`View appointment for ${appointment.patientName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {canManage && appointment.status === 'SCHEDULED' ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(appointment)}
                              aria-label="Edit appointment"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openReschedule(appointment)}
                              aria-label="Reschedule appointment"
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStatus(appointment, 'CHECKED_IN')}
                              disabled={isUpdatingStatus}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Check in
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStatus(appointment, 'NO_SHOW')}
                              disabled={isUpdatingStatus}
                            >
                              <UserX className="h-3.5 w-3.5" />
                              No-show
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setStatus(appointment, 'CANCELLED')}
                              disabled={isUpdatingStatus}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </>
                        ) : null}

                        {canManage && appointment.status === 'CHECKED_IN' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setStatus(appointment, 'COMPLETED')}
                            disabled={isUpdatingStatus}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </Button>
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
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'details'
                ? 'Review appointment details and current status.'
                : dialogMode === 'reschedule'
                  ? 'Choose a new date and time within clinic hours.'
                  : 'Clinic hours: 09:00–12:00 and 13:00–17:00. Only active doctors/services can be booked.'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === 'details' && selected ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Patient" value={selected.patientName} />
              <DetailRow label="Phone" value={selected.patientPhone} />
              <DetailRow label="Doctor" value={selected.doctorName} />
              <DetailRow label="Service" value={selected.serviceName} />
              <DetailRow label="Date" value={formatDate(selected.date)} />
              <DetailRow
                label="Time"
                value={`${selected.startTime} – ${selected.endTime}`}
              />
              <DetailRow label="Reason" value={selected.reason || '—'} />
              <DetailRow label="Notes" value={selected.notes || '—'} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[selected.status]}>
                  {statusLabel[selected.status]}
                </Badge>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                {canManage && selected.status === 'SCHEDULED' ? (
                  <Button type="button" onClick={() => openEdit(selected)}>
                    Edit
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          ) : canManage ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, () => {
                  toast.error('Please fix the appointment details and try again')
                })}
                className="space-y-4"
              >
                {dialogMode !== 'reschedule' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <FormControl>
                            <select {...field} className={selectClassName}>
                              <option value="">Select patient</option>
                              {patients.map((patient) => (
                                <option key={patient.id} value={String(patient.id)}>
                                  {patient.fullName} ({patient.phone})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <FormControl>
                            <select {...field} className={selectClassName}>
                              <option value="">Select doctor</option>
                              {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                  {doctor.fullName} — {doctor.specialty}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <FormControl>
                            <select {...field} className={selectClassName}>
                              <option value="">Select service</option>
                              {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name} ({service.duration} min)
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : null}

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" min={todayKey()} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start time</FormLabel>
                        <FormControl>
                          <select {...field} className={selectClassName}>
                            {APPOINTMENT_TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End time</FormLabel>
                        <FormControl>
                          <select {...field} className={selectClassName}>
                            {APPOINTMENT_TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {dialogMode !== 'reschedule' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Reason for visit" {...field} />
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
                              placeholder="Internal notes"
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : null}

                {Object.keys(form.formState.errors).length > 0 ? (
                  <p className="text-sm text-destructive">
                    Please fix the highlighted fields before saving.
                  </p>
                ) : null}

                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving
                      ? 'Saving...'
                      : dialogMode === 'reschedule'
                        ? 'Save new time'
                        : dialogMode === 'edit'
                          ? 'Save changes'
                          : 'Create appointment'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>
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
