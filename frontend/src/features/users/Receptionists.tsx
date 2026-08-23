import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Check, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useAuth from '@/hooks/useAuth'
import ReceptionistCards from '@/features/users/ReceptionistCards'
import ReceptionistForm from '@/features/users/ReceptionistForm'
import { getInitials, getReceptionistStats } from '@/features/users/mockData'
import type { ReceptionistFormValues } from '@/features/users/receptionistSchema'
import type { Receptionist } from '@/features/users/types'
import {
  getReceptionists,
  createReceptionist,
  updateReceptionist,
  activateReceptionist,
  deactivateReceptionist,
  deleteReceptionist,
} from '@/features/users/userAPI'
import { toast } from '@/lib/toastStore'
import { canManageReceptionists } from '@/utils/permissions'

export default function Receptionists() {
  const { user } = useAuth()
  const canManage = canManageReceptionists(user?.role)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Receptionist | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Receptionist | null>(null)

  const { data: staff = [] } = useQuery({
    queryKey: ['receptionists'],
    queryFn: () => getReceptionists(),
  })

  const createMutation = useMutation({
    mutationFn: (values: ReceptionistFormValues) => createReceptionist(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] })
      toast.success('Receptionist added successfully')
      closeDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add receptionist')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: ReceptionistFormValues }) =>
      updateReceptionist(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] })
      toast.success('Receptionist updated successfully')
      closeDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update receptionist')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (person: Receptionist) => {
      if (person.isActive) {
        await deactivateReceptionist(person.id)
      } else {
        await activateReceptionist(person.id)
      }
    },
    onSuccess: (_, person) => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] })
      toast.success(person.isActive ? 'Receptionist deactivated' : 'Receptionist activated')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteReceptionist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] })
      setPendingDelete(null)
      toast.success('Receptionist deleted')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete receptionist')
    },
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return staff
    return staff.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    )
  }, [staff, search])

  const stats = useMemo(() => getReceptionistStats(staff), [staff])

  const openCreate = () => {
    if (!canManage) return
    setSelected(null)
    setDialogMode('create')
  }

  const openEdit = (person: Receptionist) => {
    if (!canManage) return
    setSelected(person)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelected(null)
  }

  const handleCreate = (values: ReceptionistFormValues) => {
    createMutation.mutate(values)
  }

  const handleEdit = (values: ReceptionistFormValues) => {
    if (!selected) return
    updateMutation.mutate({ id: selected.id, values })
  }

  const toggleActive = (person: Receptionist) => {
    if (!canManage) return
    toggleStatusMutation.mutate(person)
  }

  const handleDelete = (person: Receptionist) => {
    if (!canManage) return
    setPendingDelete(person)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id)
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || toggleStatusMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Receptionist Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, update, and activate receptionist accounts for clinic operations.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openCreate} className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
            <Plus className="h-4 w-4" />
            Add Receptionist
          </Button>
        ) : null}
      </div>

      <ReceptionistCards stats={stats} />

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="gap-4 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold">Receptionist accounts</CardTitle>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="h-10 rounded-lg pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Receptionist</th>
                  <th className="pb-3 font-medium">Access Email</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Join Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="No receptionists found"
                        description="Add a receptionist or clear your search."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((person) => (
                    <tr key={person.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F4F4] text-xs font-semibold text-[#0F5C66]">
                            {getInitials(person.fullName)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{person.fullName}</p>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              {person.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-foreground">{person.email}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            person.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {person.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-foreground">{person.joinDate}</td>
                      <td className="py-4">
                        {canManage ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(person)}
                              className="rounded-md p-2 text-[#0F5C66] hover:bg-muted"
                              aria-label={`Edit ${person.fullName}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(person)}
                              className={`rounded-md p-2 ${
                                person.isActive
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              aria-label={
                                person.isActive
                                  ? `Deactivate ${person.fullName}`
                                  : `Activate ${person.fullName}`
                              }
                              title={person.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {person.isActive ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(person)}
                              className="rounded-md p-2 text-rose-700 hover:bg-rose-50"
                              aria-label={`Delete ${person.fullName}`}
                              title="Delete"
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

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length}{' '}
              receptionists
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5C66] text-xs font-semibold text-white">
                1
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {dialogMode && canManage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {dialogMode === 'create' ? 'Add Receptionist' : 'Edit Receptionist'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dialogMode === 'create'
                ? 'Create a receptionist account for clinic operations.'
                : 'Update account details or active status.'}
            </p>
            <div className="mt-5">
              <ReceptionistForm
                key={selected?.id ?? 'create'}
                mode={dialogMode}
                defaultValues={
                  selected
                    ? {
                        fullName: selected.fullName,
                        email: selected.email,
                        password: '',
                        isActive: selected.isActive,
                      }
                    : undefined
                }
                onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
                onCancel={closeDialog}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete receptionist"
        description={
          pendingDelete
            ? `Delete receptionist "${pendingDelete.fullName}"? This cannot be undone.`
            : ''
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}