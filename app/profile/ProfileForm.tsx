'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileVisibility } from '@/lib/db/types'
import type { Dictionary } from '@/lib/i18n'

type FormState = {
  id?: string
  display_name: string
  avatar_url: string
  one_liner: string
  city: string
  tags: string
  project_name: string
  project_intro: string
  links: string
  visibility: ProfileVisibility
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export function ProfileForm({ initial, copy }: { initial: FormState; copy: Dictionary }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(initial.id ?? null)
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavedId(null)

    startTransition(async () => {
      const parsedLinks = []
      for (const raw of form.links.split('\n')) {
        const value = raw.trim()
        if (!value) continue
        const normalized = normalizeUrl(value)
        if (!normalized) {
          setError(`${copy.profile.form.invalidLinkPrefix}${value}${copy.profile.form.invalidLinkSuffix}`)
          return
        }
        parsedLinks.push({ label: normalized.replace(/^https?:\/\//, '').replace(/\/$/, ''), url: normalized })
      }

      const avatarUrl = normalizeUrl(form.avatar_url)
      if (avatarUrl === null) {
        setError(copy.profile.form.invalidAvatar)
        return
      }

      const tags = form.tags
        .split(/[,，、]/)
        .map(s => s.trim())
        .filter(Boolean)

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: form.display_name,
          avatar_url: avatarUrl || null,
          one_liner: form.one_liner || null,
          city: form.city || null,
          tags,
          project_name: form.project_name || null,
          project_intro: form.project_intro || null,
          links: parsedLinks,
          visibility: form.visibility,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? copy.profile.form.saveError)
        return
      }
      const id = typeof data?.profile?.id === 'string' ? data.profile.id : null
      setSavedId(id)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="ss-form-error">{error}</div>}
      {savedId && (
        <div className="ss-form-success">
          {copy.profile.form.saved}<Link href={`/fellows/${savedId}`}>{copy.profile.form.viewProfile}</Link>
        </div>
      )}

      <div className="ss-field">
        <label htmlFor="display_name">{copy.profile.form.displayName}</label>
        <input
          id="display_name"
          className="ss-input"
          required
          value={form.display_name}
          onChange={e => set('display_name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="avatar_url">{copy.profile.form.avatarUrl}</label>
        <input
          id="avatar_url"
          className="ss-input"
          type="url"
          value={form.avatar_url}
          onChange={e => set('avatar_url', e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
        <p className="ss-field-hint">{copy.profile.form.avatarHint}</p>
      </div>

      <div className="ss-field">
        <label htmlFor="one_liner">{copy.profile.form.oneLiner}</label>
        <input
          id="one_liner"
          className="ss-input"
          value={form.one_liner}
          onChange={e => set('one_liner', e.target.value)}
          placeholder={copy.profile.form.oneLinerPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="city">{copy.profile.form.city}</label>
        <input
          id="city"
          className="ss-input"
          value={form.city}
          onChange={e => set('city', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="tags">{copy.profile.form.tags}</label>
        <input
          id="tags"
          className="ss-input"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
          placeholder={copy.profile.form.tagsPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="project_name">{copy.profile.form.projectName}</label>
        <input
          id="project_name"
          className="ss-input"
          value={form.project_name}
          onChange={e => set('project_name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="project_intro">{copy.profile.form.projectIntro}</label>
        <textarea
          id="project_intro"
          className="ss-textarea"
          value={form.project_intro}
          onChange={e => set('project_intro', e.target.value)}
          placeholder={copy.profile.form.projectIntroPlaceholder}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="links">{copy.profile.form.links}</label>
        <textarea
          id="links"
          className="ss-textarea"
          value={form.links}
          onChange={e => set('links', e.target.value)}
          placeholder={'https://github.com/yourname\nhttps://x.com/yourname'}
        />
        <p className="ss-field-hint">{copy.profile.form.linksHint}</p>
      </div>

      <div className="ss-field">
        <label htmlFor="visibility">{copy.profile.form.visibility}</label>
        <select
          id="visibility"
          className="ss-select"
          value={form.visibility}
          onChange={e => set('visibility', e.target.value as ProfileVisibility)}
        >
          <option value="public">{copy.profile.form.public}</option>
          <option value="cohort_only">{copy.profile.form.cohortOnly}</option>
          <option value="private">{copy.profile.form.private}</option>
        </select>
      </div>

      <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending} aria-busy={pending}>
        {pending ? (
          <span className="ss-loading-label"><span className="ss-auth-spinner" />{copy.profile.form.saving}</span>
        ) : copy.profile.form.save}
      </button>
    </form>
  )
}
