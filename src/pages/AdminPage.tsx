import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './AdminPage.css'

type RequestStatus = 'new' | 'seen' | 'done'
type RequestType = 'custom' | 'product'

type RequestRow = {
  id: string
  name: string
  email: string
  description: string
  image_key: string | null
  created_at: string
  type: RequestType
  product: string | null
  status: RequestStatus
}

const AUTH_KEY = 'oke3d-admin-auth'

function loadAuth(): string | null {
  try {
    return sessionStorage.getItem(AUTH_KEY)
  } catch {
    return null
  }
}

function saveAuth(value: string | null) {
  try {
    if (value) sessionStorage.setItem(AUTH_KEY, value)
    else sessionStorage.removeItem(AUTH_KEY)
  } catch {
    /* ignore */
  }
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function AdminPhoto({
  authFetch,
  imageKey,
  name,
}: {
  authFetch: (path: string, init?: RequestInit) => Promise<Response>
  imageKey: string
  name: string
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    setSrc(null)
    setFailed(false)
    void authFetch(`/api/admin/files?key=${encodeURIComponent(imageKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error('file')
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [authFetch, imageKey])

  if (failed) return <p className="oke-admin__muted">Foto kon niet geladen worden.</p>
  if (!src) return <p className="oke-admin__muted">Foto laden…</p>
  return <img className="oke-admin__photo" src={src} alt={`Upload van ${name}`} />
}

export function AdminPage() {
  const [auth, setAuth] = useState<string | null>(() => loadAuth())
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listError, setListError] = useState('')

  const selected = requests.find((r) => r.id === selectedId) ?? null

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!auth) throw new Error('not authed')
      const res = await fetch(path, {
        ...init,
        headers: {
          Authorization: `Basic ${auth}`,
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...init?.headers,
        },
      })
      if (res.status === 401) {
        saveAuth(null)
        setAuth(null)
        throw new Error('unauthorized')
      }
      return res
    },
    [auth],
  )

  const refresh = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    setListError('')
    try {
      const res = await api('/api/admin/requests')
      const data = (await res.json()) as { ok?: boolean; requests?: RequestRow[]; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'load failed')
      setRequests(data.requests ?? [])
    } catch (err) {
      setListError(err instanceof Error && err.message === 'unauthorized' ? 'Sessie verlopen — log opnieuw in.' : 'Kon aanvragen niet laden. Is D1 gekoppeld?')
    } finally {
      setLoading(false)
    }
  }, [api, auth])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const token = btoa(`${user}:${pass}`)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { Authorization: `Basic ${token}` },
      })
      if (res.status === 401) {
        setLoginError('Onjuiste gebruiker of wachtwoord.')
        return
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setLoginError(data.error ?? 'Login mislukt — is de Worker live met D1?')
        return
      }
      saveAuth(token)
      setAuth(token)
      setPass('')
    } catch {
      setLoginError('Geen verbinding met de API.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    saveAuth(null)
    setAuth(null)
    setRequests([])
    setSelectedId(null)
  }

  const setStatus = async (id: string, status: RequestStatus) => {
    try {
      const res = await api(`/api/admin/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('patch failed')
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch {
      setListError('Status bijwerken mislukt.')
    }
  }

  if (!auth) {
    return (
      <div className="oke-admin oke-admin--login">
        <form className="oke-admin__login" onSubmit={onLogin}>
          <p className="oke-admin__eyebrow">OKE3D</p>
          <h1 className="oke-admin__title">Admin</h1>
          <label className="oke-admin__field">
            <span>Gebruiker</span>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="oke-admin__field">
            <span>Wachtwoord</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {loginError ? <p className="oke-admin__error">{loginError}</p> : null}
          <button type="submit" className="oke-admin__btn">
            Inloggen
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="oke-admin">
      <header className="oke-admin__bar">
        <div>
          <p className="oke-admin__eyebrow">OKE3D</p>
          <h1 className="oke-admin__title">Aanvragen</h1>
        </div>
        <div className="oke-admin__bar-actions">
          <button type="button" className="oke-admin__btn oke-admin__btn--ghost" onClick={() => void refresh()}>
            Vernieuwen
          </button>
          <button type="button" className="oke-admin__btn oke-admin__btn--ghost" onClick={logout}>
            Uitloggen
          </button>
        </div>
      </header>

      {listError ? <p className="oke-admin__error oke-admin__error--banner">{listError}</p> : null}

      <div className="oke-admin__layout">
        <aside className="oke-admin__list">
          {loading && !requests.length ? <p className="oke-admin__muted">Laden…</p> : null}
          {!loading && !requests.length ? <p className="oke-admin__muted">Nog geen aanvragen.</p> : null}
          <ul>
            {requests.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`oke-admin__row${selectedId === r.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <span className="oke-admin__row-top">
                    <strong>{r.name}</strong>
                    <span className={`oke-admin__badge oke-admin__badge--${r.status}`}>{r.status}</span>
                  </span>
                  <span className="oke-admin__row-meta">
                    {r.type}
                    {r.product ? ` · ${r.product}` : ''}
                    {' · '}
                    {formatDate(r.created_at)}
                  </span>
                  <span className="oke-admin__row-desc">{r.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="oke-admin__detail">
          {!selected ? (
            <p className="oke-admin__muted">Selecteer een aanvraag.</p>
          ) : (
            <>
              <div className="oke-admin__detail-head">
                <h2>{selected.name}</h2>
                <p>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </p>
                <p className="oke-admin__muted">
                  {selected.type}
                  {selected.product ? ` · ${selected.product}` : ''}
                  {' · '}
                  {formatDate(selected.created_at)}
                  {' · '}
                  {selected.id}
                </p>
              </div>

              <div className="oke-admin__status-row">
                {(['new', 'seen', 'done'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`oke-admin__btn${selected.status === s ? '' : ' oke-admin__btn--ghost'}`}
                    onClick={() => void setStatus(selected.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="oke-admin__body">
                <h3>Beschrijving</h3>
                <p className="oke-admin__description">{selected.description}</p>
              </div>

              {selected.image_key ? (
                <div className="oke-admin__body">
                  <h3>Foto</h3>
                  <AdminPhoto authFetch={api} imageKey={selected.image_key} name={selected.name} />
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
