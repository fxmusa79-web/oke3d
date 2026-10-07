import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/types'
import './LanguageSwitch.css'

function FlagNl() {
  return (
    <svg className="oke-lang__flag" viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="4" y="0" fill="#AE1C28" />
      <rect width="18" height="4" y="4" fill="#fff" />
      <rect width="18" height="4" y="8" fill="#21468B" />
    </svg>
  )
}

function FlagEn() {
  return (
    <svg className="oke-lang__flag" viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="12" fill="#012169" />
      <path
        d="M0 0 L18 12 M18 0 L0 12"
        stroke="#fff"
        strokeWidth="2.2"
      />
      <path
        d="M0 0 L18 12 M18 0 L0 12"
        stroke="#C8102E"
        strokeWidth="1.1"
      />
      <path d="M9 0 V12 M0 6 H18" stroke="#fff" strokeWidth="3.2" />
      <path d="M9 0 V12 M0 6 H18" stroke="#C8102E" strokeWidth="1.6" />
    </svg>
  )
}

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n()

  const set = (next: Locale) => () => setLocale(next)

  return (
    <div className="oke-lang" role="group" aria-label={t.nav.language}>
      <button
        type="button"
        className={`oke-lang__btn ${locale === 'nl' ? 'is-active' : ''}`}
        onClick={set('nl')}
        aria-pressed={locale === 'nl'}
        title="Nederlands"
      >
        <FlagNl />
        <span>NL</span>
      </button>
      <span className="oke-lang__sep" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={`oke-lang__btn ${locale === 'en' ? 'is-active' : ''}`}
        onClick={set('en')}
        aria-pressed={locale === 'en'}
        title="English"
      >
        <FlagEn />
        <span>EN</span>
      </button>
    </div>
  )
}
