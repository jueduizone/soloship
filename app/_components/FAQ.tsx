import { faq } from './content'

export function FAQ() {
  return (
    <section id="faq" className="ss-section is-light ss-hairline-top on-light">
      <div className="ss-container">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
          <div>
            <div className="ss-eyebrow is-light mb-6">{faq.eyebrow}</div>
            <h2
              className="ss-h2 is-light"
              style={{ fontSize: 'clamp(28px, 3.4vw, 40px)' }}
            >
              {faq.headline}
            </h2>
          </div>
          <div>
            {faq.items.map((it) => (
              <details key={it.q} className="ss-faq-item">
                <summary>
                  <span>{it.q}</span>
                  <span className="ss-faq-plus" aria-hidden />
                </summary>
                <div className="ss-faq-body">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
