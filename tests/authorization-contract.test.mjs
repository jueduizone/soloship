import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

for (const route of [
  'app/api/admin/registrations/[id]/decision/route.ts',
  'app/api/admin/registrations/[id]/payment/route.ts',
]) {
  const source = read(route)
  assert.match(
    source,
    /getOrganizerUser/,
    `${route} must authorize the same organizer/admin audience as /admin pages`
  )
  assert.doesNotMatch(
    source,
    /getAdminUser/,
    `${route} must not be stricter than /admin page guards`
  )
}

const statusPage = read('app/apply/status/page.tsx')
assert.match(
  statusPage,
  /createAdminClient/,
  '/apply/status must use the service-role read path so RLS cannot hide the user-owned registration'
)
assert.match(
  statusPage,
  /getRegistrationForApplicant/,
  '/apply/status must resolve registrations by authenticated user id or login email'
)
assert.match(
  statusPage,
  /href="\/apply\?edit=1"/,
  '/apply/status must link the edit action to /apply?edit=1 so the apply route stays status-first'
)

const applyPage = read('app/apply/page.tsx')
assert.match(
  applyPage,
  /searchParams\?\.edit === '1'/,
  '/apply must opt into the edit form via ?edit=1 instead of always rendering it'
)
assert.match(
  applyPage,
  /redirect\('\/apply\/status'\)/,
  '/apply must default existing applicants to /apply/status when ?edit=1 is absent'
)

const signoutRoute = read('app/api/auth/signout/route.ts')
assert.match(
  signoutRoute,
  /export\s+async\s+function\s+GET\s*\(request:\s*NextRequest\)/,
  '/api/auth/signout must handle direct browser navigation (GET)'
)
assert.match(
  signoutRoute,
  /await\s+supabase\.auth\.signOut\(\)/,
  '/api/auth/signout GET/POST handlers must clear the Supabase session before redirecting'
)
assert.match(
  signoutRoute,
  /NextResponse\.redirect\(new URL\('\/', request\.url\), \{ status: 303 \}\)/,
  '/api/auth/signout must redirect to / after signout so users do not see a blank page'
)

console.log('authorization/status contract ok')
