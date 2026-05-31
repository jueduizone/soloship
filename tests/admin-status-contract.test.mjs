import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const status = read('lib/admin/registration-status.ts')
assert.match(status, /payment_pending:\s*'待付款确认'/, 'payment_pending must be labelled 待付款确认 in admin')
assert.match(status, /paid:\s*'已入营'/, 'paid must be labelled 已入营 in admin')
assert.match(status, /rejected:\s*'未录取'/, 'rejected must be labelled 未录取 in admin')
assert.match(status, /withdrawn:\s*'已退出'/, 'withdrawn must have a visible admin filter')
assert.match(status, /ADMIN_STATUS_OVERRIDE_OPTIONS/, 'admin status override options must be centralized')
assert.match(status, /'paid'/, 'admin status override must allow setting paid')
assert.match(status, /'rejected'/, 'admin status override must allow setting rejected')
assert.match(status, /'payment_pending'/, 'admin status override must allow setting payment_pending')
assert.doesNotMatch(status, /已付款/, 'admin status copy must not label paid as 已付款')
assert.doesNotMatch(status, /已拒绝/, 'admin status copy must not label rejected as 已拒绝')

const listPage = read('app/admin/registrations/page.tsx')
assert.match(listPage, /ADMIN_REGISTRATION_STATUS_FILTERS/, 'registration list must use shared admin filters')
assert.match(listPage, /ADMIN_REGISTRATION_STATUS_LABEL\[r\.status\]/, 'registration list badges must use shared status labels')
assert.match(listPage, /ss-chip-count/, 'registration list filters must show counts per status group')
assert.doesNotMatch(listPage, /const STATUS_LABEL/, 'registration list must not define a separate status label map')
assert.doesNotMatch(listPage, /const STATUS_FILTERS/, 'registration list must not define separate filters')

const detailPage = read('app/admin/registrations/[id]/page.tsx')
assert.match(detailPage, /ADMIN_REGISTRATION_STATUS_LABEL\[reg\.status\]/, 'registration detail badge must use shared labels')
assert.match(detailPage, /StatusOverrideActions/, 'registration detail must render admin status override actions')
assert.doesNotMatch(detailPage, /const STATUS_LABEL/, 'registration detail must not define a separate status label map')

const actions = read('app/admin/registrations/[id]/Actions.tsx')
assert.match(actions, /ADMIN_REGISTRATION_STATUS_LABEL\[nextStatus\]/, 'admin action success copy must use shared labels')
assert.match(actions, /ADMIN_STATUS_OVERRIDE_OPTIONS\.map/, 'admin status override UI must render centralized status options')
assert.match(actions, /api\/admin\/registrations\/\$\{registrationId\}\/status/, 'admin status override UI must call the status override API')
assert.doesNotMatch(actions, /const STATUS_LABEL/, 'admin actions must not define a separate status label map')

const statusRoute = read('app/api/admin/registrations/[id]/status/route.ts')
assert.match(statusRoute, /getAdminUser/, 'admin status override API must require true admin access')
assert.match(statusRoute, /isAdminStatusOverride\(body\.status\)/, 'admin status override API must validate target status')
assert.match(statusRoute, /updateRegistrationStatus/, 'admin status override API must update registration status directly')
assert.doesNotMatch(statusRoute, /confirmPayment|markPaymentPending/, 'admin status override API must not create or confirm payment records')

const dashboard = read('app/admin/page.tsx')
assert.match(dashboard, /待付款确认/, 'admin dashboard metric must use 待付款确认')
assert.match(dashboard, /filter: 'rejected'/, 'admin dashboard must link rejected metric to rejected filter')
assert.doesNotMatch(dashboard, /label: '候补\/拒绝'/, 'admin dashboard should not merge waitlisted and rejected into one misleading metric')

console.log('admin status contract ok')
