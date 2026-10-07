import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useI18n } from '../../i18n/useI18n'
import { ConfettiBurst } from './ConfettiBurst'
import { OkePhotoMockup } from './OkePhotoMockup'
import './CustomDesignModal.css'

const CustomPhoto3DPreview = lazy(() =>
  import('./CustomPhoto3DPreview').then((m) => ({ default: m.CustomPhoto3DPreview })),
)

gsap.registerPlugin(useGSAP)

type Props = {
  open: boolean
  onClose: () => void
}

type Status = 'idle' | 'sending' | 'ok' | 'error'

/** Interactive form steps; step 4 = success */
const FORM_STEPS = 3
const STEPPER_LABELS = ['Upload', '3D', 'Details', 'Klaar'] as const

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function CustomDesignModal({ open, onClose }: Props) {
  const { t } = useI18n()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [draggingFile, setDraggingFile] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setStatus('idle')
      setError('')
      setName('')
      setEmail('')
      setDescription('')
      setFile(null)
      setDraggingFile(false)
      setConfetti(false)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when closing
  }, [open])

  useGSAP(
    () => {
      if (!open || !dialogRef.current) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        gsap.set(dialogRef.current, { opacity: 1 })
        return
      }
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' },
      )
    },
    { dependencies: [open] },
  )

  useGSAP(
    () => {
      if (!open || !panelRef.current) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        gsap.set(panelRef.current, { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      )
    },
    { dependencies: [step, open, status] },
  )

  const applyFile = (next: File | undefined) => {
    if (!next || !next.type.startsWith('image/')) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setConfetti(true)
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0])
  }

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDraggingFile(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  const canNext =
    (step === 1 && !!previewUrl) ||
    step === 2 ||
    (step === 3 && name.trim() && email.trim() && description.trim())

  const submit = async () => {
    setStatus('sending')
    setError('')
    const payload = {
      name: name.trim(),
      email: email.trim(),
      description: description.trim(),
      desc: description.trim(),
      imageBase64: file ? await fileToBase64(file) : undefined,
      imageName: file?.name,
      imageType: file?.type,
    }

    try {
      const res = await fetch('/api/custom-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('fail')
      setStatus('ok')
      setStep(4)
      setConfetti(true)
    } catch {
      try {
        const key = 'oke3d-custom-requests'
        const prev = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[]
        prev.push({
          name: payload.name,
          email: payload.email,
          description: payload.description,
          at: new Date().toISOString(),
        })
        localStorage.setItem(key, JSON.stringify(prev))
        setStatus('ok')
        setStep(4)
        setConfetti(true)
      } catch {
        setStatus('error')
        setError(t.customCta.modal.error)
      }
    }
  }

  if (!open) return null

  const progressStep = status === 'ok' ? 4 : step
  const progressPct = ((progressStep - 1) / 3) * 100

  return createPortal(
    <div
      className="cdm-root"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <ConfettiBurst active={confetti} onDone={() => setConfetti(false)} />
      <div
        ref={dialogRef}
        className="cdm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="cdm-header">
          <div>
            <p className="cdm-eyebrow">{t.customCta.eyebrow}</p>
            <h2 id={titleId} className="cdm-title">
              {status === 'ok' ? t.customCta.modal.successTitle : t.customCta.modal.title}
            </h2>
          </div>
          <button
            type="button"
            className="cdm-close"
            aria-label={t.customCta.modal.close}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="cdm-stepper" aria-hidden="true">
          <div className="cdm-stepper__labels">
            {STEPPER_LABELS.map((label, i) => (
              <span
                key={label}
                className={`cdm-stepper__label${progressStep === i + 1 ? ' is-active' : ''}${
                  progressStep > i + 1 ? ' is-done' : ''
                }`}
              >
                {String(i + 1).padStart(2, '0')} · {label}
              </span>
            ))}
          </div>
          <div className="cdm-stepper__bar">
            <span className="cdm-stepper__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="cdm-body">
          <div ref={panelRef} className="cdm-panel">
            {status === 'ok' || step === 4 ? (
              <div className="cdm-success">
                <h3>{t.customCta.modal.successTitle}</h3>
                <p>{t.customCta.modal.successBody}</p>
                {previewUrl ? <OkePhotoMockup photoUrl={previewUrl} /> : null}
              </div>
            ) : null}

            {status !== 'ok' && step === 1 ? (
              <div className="cdm-step1">
                <p className="cdm-lede">{t.customCta.modal.uploadHint}</p>
                <label
                  className={`cdm-dropzone ${draggingFile ? 'is-drag' : ''} ${
                    previewUrl ? 'has-preview' : ''
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    setDraggingFile(true)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDraggingFile(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setDraggingFile(false)
                  }}
                  onDrop={onDrop}
                >
                  <input type="file" accept="image/*" onChange={onFile} />
                  <span className="cdm-dropzone__icon" aria-hidden="true">
                    ↑
                  </span>
                  <p className="cdm-dropzone__hint">{t.customCta.modal.uploadCta}</p>
                  <p className="cdm-dropzone__sub">Sleep een foto hierheen of klik om te kiezen</p>
                </label>

                {previewUrl ? (
                  <div className="cdm-step1__preview">
                    <OkePhotoMockup photoUrl={previewUrl} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {status !== 'ok' && step === 2 ? (
              <>
                <p className="cdm-tilt-title">{t.customCta.modal.previewLabel}</p>
                <p className="cdm-lede">{t.customCta.modal.previewHint}</p>
                {previewUrl ? (
                  <Suspense
                    fallback={
                      <div className="cdm-3d-fallback">
                        <p>{t.customCta.modal.previewLoading}</p>
                      </div>
                    }
                  >
                    <CustomPhoto3DPreview
                      imageUrl={previewUrl}
                      label={t.customCta.modal.previewLabel}
                      loadingLabel={t.customCta.modal.previewLoading}
                      readyLabel={t.customCta.modal.previewReady}
                      fallbackLabel={t.customCta.modal.previewFallback}
                    />
                  </Suspense>
                ) : null}
              </>
            ) : null}

            {status !== 'ok' && step === 3 ? (
              <>
                <label className="cdm-field">
                  <span>{t.customCta.modal.name}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="cdm-field">
                  <span>{t.customCta.modal.email}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="cdm-field">
                  <span>{t.customCta.modal.description}</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                  />
                </label>
                {error ? <p className="cdm-error">{error}</p> : null}
              </>
            ) : null}
          </div>
        </div>

        <footer className="cdm-footer">
          {status === 'ok' ? (
            <>
              <span />
              <button type="button" className="cdm-btn cdm-btn--primary" onClick={onClose}>
                {t.customCta.modal.done}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cdm-btn cdm-btn--ghost"
                onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
              >
                {step === 1 ? t.customCta.modal.close : t.customCta.modal.back}
              </button>
              {step < FORM_STEPS ? (
                <button
                  type="button"
                  className="cdm-btn cdm-btn--primary"
                  disabled={!canNext}
                  onClick={() => setStep((s) => Math.min(FORM_STEPS, s + 1))}
                >
                  {t.customCta.modal.next}
                </button>
              ) : (
                <button
                  type="button"
                  className="cdm-btn cdm-btn--primary"
                  disabled={!canNext || status === 'sending'}
                  onClick={() => void submit()}
                >
                  {status === 'sending'
                    ? t.customCta.modal.sending
                    : t.customCta.modal.submit}
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  )
}
