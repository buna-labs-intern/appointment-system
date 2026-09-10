import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Building2, Plus, Search, ShieldCheck, Users } from 'lucide-react'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import SkeletonTableRows from '@/components/ui/Skeleton'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Tenant } from '@/types/api'

type StatusFilter = 'all' | 'active' | 'blocked'

export default function TenantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')

  const [banTarget, setBanTarget] = useState<Tenant | null>(null)
  const [banReason, setBanReason] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)

  const listQuery = useQuery({
    queryKey: ['tenants', { search, status, page }],
    queryFn: () =>
      tenantApi.list({
        page,
        limit: 10,
        search,
        isActive: status === 'all' ? undefined : status === 'active' ? 'true' : 'false',
      }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] })
  }

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => tenantApi.block(id, reason),
    onSuccess: () => {
      setBanTarget(null)
      setBanReason('')
      invalidate()
    },
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const unblockMutation = useMutation({
    mutationFn: (id: string) => tenantApi.unblock(id),
    onSuccess: invalidate,
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantApi.remove(id),
    onSuccess: () => {
      setDeleteTarget(null)
      invalidate()
    },
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const tenants = listQuery.data?.data ?? []
  const meta = listQuery.data?.meta
  const totalPages = meta?.totalPage ?? meta?.totalPages ?? 1
  const total = meta?.total ?? tenants.length

  const statActive = useMemo(() => tenants.filter((t) => t.isActive).length, [tenants])
  const statBanned = useMemo(() => tenants.filter((t) => !t.isActive).length, [tenants])

  return (
    <div className="space-y-6">
      <div className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Clinics</h1>
          <p className="mt-0.5 text-sm text-muted">Registered clinics across the platform</p>
        </div>
        <Link to="/tenants/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New clinic
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clinics on this page" value={tenants.length} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Active" value={statActive} icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Banned" value={statBanned} icon={<Ban className="h-5 w-5" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or slug..."
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-faint transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent-ring focus:outline-none"
          />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {(['all', 'active', 'blocked'] as StatusFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatus(option)
                setPage(1)
              }}
              className={`h-9 rounded-md px-4 text-[13px] font-medium capitalize transition-all duration-150 ${
                status === option
                  ? 'bg-accent-soft text-accent-hover shadow-sm'
                  : 'text-muted hover:bg-canvas hover:text-ink'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {actionError ? (
        <div className="animate-rise rounded-lg border border-red-200 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
          {actionError}
        </div>
      ) : null}

      <Card className="animate-rise overflow-hidden">
        {listQuery.isLoading ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-canvas/60 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3.5">Clinic</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5 text-right">Branches</th>
                <th className="px-5 py-3.5 text-right">Users</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              <SkeletonTableRows rows={6} />
            </tbody>
          </table>
        ) : tenants.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No clinics match the current filters"
            hint="Try a different search term or status filter, or register a new clinic."
            action={
              <Link to="/tenants/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New clinic
                </Button>
              </Link>
            }
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-canvas/60 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-5 py-3.5">Clinic</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5 text-right">Branches</th>
                <th className="px-5 py-3.5 text-right">Users</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="group transition-colors hover:bg-canvas/50">
                  <td className="px-5 py-4">
                    <Link
                      to={`/tenants/${tenant.id}`}
                      className="font-medium text-ink transition-colors group-hover:text-accent-hover"
                    >
                      {tenant.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-faint">/{tenant.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    {tenant.owner ? (
                      <>
                        <p className="text-[13px] text-ink">{tenant.owner.fullName}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {tenant.owner.phone ?? tenant.owner.email}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-faint">No owner</span>
                    )}
                  </td>
                  <td className="tabular px-5 py-4 text-right font-mono text-[13px] text-muted">
                    {tenant._count?.branches ?? 0}
                  </td>
                  <td className="tabular px-5 py-4 text-right font-mono text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                      {tenant._count?.users ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={tenant.isActive ? 'success' : 'danger'} pulse={!tenant.isActive}>
                      {tenant.isActive ? 'Active' : 'Banned'}
                    </StatusBadge>
                    {tenant.blockedReason ? (
                      <p className="mt-1 max-w-[180px] truncate text-xs text-faint" title={tenant.blockedReason}>
                        {tenant.blockedReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {tenant.isActive ? (
                        <Button
                          variant="danger-soft"
                          size="sm"
                          onClick={() => {
                            setActionError('')
                            setBanReason('')
                            setBanTarget(tenant)
                          }}
                        >
                          Ban
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={unblockMutation.isPending && unblockMutation.variables === tenant.id}
                          onClick={() => {
                            setActionError('')
                            unblockMutation.mutate(tenant.id)
                          }}
                        >
                          Unban
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActionError('')
                          setDeleteTarget(tenant)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />

      <Modal
        open={banTarget !== null}
        title={banTarget ? `Ban ${banTarget.name}?` : 'Ban clinic'}
        onClose={() => setBanTarget(null)}
      >
        <p className="text-[13px] leading-relaxed text-muted">
          Every user of this clinic is signed out on their next request and cannot log in until
          the clinic is unbanned.
        </p>
        <label htmlFor="ban-reason" className="mb-1.5 mt-4 block text-[13px] font-medium text-ink">
          Reason <span className="font-normal text-faint">(shown to platform admins)</span>
        </label>
        <textarea
          id="ban-reason"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="e.g. Unpaid subscription, reported activity..."
          className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-danger focus:ring-4 focus:ring-danger-ring focus:outline-none"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="soft" onClick={() => setBanTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={blockMutation.isPending}
            onClick={() => {
              if (!banTarget) return
              blockMutation.mutate({ id: banTarget.id, reason: banReason.trim() || undefined })
            }}
          >
            Ban clinic
          </Button>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete clinic'}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-[13px] leading-relaxed text-muted">
          This permanently removes the clinic. Deletion only succeeds when the clinic has no
          branches, users or patients — otherwise ban it instead.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="soft" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (!deleteTarget) return
              deleteMutation.mutate(deleteTarget.id)
            }}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  )
}
