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
    /getAdminUser/,
    `${route} must require true admin access for privacy-sensitive registration actions`
  )
  assert.doesNotMatch(
    source,
    /getOrganizerUser/,
    `${route} must not allow organizer-only users to access registration actions`
  )
}

for (const page of [
  'app/admin/registrations/page.tsx',
  'app/admin/registrations/[id]/page.tsx',
]) {
  assert.match(
    read(page),
    /requireAdmin/,
    `${page} must require true admin access because registrations contain applicant-private data`
  )
}

const adminHelper = read('lib/auth/require-admin.ts')
assert.match(
  adminHelper,
  /user\.app_metadata/,
  'admin detection must prefer server-controlled app_metadata'
)
assert.match(
  adminHelper,
  /appMeta\.is_admin === true \|\| appMeta\.role === 'admin'/,
  'admin detection must accept app_metadata.is_admin or app_metadata.role'
)
assert.match(
  adminHelper,
  /userMeta\.is_admin === true \|\| userMeta\.role === 'admin'/,
  'admin detection must retain temporary user_metadata admin fallback for existing admin accounts'
)
assert.doesNotMatch(
  adminHelper,
  /userMeta\.role === 'organizer'/,
  'admin detection must deny ordinary organizer users'
)

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

const fellowsListPage = read('app/fellows/page.tsx')
assert.match(
  fellowsListPage,
  /canViewFellow/,
  '/fellows must filter service-role results through an explicit visibility gate'
)
assert.match(
  fellowsListPage,
  /registration\?\.status === 'paid'/,
  '/fellows must only show cohort_only profiles to paid cohort members'
)
assert.match(
  fellowsListPage,
  /fellow\.visibility === 'public'/,
  '/fellows must keep public profiles visible to anonymous visitors'
)
assert.match(
  fellowsListPage,
  /fellow\.registration\?\.user_id === viewer\.userId/,
  '/fellows must allow private profiles only to their owner unless organizer/admin'
)

const fellowsApi = read('app/api/fellows/route.ts')
assert.match(
  fellowsApi,
  /canViewFellow/,
  '/api/fellows must filter service-role results through an explicit visibility gate'
)
assert.match(
  fellowsApi,
  /registration\?\.status === 'paid'/,
  '/api/fellows must only return cohort_only profiles to paid cohort members or admins'
)
assert.match(
  fellowsApi,
  /fellow\.visibility === 'public'/,
  '/api/fellows must keep public profiles visible to anonymous visitors'
)
assert.match(
  fellowsApi,
  /fellow\.registration\?\.user_id === viewer\.userId/,
  '/api/fellows must allow private profiles only to their owner unless admin'
)

const fellowDetailPage = read('app/fellows/[id]/page.tsx')
assert.match(
  fellowDetailPage,
  /canViewFellow/,
  '/fellows/[id] must use the same visibility gate as the list page'
)
assert.match(
  fellowDetailPage,
  /if \(!canViewFellow\([^)]*\)\) notFound\(\)/s,
  '/fellows/[id] must return notFound for unauthorized cohort/private profile guesses'
)

const admissionDb = read('lib/db/admission.ts')
assert.match(
  admissionDb,
  /const registration = await updateRegistrationStatus[\s\S]*\.from\('admission_decisions'\)/,
  'admission decisions must update registration status before inserting the decision when no DB transaction is available'
)
assert.match(
  admissionDb,
  /previous\.status/,
  'admission decision failure path must attempt to roll registration status back'
)
assert.match(
  read('app/api/admin/registrations/[id]/decision/route.ts'),
  /status: result\.registration\.status/,
  'decision route must return updated registration status for the UI'
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
