'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileVisibility } from '@/lib/db/types'

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

export function ProfileForm({ initial }: { initial: FormState }) {
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
          setError(`链接格式不正确：${value}。请使用 http(s) URL。`)
          return
        }
        parsedLinks.push({ label: normalized.replace(/^https?:\/\//, '').replace(/\/$/, ''), url: normalized })
      }

      const avatarUrl = normalizeUrl(form.avatar_url)
      if (avatarUrl === null) {
        setError('头像 URL 格式不正确。请使用 http(s) URL，或留空。')
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
        setError(data?.error ?? '保存失败')
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
          已保存。<Link href={`/fellows/${savedId}`}>查看我的同学录页面</Link>
        </div>
      )}

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
        <label htmlFor="avatar_url">头像 URL</label>
        <input
          id="avatar_url"
          className="ss-input"
          type="url"
          value={form.avatar_url}
          onChange={e => set('avatar_url', e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
        <p className="ss-field-hint">暂不上传图片。留空时会用展示名首字母作为头像。</p>
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
        <p className="ss-field-hint">每行必须是 http(s) URL。保存后详情页会自动展示可点击链接。</p>
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

      <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={pending} aria-busy={pending}>
        {pending ? (
          <span className="ss-loading-label"><span className="ss-auth-spinner" />正在保存…</span>
        ) : '保存'}
      </button>
    </form>
  )
}
