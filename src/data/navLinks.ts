export type NavLinkItem = {
  to: string
  /** i18n key under t.nav */
  labelKey:
    | 'collection'
    | 'editions'
    | 'accessories'
    | 'materials'
    | 'custom'
    | 'about'
    | 'request'
}

/** Primary browse destinations — used by header + mobile drawer */
export const primaryNav: NavLinkItem[] = [
  { to: '/collectie', labelKey: 'collection' },
  { to: '/edities', labelKey: 'editions' },
  { to: '/accessoires', labelKey: 'accessories' },
  { to: '/materialen', labelKey: 'materials' },
  { to: '/op-maat', labelKey: 'custom' },
  { to: '/over', labelKey: 'about' },
]

export const drawerExtraNav: NavLinkItem[] = [
  { to: '/aanvragen', labelKey: 'request' },
]
