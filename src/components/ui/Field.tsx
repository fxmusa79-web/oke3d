import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import './Field.css'

type FieldShellProps = {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FieldShell({ id, label, hint, error, children, className = '' }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`oke-field ${error ? 'oke-field--error' : ''} ${className}`.trim()}>
      <label className="oke-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="oke-field__control" data-describedby={describedBy}>
        {children}
      </div>
      {hint && !error ? (
        <p className="oke-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="oke-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
}

export function TextField({ id, label, hint, error, className = '', ...rest }: InputProps) {
  const describedBy = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={`oke-input ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
    </FieldShell>
  )
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
}

export function TextAreaField({ id, label, hint, error, className = '', ...rest }: AreaProps) {
  const describedBy = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        className={`oke-textarea ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
    </FieldShell>
  )
}
