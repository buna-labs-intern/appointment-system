import { useMemo, useState } from 'react'
import { Ban, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ReceptionistCards from '@/features/users/ReceptionistCards'
import ReceptionistForm from '@/features/users/ReceptionistForm'
import { getInitials, getReceptionistStats, mockReceptionists } from '@/features/users/mockData'
import type { ReceptionistFormValues } from '@/features/users/receptionistSchema'
import type { Receptionist } from '@/features/users/types'

export default function Receptionists() {
  const [staff, setStaff] = useState<Receptionist[]>(mockReceptionists)
  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Receptionist | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return staff
    return staff.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    )
  }, [staff, search])

  const stats = useMemo(() => getReceptionistStats(staff), [staff])

  const openCreate = () => {
    setSelected(null)
    setDialogMode('create')
  }

  const openEdit = (person: Receptionist) => {
    setSelected(person)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setSelected(null)
  }

  const handleCreate = (values: ReceptionistFormValues) => {
    const next: Receptionist = {
      id: crypto.randomUUID(),
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      role: 'RECEPTIONIST',
      isActive: values.isActive,
      joinDate: new Date().toISOString().slice(0, 10),
    }
    setStaff((prev) => [next, ...prev])
    closeDialog()
  }

  const handleEdit = (values: ReceptionistFormValues) => {
    if (!selected) return
    setStaff((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              fullName: values.fullName.trim(),
              email: values.email.trim().toLowerCase(),
              isActive: values.isActive,
            }
          : s,
      ),
    )
    closeDialog()
  }

  const toggleActive = (person: Receptionist) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === person.id ? { ...s, isActive: !s.isActive } : s)),
    )
  }

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
        <Button onClick={openCreate} className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
          <Plus className="h-4 w-4" />
          Add Receptionist
        </Button>
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
                    <td colSpan={5} className="py-10 text-center text-muted-foreground">
                      No receptionists found.
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(person)}
                            className="rounded-md p-2 text-[#0F5C66] hover:bg-muted"
                            aria-label={`Edit ${person.fullName}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(person)}
                            className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                            aria-label={
                              person.isActive
                                ? `Deactivate ${person.fullName}`
                                : `Activate ${person.fullName}`
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

      {dialogMode ? (
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
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}