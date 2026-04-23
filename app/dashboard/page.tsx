import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// /dashboard 不是独立页面，只做无条件落地重定向。
// 之前的版本会先 supabase.auth.getUser()，一旦 Supabase SSR 客户端在
// Vercel edge/server 上 cookie 取不到或出错，整个页面就 throw 成 404。
// 这里直接 redirect 到 /profile — /profile 自己会做登录态检查，
// 未登录再跳 /auth/login?next=/profile。
export default function DashboardRedirect() {
  redirect('/profile')
}
