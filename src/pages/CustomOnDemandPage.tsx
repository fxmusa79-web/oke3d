import { useEffect, useState } from 'react'
import { CustomDesignModal } from '../components/custom/CustomDesignModal'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n/useI18n'
import './CustomOnDemandPage.css'

/** `/op-maat` — thin page that opens the custom OKE popup (no full-page form). */
export function CustomOnDemandPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <>
      <Seo
        title={`${t.nav.custom} — OKE3D`}
        description={t.customCta.lede}
        path="/op-maat"
      />
      <section className="oke-on-demand">
        <p className="oke-on-demand__eyebrow">{t.customCta.eyebrow}</p>
        <h1>{t.customCta.title}</h1>
        <p className="oke-on-demand__lede">{t.customCta.lede}</p>
        <Button type="button" variant="primary" onClick={() => setOpen(true)}>
          {t.customCta.cta}
        </Button>
      </section>
      <CustomDesignModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
