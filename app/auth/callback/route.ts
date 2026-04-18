import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OAuth + email-confirmation PKCE callback.
// Supabase sends the user here with `code` after provider auth; we exchange
// it for a session cookie and then forward to `next`.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/apply'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin)
      )
    }
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
