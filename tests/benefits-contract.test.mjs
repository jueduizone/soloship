import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const schema = read('lib/db/schema.sql')
for (const table of ['public.benefits', 'public.benefit_codes', 'public.benefit_claims']) {
  assert.match(schema, new RegExp(`create table if not exists ${table.replace('.', '\\.')}`), `${table} must exist in schema`)
  assert.match(schema, new RegExp(`alter table ${table.replace('.', '\\.')}\\s+enable row level security`), `${table} must enable RLS`)
}
assert.match(schema, /create type benefit_type as enum \('token_code', 'merch', 'link', 'manual'\)/, 'benefit type enum must cover MVP claim types')
assert.match(schema, /benefits_paid_read/, 'benefits must be readable only by paid users/admins')
assert.match(schema, /benefit_codes_admin_all/, 'benefit codes must be admin-only')
assert.match(schema, /benefit_claims_unique_active_idx/, 'benefit claims must prevent duplicate active claims per user')

const migration = read('lib/db/migrations/2026-06-01-benefits.sql')
assert.match(migration, /create table if not exists public\.benefits/, 'benefits migration must create benefits table')
assert.match(migration, /benefit_codes_assigned_claim_id_fkey/, 'benefit code assignment should link back to claims')
assert.match(migration, /benefit_codes_admin_all/, 'benefits migration must keep codes admin-only')

const benefitsDb = read('lib/db/benefits.ts')
assert.match(benefitsDb, /export\s+async\s+function\s+listBenefitsForViewer/, 'benefits data layer must expose viewer-aware listing')
assert.match(benefitsDb, /viewer\.canSeeBenefits/, 'viewer listing must require paid/admin access before fetching benefits')
assert.match(benefitsDb, /export\s+async\s+function\s+claimBenefit/, 'benefits data layer must expose server-side claiming')
assert.match(benefitsDb, /params\.registration\.status !== 'paid'/, 'claiming must require paid registration')
assert.match(benefitsDb, /benefit\.total_stock != null/, 'claiming must enforce total stock for non-code benefits too')
assert.match(benefitsDb, /\.from\('benefit_codes'\)[\s\S]*\.is\('assigned_at', null\)/, 'token claim must allocate an unassigned code server-side')
assert.match(benefitsDb, /assigned_to_user_id: params\.userId/, 'token claim must assign the code to the current user')
assert.match(benefitsDb, /getAssignedCodeForClaim/, 'viewer claims should reveal only their assigned code')

const claimRoute = read('app/api/benefits/[id]/claim/route.ts')
assert.match(claimRoute, /getRegistrationForApplicant/, 'claim API must resolve the authenticated user registration')
assert.match(claimRoute, /claimBenefit/, 'claim API must delegate to server-side claim helper')
assert.match(claimRoute, /message\.includes\('已付费'\)/, 'claim API must map paid-only errors to 403')
assert.doesNotMatch(claimRoute, /benefit_codes/, 'claim API route must not expose raw code-pool queries')

const benefitsPage = read('app/benefits/page.tsx')
assert.match(benefitsPage, /redirect\('\/auth\/login\?next=\/benefits'\)/, '/benefits must require login')
assert.match(benefitsPage, /registration\?\.status === 'paid'/, '/benefits must require paid registration')
assert.match(benefitsPage, /listBenefitsForViewer/, '/benefits must use viewer-aware benefits listing')
assert.match(benefitsPage, /assigned_code/, '/benefits should show only the assigned code after claim')
assert.match(benefitsPage, /ClaimBenefitButton/, '/benefits should allow claims from the page')

const adminBenefitsPage = read('app/admin/benefits/page.tsx')
assert.match(adminBenefitsPage, /listAdminBenefits/, 'admin benefits page must list benefits with stats')
assert.match(adminBenefitsPage, /requireAdmin/, 'admin benefits page must require true admin access because claims can contain addresses and phone numbers')
assert.match(adminBenefitsPage, /listBenefitClaims/, 'admin benefits page must show claim records')
assert.match(adminBenefitsPage, /createBenefitAction/, 'admin benefits page must create benefits')
assert.match(adminBenefitsPage, /updateBenefitAction/, 'admin benefits page must update benefits')
assert.match(adminBenefitsPage, /updateBenefitClaimAction/, 'admin benefits page must manage fulfillment state')
assert.match(adminBenefitsPage, /name="codes"/, 'admin benefits page must import token codes')

const adminActions = read('app/admin/_actions.ts')
assert.match(adminActions, /createBenefitAction/, 'admin actions must expose createBenefitAction')
assert.match(adminActions, /requireAdmin/, 'benefit admin actions must require true admin access')
assert.match(adminActions, /importBenefitCodes/, 'admin actions must import token codes server-side')
assert.match(adminActions, /updateBenefitClaimStatus/, 'admin actions must update fulfillment status')

const nav = read('app/_components/Nav.tsx')
assert.match(nav, /href="\/benefits"/, 'site nav must expose benefits to eligible users')
assert.match(nav, /showBenefits/, 'site nav must gate benefits visibility')

const adminLayout = read('app/admin/layout.tsx')
assert.match(adminLayout, /href="\/admin\/benefits"/, 'admin nav must link to benefits management')

const statusPage = read('app/apply/status/page.tsx')
assert.match(statusPage, /href="\/benefits"/, 'paid status page must link to benefits')

console.log('benefits contract ok')
