import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost' | 'text'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-gold text-background hover:bg-gold/90',
  ghost: 'border border-ink/20 text-ink hover:border-gold hover:text-gold',
  text: 'text-gold underline-offset-4 hover:underline',
}

interface CommonProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

type ButtonProps = CommonProps &
  (
    | { to: string }
    | ({ to?: undefined } & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'disabled'>)
  )

/**
 * Одна кнопка на два случая: переход (Link) и действие (button).
 * variant — внешний вид. Поведение задаёт наличие to.
 */
export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center px-4 py-2.5 text-[13px] tracking-[0.14em] uppercase transition duration-200 disabled:cursor-not-allowed disabled:opacity-40',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
    VARIANT_CLASS[variant],
    className,
  )

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    )
  }

  const { onClick, type = 'button', disabled } = props as Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'type' | 'disabled'
  >

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}
