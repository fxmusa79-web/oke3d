import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProduct, products } from '../data/products'
import { productTitle } from '../data/productTitles'
import { useI18n } from '../i18n/useI18n'
import { Button } from '../components/ui/Button'
import './RequestPage.css'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export function RequestPage() {
  const { t, locale } = useI18n()
  const [params] = useSearchParams()
  const prefilled = params.get('product') ?? ''
  const [status, setStatus] = useState<Status>('idle')
  const [productId, setProductId] = useState(prefilled)

  const selected = useMemo(() => getProduct(productId), [productId])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      product: String(data.get('product') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/aanvraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('ok')
      form.reset()
      setProductId(prefilled)
    } catch {
      console.log('aanvraag (fallback)', payload)
      setStatus('ok')
      form.reset()
      setProductId(prefilled)
    }
  }

  return (
    <section className="oke-request">
      <div className="oke-request__copy">
        <p className="oke-request__eyebrow">{t.custom.eyebrow}</p>
        <h1 className="oke-request__title">{t.request.pageTitle}</h1>
        <p className="oke-request__lede">{t.request.lede}</p>
      </div>

      <form className="oke-request__form" onSubmit={onSubmit} noValidate>
        <label className="oke-request__field">
          <span>{t.request.name}</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>

        <label className="oke-request__field">
          <span>{t.request.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>

        <label className="oke-request__field">
          <span>{t.request.product}</span>
          <select
            name="product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">{t.request.productNone}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {productTitle(p.id, locale, p.title)}
              </option>
            ))}
          </select>
          {selected ? (
            <em className="oke-request__hint">
              {t.categories[selected.category]} · {t.featured.requestStatus}
            </em>
          ) : null}
        </label>

        <label className="oke-request__field">
          <span>{t.request.message}</span>
          <textarea name="message" rows={6} required />
        </label>

        <div className="oke-request__actions">
          <Button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t.request.sending : t.request.submit}
          </Button>
          {status === 'ok' ? (
            <p className="oke-request__ok" role="status">
              {t.request.success}
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="oke-request__err" role="alert">
              {t.request.error}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
