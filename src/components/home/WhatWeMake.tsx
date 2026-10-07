import { useI18n } from '../../i18n/useI18n'
import './HomeSections.css'

export function WhatWeMake() {
  const { t } = useI18n()
  return (
    <section className="home-section" id="wat-we-maken" aria-labelledby="make-title">
      <div className="home-section__intro">
        <p className="home-section__eyebrow">{t.make.eyebrow}</p>
        <h2 id="make-title" className="home-section__title">
          {t.make.title}
        </h2>
        <p className="home-section__lede">{t.make.lede}</p>
      </div>
      <ul className="home-make__grid">
        {t.make.items.map((item) => (
          <li key={item.title} className="home-make__item">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
