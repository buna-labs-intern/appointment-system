import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Search } from 'lucide-react'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'

type StatusFilter = 'all' | 'active' | 'blocked'

export default function TenantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')

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
    onSuccess: invalidate,
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const unblockMutation = useMutation({
    mutationFn: (id: string) => tenantApi.unblock(id),
    onSuccess: invalidate,
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantApi.remove(id),
    onSuccess: invalidate,
    onError: (err: unknown) => setActionError(extractApiError(err)),
  })

  const tenants = listQuery.data?.data ?? []
  const meta = listQuery.data?.meta
  const totalPages = meta?.totalPage ?? meta?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinics</h1>
          <p className="text-sm text-slate-500">
            {meta?.total ?? tenants.length} clinics registered on the platform
          </p>
        </div>
        <Link
          to="/tenants/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F5C66] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4B53]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New clinic
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20"
          />
        </div>
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
          {(['all', 'active', 'blocked'] as StatusFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatus(option)
                setPage(1)
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                status === option ? 'bg-[#0F5C66] text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {actionError ? (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</p>
      ) : null}

      {listQuery.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading clinics...
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">No clinics match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Clinic</th>
                <th className="px-5 py-3">Branches</th>
                <th className="px-5 py-3">Users</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <Link to={`/tenants/${tenant.id}`} className="font-medium text-slate-900 hover:text-[#0F5C66]">
                      {tenant.name}
                    </Link>
                    <p className="text-xs text-slate-400">/{tenant.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{tenant._count?.branches ?? 0}</td>
                  <td className="px-5 py-3 text-slate-600">{tenant._count?.users ?? 0}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tenant.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {tenant.isActive ? 'Active' : 'Banned'}
                    </span>
                    {tenant.blockedReason ? (
                      <p className="mt-0.5 text-xs text-slate-400" title={tenant.blockedReason}>
                        {tenant.blockedReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {tenant.isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('')
                            const reason = window.prompt('Reason for banning this clinic (optional):') ?? undefined
                            blockMutation.mutate({ id: tenant.id, reason: reason || undefined })
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          Ban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActionError('')
                            unblockMutation.mutate(tenant.id)
                          }}
                          className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                        >
                          Unban
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActionError('')
                          if (window.confirm(`Delete clinic "${tenant.name}"? This only works when it has no branches, users or patients.`)) {
                            deleteMutation.mutate(tenant.id)
                          }
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}
