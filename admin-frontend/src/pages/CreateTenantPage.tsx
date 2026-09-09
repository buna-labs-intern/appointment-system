import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'
import type { CreateTenantInput } from '@/types/api'

type FormState = {
  name: string
  slug: string
  address: string
  phone: string
  ownerFullName: string
  ownerEmail: string
  ownerPhone: string
  ownerPassword: string
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  ownerFullName: '',
  ownerEmail: '',
  ownerPhone: '',
  ownerPassword: '',
}

export default function CreateTenantPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (input: CreateTenantInput) => tenantApi.create(input),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      navigate(`/tenants/${tenant.id}`)
    },
    onError: (err: unknown) => setError(extractApiError(err)),
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const input: CreateTenantInput = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      owner: {
        fullName: form.ownerFullName.trim(),
        email: form.ownerEmail.trim().toLowerCase(),
        phone: form.ownerPhone.trim(),
        password: form.ownerPassword,
      },
    }
    mutation.mutate(input)
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0F5C66] focus:ring-2 focus:ring-[#0F5C66]/20'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Register a clinic</h1>
          <p className="text-sm text-slate-500">
            Creates the clinic, its Main Branch and the owner account in one step.
          </p>
        </div>
        <Link to="/tenants" className="text-sm font-medium text-[#0F5C66] hover:underline">
          Back to list
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Clinic details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Clinic name *
              </label>
              <input
                id="name"
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass}
                placeholder="Hargeisa Medical Center"
              />
            </div>
            <div>
              <label htmlFor="slug" className="mb-1 block text-sm font-medium text-slate-700">
                Slug (optional)
              </label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                className={inputClass}
                placeholder="auto-generated from name"
                pattern="[a-z0-9\-]*"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                Clinic phone
              </label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
                placeholder="+252 61 000 0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                id="address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className={inputClass}
                placeholder="Main street, Hargeisa"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Owner account
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            The owner signs in with this account and must change the password on first login.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="ownerFullName" className="mb-1 block text-sm font-medium text-slate-700">
                Owner full name *
              </label>
              <input
                id="ownerFullName"
                required
                minLength={2}
                value={form.ownerFullName}
                onChange={(e) => update('ownerFullName', e.target.value)}
                className={inputClass}
                placeholder="Dr. Khadija Ali"
              />
            </div>
            <div>
              <label htmlFor="ownerEmail" className="mb-1 block text-sm font-medium text-slate-700">
                Owner email *
              </label>
              <input
                id="ownerEmail"
                type="email"
                required
                value={form.ownerEmail}
                onChange={(e) => update('ownerEmail', e.target.value)}
                className={inputClass}
                placeholder="owner@clinic.com"
              />
            </div>
            <div>
              <label htmlFor="ownerPhone" className="mb-1 block text-sm font-medium text-slate-700">
                Owner phone *
              </label>
              <input
                id="ownerPhone"
                required
                minLength={7}
                maxLength={20}
                value={form.ownerPhone}
                onChange={(e) => update('ownerPhone', e.target.value)}
                className={inputClass}
                placeholder="+252 63 000 0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ownerPassword" className="mb-1 block text-sm font-medium text-slate-700">
                Temporary password * <span className="font-normal text-slate-400">(6-30 characters)</span>
              </label>
              <input
                id="ownerPassword"
                type="text"
                required
                minLength={6}
                maxLength={30}
                value={form.ownerPassword}
                onChange={(e) => update('ownerPassword', e.target.value)}
                className={inputClass}
                placeholder="Shared once, changed at first login"
              />
            </div>
          </div>
        </section>

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="flex justify-end gap-3">
          <Link
            to="/tenants"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-[#0F5C66] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4B53] disabled:opacity-60"
          >
            {mutation.isPending ? 'Creating...' : 'Create clinic'}
          </button>
        </div>
      </form>
    </div>
  )
}
