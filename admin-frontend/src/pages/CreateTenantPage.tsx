import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { tenantApi } from '@/features/tenants/tenantApi'
import { extractApiError } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-rise">
        <Link
          to="/tenants"
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All clinics
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Register a clinic</h1>
        <p className="mt-0.5 text-sm text-muted">
          Creates the clinic, its Main Branch and the owner account in one step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="animate-rise p-6">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Clinic details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="name"
                label="Clinic name"
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Hargeisa Medical Center"
              />
            </div>
            <Input
              id="slug"
              label="Slug"
              hint="Optional — generated from the name when empty"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              placeholder="hargeisa-medical"
              pattern="[a-z0-9\-]*"
            />
            <Input
              id="phone"
              label="Clinic phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+252 61 000 0000"
            />
            <div className="sm:col-span-2">
              <Input
                id="address"
                label="Address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Main street, Hargeisa"
              />
            </div>
          </div>
        </Card>

        <Card className="animate-rise p-6">
          <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Owner account
          </h2>
          <p className="mb-5 text-xs text-faint">
            The owner signs in with this account and must change the password on first login.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="ownerFullName"
                label="Owner full name"
                required
                minLength={2}
                value={form.ownerFullName}
                onChange={(e) => update('ownerFullName', e.target.value)}
                placeholder="Dr. Khadija Ali"
              />
            </div>
            <Input
              id="ownerEmail"
              label="Owner email"
              type="email"
              required
              value={form.ownerEmail}
              onChange={(e) => update('ownerEmail', e.target.value)}
              placeholder="owner@clinic.com"
            />
            <Input
              id="ownerPhone"
              label="Owner phone"
              required
              minLength={7}
              maxLength={20}
              value={form.ownerPhone}
              onChange={(e) => update('ownerPhone', e.target.value)}
              placeholder="+252 63 000 0000"
            />
            <div className="sm:col-span-2">
              <Input
                id="ownerPassword"
                label="Temporary password"
                hint="6–30 characters. Shared once — the owner replaces it at first login."
                type="text"
                required
                minLength={6}
                maxLength={30}
                value={form.ownerPassword}
                onChange={(e) => update('ownerPassword', e.target.value)}
                placeholder="Temp pass shared with the owner"
              />
            </div>
          </div>
        </Card>

        {error ? (
          <div className="animate-rise rounded-lg border border-red-200 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Link to="/tenants">
            <Button variant="soft" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create clinic'}
          </Button>
        </div>
      </form>
    </div>
  )
}
