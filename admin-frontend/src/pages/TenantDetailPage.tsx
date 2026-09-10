import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, ShieldAlert } from 'lucide-react'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [banOpen, setBanOpen] = useState(false)
  const [banReason, setBanReason] = useState('')

  const tenantQuery = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantApi.getById(id as string),
    enabled: Boolean(id),
  })

  const branchesQuery = useQuery({
    queryKey: ['tenant-branches', id],
    queryFn: () => tenantApi.branches(id as string),
    enabled: Boolean(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tenant', id] })
    queryClient.invalidateQueries({ queryKey: ['tenant-branches', id] })
    queryClient.invalidateQueries({ queryKey: ['tenants'] })
  }

  const blockMutation = useMutation({
    mutationFn: ({ tid, reason }: { tid: string; reason?: string }) => tenantApi.block(tid, reason),
    onSuccess: () => {
      setBanOpen(false)
      setBanReason('')
      invalidate()
    },
    onError: (err: unknown) => setError(extractApiError(err)),
  })

  const unblockMutation = useMutation({
    mutationFn: (tid: string) => tenantApi.unblock(tid),
    onSuccess: invalidate,
    onError: (err: unknown) => setError(extractApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      tenantApi.update(id as string, {
        name: editName.trim() || undefined,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      }),
    onSuccess: () => {
      setShowEdit(false)
      invalidate()
    },
    onError: (err: unknown) => setError(extractApiError(err)),
  })

  const tenant = tenantQuery.data

  if (tenantQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-40 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    )
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <Card className="p-6 text-sm text-danger">
        Clinic not found or failed to load.{' '}
        <Link to="/tenants" className="font-medium underline">
          Back to list
        </Link>
      </Card>
    )
  }

  const owner = tenant.owner

  return (
    <div className="space-y-6">
      <div className="animate-rise">
        <Link
          to="/tenants"
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All clinics
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-ink">
              {tenant.name}
              <StatusBadge tone={tenant.isActive ? 'success' : 'danger'} pulse={!tenant.isActive}>
                {tenant.isActive ? 'Active' : 'Banned'}
              </StatusBadge>
            </h1>
            <p className="mt-1 font-mono text-[13px] text-faint">
              /{tenant.slug}
              {tenant.defaultBranch ? (
                <span className="font-sans text-muted"> · default branch: {tenant.defaultBranch.name}</span>
              ) : null}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="soft"
              onClick={() => {
                setEditName(tenant.name)
                setEditPhone(tenant.phone ?? '')
                setEditAddress(tenant.address ?? '')
                setShowEdit((prev) => !prev)
              }}
            >
              Edit
            </Button>
            {tenant.isActive ? (
              <Button
                variant="danger"
                onClick={() => {
                  setError('')
                  setBanReason('')
                  setBanOpen(true)
                }}
              >
                Ban clinic
              </Button>
            ) : (
              <Button
                variant="outline"
                loading={unblockMutation.isPending}
                onClick={() => {
                  setError('')
                  unblockMutation.mutate(tenant.id)
                }}
              >
                Unban clinic
              </Button>
            )}
          </div>
        </div>
      </div>

      {tenant.blockedReason ? (
        <div className="animate-rise flex items-start gap-3 rounded-lg border border-red-200 bg-danger-soft px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <div className="text-[13px] text-danger">
            <p className="font-medium">Clinic banned</p>
            <p className="mt-0.5 text-danger/80">{tenant.blockedReason}</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="animate-rise rounded-lg border border-red-200 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
          {error}
        </div>
      ) : null}

      {showEdit ? (
        <Card className="animate-rise p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setError('')
              updateMutation.mutate()
            }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <Input
              id="editName"
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              id="editPhone"
              label="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <Input
              id="editAddress"
              label="Address"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2 sm:col-span-3">
              <Button variant="soft" type="button" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="animate-rise p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Owner</p>
            {owner ? (
              <div className="mt-3 space-y-2">
                <p className="font-medium text-ink">{owner.fullName}</p>
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <Mail className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                  {owner.email}
                </p>
                {owner.phone ? (
                  <p className="flex items-center gap-2 text-[13px] text-muted">
                    <Phone className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                    {owner.phone}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-faint">No owner account</p>
            )}
          </Card>

          <Card className="animate-rise p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Counts</p>
            <dl className="mt-3 space-y-2.5">
              {[
                ['Branches', tenant._count?.branches ?? 0],
                ['Users', tenant._count?.users ?? 0],
                ['Patients', tenant._count?.patients ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-[13px] text-muted">{label}</dt>
                  <dd className="tabular font-mono text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="animate-rise p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Contact</p>
            <div className="mt-3 space-y-2 text-[13px] text-muted">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                {tenant.phone ?? 'No phone'}
              </p>
              <p className="text-muted">{tenant.address ?? 'No address'}</p>
            </div>
          </Card>
        </div>
      )}

      <Card className="animate-rise overflow-hidden">
        <h2 className="border-b border-border px-5 py-3.5 text-[13px] font-semibold text-ink">
          Branches
        </h2>
        {branchesQuery.isLoading ? (
          <div className="space-y-3 px-5 py-5">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : (branchesQuery.data ?? []).length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-muted">No branches yet.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {(branchesQuery.data ?? []).map((branch) => (
              <li key={branch.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{branch.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-faint">
                    /{branch.slug}
                    {branch.address ? <span className="font-sans"> · {branch.address}</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <span className="tabular hidden font-mono text-xs text-muted sm:inline">
                    {branch._count?.doctors ?? 0} doctors · {branch._count?.appointments ?? 0} appts
                  </span>
                  <StatusBadge tone={branch.isActive ? 'success' : 'neutral'}>
                    {branch.isActive ? 'Active' : 'Archived'}
                  </StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={banOpen} title={tenant.name ? `Ban ${tenant.name}?` : 'Ban clinic'} onClose={() => setBanOpen(false)}>
        <p className="text-[13px] leading-relaxed text-muted">
          Every user of this clinic is signed out on their next request and cannot log in until
          the clinic is unbanned.
        </p>
        <label htmlFor="detail-ban-reason" className="mb-1.5 mt-4 block text-[13px] font-medium text-ink">
          Reason <span className="font-normal text-faint">(shown to platform admins)</span>
        </label>
        <textarea
          id="detail-ban-reason"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="e.g. Unpaid subscription, reported activity..."
          className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-danger focus:ring-4 focus:ring-danger-ring focus:outline-none"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="soft" onClick={() => setBanOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={blockMutation.isPending}
            onClick={() => {
              if (!tenant) return
              blockMutation.mutate({ tid: tenant.id, reason: banReason.trim() || undefined })
            }}
          >
            Ban clinic
          </Button>
        </div>
      </Modal>
    </div>
  )
}
