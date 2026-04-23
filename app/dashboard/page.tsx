import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// /dashboard 不是独立页面，只做落地重定向：
// - 未登录 → 登录页（登录后回到 /profile）
// - 已登录 → /profile（展示报名状态 + 个人信息编辑）
// 保留此路由是为了兼容 Supabase Site URL 默认值、历史外链以及
// 用户可能直接敲入 /dashboard 的习惯，避免 404 断层。
export default async function DashboardRedirect() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')
  redirect('/profile')
}
