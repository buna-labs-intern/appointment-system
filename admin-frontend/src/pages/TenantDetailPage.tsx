import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')

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
    onSuccess: invalidate,
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
    return <p className="text-sm text-slate-500">Loading clinic...</p>
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-sm text-red-700">
        Clinic not found or failed to load.{' '}
        <Link to="/tenants" className="font-medium underline">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/tenants" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All clinics
          </Link>
          <h1 className="flex items-center gap-3 text-xl font-bold text-slate-900">
            {tenant.name}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                tenant.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {tenant.isActive ? 'Active' : 'Banned'}
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            /{tenant.slug}
            {tenant.defaultBranch ? ` · default branch: ${tenant.defaultBranch.name}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditName(tenant.name)
              setEditPhone(tenant.phone ?? '')
              setEditAddress(tenant.address ?? '')
              setShowEdit((prev) => !prev)
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          {tenant.isActive ? (
            <button
              type="button"
              onClick={() => {
                setError('')
                const reason = window.prompt('Reason for banning this clinic (optional):') ?? undefined
                blockMutation.mutate({ tid: tenant.id, reason: reason || undefined })
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Ban clinic
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError('')
                unblockMutation.mutate(tenant.id)
              }}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Unban clinic
            </button>
          )}
        </div>
      </div>

      {tenant.blockedReason ? (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          Ban reason: {tenant.blockedReason}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {showEdit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError('')
            updateMutation.mutate()
          }}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-3"
        >
          <div>
            <label htmlFor="editName" className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="editName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66]"
            />
          </div>
          <div>
            <label htmlFor="editPhone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="editPhone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66]"
            />
          </div>
          <div>
            <label htmlFor="editAddress" className="mb-1 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              id="editAddress"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66]"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-[#0F5C66] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Branches</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{tenant._count?.branches ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Users</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{tenant._count?.users ?? 0}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Patients</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{tenant._count?.patients ?? 0}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Contact</dt>
            <dd className="mt-1 text-sm text-slate-600">
              {tenant.phone ?? 'No phone'}
              {tenant.address ? ` · ${tenant.address}` : ''}
            </dd>
          </div>
        </dl>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
          Branches
        </h2>
        {branchesQuery.isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading branches...</p>
        ) : (branchesQuery.data ?? []).length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">No branches yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(branchesQuery.data ?? []).map((branch) => (
              <li key={branch.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{branch.name}</p>
                  <p className="text-xs text-slate-400">
                    /{branch.slug}
                    {branch.address ? ` · ${branch.address}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{branch._count?.doctors ?? 0} doctors</span>
                  <span>{branch._count?.appointments ?? 0} appointments</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      branch.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {branch.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
