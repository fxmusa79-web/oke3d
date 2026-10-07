import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

type Common = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined }

type ButtonAsLink = Common & { to: string; onClick?: () => void }

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...rest
  } = props
  const classes = `oke-btn oke-btn--${variant} oke-btn--${size} ${className}`.trim()

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} onClick={props.onClick}>
        {children}
      </Link>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
