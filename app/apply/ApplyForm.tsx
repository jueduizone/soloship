'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'

type FormState = {
  name: string
  city: string
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
}: {
  eventId: string
  email: string
  initial: FormState
  isUpdate: boolean
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
          bio: form.bio || null,
          build_direction: form.build_direction || null,
          project_idea: form.project_idea || null,
          links,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? t.common.error)
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
        <label htmlFor="email">{t.apply.form.email}</label>
        <input id="email" className="ss-input" type="email" value={email} disabled />
        <div className="ss-field-hint">登录邮箱即报名邮箱，无法修改。</div>
      </div>

      <div className="ss-field">
        <label htmlFor="name">{t.apply.form.name}</label>
        <input
          id="name"
          className="ss-input"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="city">{t.apply.form.city}</label>
        <input
          id="city"
          className="ss-input"
          value={form.city}
          onChange={e => set('city', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="bio">{t.apply.form.bio}</label>
        <input
          id="bio"
          className="ss-input"
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="比如：独立开发者，做过 XX 工具"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="direction">{t.apply.form.direction}</label>
        <input
          id="direction"
          className="ss-input"
          value={form.build_direction}
          onChange={e => set('build_direction', e.target.value)}
          placeholder="工具 / 内容 / 社交 / B2B / Agent…"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="idea">{t.apply.form.idea}</label>
        <textarea
          id="idea"
          className="ss-textarea"
          required
          value={form.project_idea}
          onChange={e => set('project_idea', e.target.value)}
          placeholder="用一两段话讲清楚你想做什么、目标用户是谁、你觉得为什么值得做"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="links">{t.apply.form.links}</label>
        <textarea
          id="links"
          className="ss-textarea"
          value={form.links}
          onChange={e => set('links', e.target.value)}
          placeholder={'https://github.com/yourname\nhttps://x.com/yourname'}
        />
        <div className="ss-field-hint">一行一个链接，选填。</div>
      </div>

      <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending}>
        {pending ? '…' : isUpdate ? '更新申请' : t.apply.form.submit}
      </button>
    </form>
  )
}
