import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

type Common = {
  children: ReactNode
  /** `ghost` is accepted as an alias for `tertiary` */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Use on charcoal / dark stages */
  onDark?: boolean
  className?: string
}

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined }

type ButtonAsLink = Common & {
  to: string
  onClick?: () => void
  disabled?: boolean
}

function resolveVariant(variant: ButtonVariant): 'primary' | 'secondary' | 'tertiary' {
  return variant === 'ghost' ? 'tertiary' : variant
}

function btnClass(
  variant: ButtonVariant,
  size: ButtonSize,
  onDark: boolean,
  className: string,
) {
  return [
    'oke-btn',
    `oke-btn--${resolveVariant(variant)}`,
    `oke-btn--${size}`,
    onDark ? 'oke-btn--on-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  if ('to' in props && props.to) {
    const {
      children,
      variant = 'primary',
      size = 'md',
      onDark = false,
      className = '',
      to,
      onClick,
      disabled,
    } = props

    return (
      <Link
        to={to}
        className={btnClass(variant, size, onDark, className)}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault()
            return
          }
          onClick?.()
        }}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButton
  const {
    children,
    variant = 'primary',
    size = 'md',
    onDark = false,
    className = '',
    type = 'button',
    ...rest
  } = buttonProps

  return (
    <button
      type={type}
      className={btnClass(variant, size, onDark, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
