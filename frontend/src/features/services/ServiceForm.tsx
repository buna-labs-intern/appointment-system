import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { serviceSchema, type ServiceFormValues } from '@/features/services/serviceSchema'

type ServiceFormProps = {
  defaultValues?: Partial<ServiceFormValues>
  onSubmit: (values: ServiceFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export default function ServiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save service',
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      price: 0,
      duration: 30,
      isActive: true,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service name</FormLabel>
              <FormControl>
                <Input placeholder="General Consultation" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Consultation" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Short description of this service"
                  disabled={isSubmitting}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={isSubmitting}
                    value={Number.isFinite(field.value) ? field.value : 0}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    disabled={isSubmitting}
                    value={Number.isFinite(field.value) ? field.value : 30}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-input"
                />
                Active service
              </label>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0F5C66] hover:bg-[#0C4B53]"
          >
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}