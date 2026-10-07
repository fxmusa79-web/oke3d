import { createContext, useContext } from 'react'
import type { Dictionary, Locale } from './types'

export type I18nValue = {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
