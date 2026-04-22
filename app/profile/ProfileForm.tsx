'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileVisibility } from '@/lib/db/types'

type FormState = {
  display_name: string
  one_liner: string
  city: string
  tags: string
  project_name: string
  project_intro: string
  links: string
  visibility: ProfileVisibility
}

export function ProfileForm({ initial }: { initial: FormState }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)

    startTransition(async () => {
      const links = form.links
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(url => ({ label: url, url }))

      const tags = form.tags
        .split(/[,，、]/)
        .map(s => s.trim())
        .filter(Boolean)

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: form.display_name,
          one_liner: form.one_liner || null,
          city: form.city || null,
          tags,
          project_name: form.project_name || null,
          project_intro: form.project_intro || null,
          links,
          visibility: form.visibility,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? '保存失败')
        return
      }
      setOk(true)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="ss-form-error">{error}</div>}
      {ok && <div className="ss-form-success">已保存。</div>}

      <div className="ss-field">
        <label htmlFor="display_name">展示名</label>
        <input
          id="display_name"
          className="ss-input"
          required
          value={form.display_name}
          onChange={e => set('display_name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="one_liner">一句话介绍</label>
        <input
          id="one_liner"
          className="ss-input"
          value={form.one_liner}
          onChange={e => set('one_liner', e.target.value)}
          placeholder="你是谁 / 在做什么"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="city">城市</label>
        <input
          id="city"
          className="ss-input"
          value={form.city}
          onChange={e => set('city', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="tags">标签</label>
        <input
          id="tags"
          className="ss-input"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
          placeholder="用逗号分隔，例：AI, 出海, iOS"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="project_name">项目名</label>
        <input
          id="project_name"
          className="ss-input"
          value={form.project_name}
          onChange={e => set('project_name', e.target.value)}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="project_intro">项目介绍</label>
        <textarea
          id="project_intro"
          className="ss-textarea"
          value={form.project_intro}
          onChange={e => set('project_intro', e.target.value)}
          placeholder="你想做什么、目标用户、当前进度"
        />
      </div>

      <div className="ss-field">
        <label htmlFor="links">链接（一行一个）</label>
        <textarea
          id="links"
          className="ss-textarea"
          value={form.links}
          onChange={e => set('links', e.target.value)}
          placeholder={'https://github.com/yourname\nhttps://x.com/yourname'}
        />
      </div>

      <div className="ss-field">
        <label htmlFor="visibility">可见性</label>
        <select
          id="visibility"
          className="ss-select"
          value={form.visibility}
          onChange={e => set('visibility', e.target.value as ProfileVisibility)}
        >
          <option value="public">公开 — 任何人可见</option>
          <option value="cohort_only">仅同期学员</option>
          <option value="private">私密 — 仅自己可见</option>
        </select>
      </div>

      <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending}>
        {pending ? '…' : '保存'}
      </button>
    </form>
  )
}
