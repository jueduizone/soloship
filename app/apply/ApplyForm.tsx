'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Dictionary } from '@/lib/i18n'

type FormState = {
  name: string
  city: string
  contact: string
  bio: string
  build_direction: string
  project_idea: string
  links: string
}

export function ApplyForm({
  eventId,
  email,
  initial,
  isUpdate,
  copy,
}: {
  eventId: string
  email: string
  initial: FormState
  isUpdate: boolean
  copy: Dictionary
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof FormState>(k: K, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const links = form.links
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(url => ({ label: url, url }))

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          email,
          name: form.name,
          city: form.city || null,
          contact: form.contact || null,
          bio: form.bio || null,
          build_direction: form.build_direction || null,
          project_idea: form.project_idea || null,
          links,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? copy.common.error)
        return
      }
      router.push('/apply/status')
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="ss-form-error">{error}</div>}

      <div className="ss-field">
        <label htmlFor="email">{copy.apply.form.email}</label>
        <input id="email" className="ss-input" type="email" value={email} disabled />
        <div className="ss-field-hint">{copy.apply.form.emailHint}</div>
      </div>

      <div className="ss-field">
        <label htmlFor="name">{copy.apply.form.name}</label>
        <input
          id="name"
          className="ss-input"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="city">{copy.apply.form.city}</label>
        <input
          id="city"
          className="ss-input"
          required
          value={form.city}
          onChange={e => set('city', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="contact">{copy.apply.form.contact}</label>
        <input
          id="contact"
          className="ss-input"
          required
          value={form.contact}
          onChange={e => set('contact', e.target.value)}
          placeholder={copy.apply.form.contactPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="bio">{copy.apply.form.bio}</label>
        <input
          id="bio"
          className="ss-input"
          required
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder={copy.apply.form.bioPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="direction">{copy.apply.form.direction}</label>
        <input
          id="direction"
          className="ss-input"
          value={form.build_direction}
          onChange={e => set('build_direction', e.target.value)}
          placeholder={copy.apply.form.directionPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="idea">{copy.apply.form.idea}</label>
        <textarea
          id="idea"
          className="ss-textarea"
          value={form.project_idea}
          onChange={e => set('project_idea', e.target.value)}
          placeholder={copy.apply.form.ideaPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="links">{copy.apply.form.links}</label>
        <textarea
          id="links"
          className="ss-textarea"
          value={form.links}
          onChange={e => set('links', e.target.value)}
          placeholder={'https://github.com/yourname\nhttps://x.com/yourname'}
        />
        <div className="ss-field-hint">{copy.apply.form.linksHint}</div>
      </div>

      <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending} aria-busy={pending}>
        {pending ? (
          <span className="ss-loading-label"><span className="ss-auth-spinner" />{copy.apply.form.submitting}</span>
        ) : isUpdate ? copy.apply.form.update : copy.apply.form.submit}
      </button>
    </form>
  )
}
