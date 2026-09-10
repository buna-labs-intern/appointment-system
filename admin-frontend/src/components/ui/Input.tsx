import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

const base =
  'h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-ink placeholder:text-faint transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent-ring focus:outline-none disabled:bg-canvas'

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, className, id, ...rest },
  ref,
) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input ref={ref} id={id} className={twMerge(clsx(base), className)} {...rest} />
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  )
})

export default Input
