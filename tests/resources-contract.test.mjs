import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const resourcesDb = read('lib/db/resources.ts')
assert.match(resourcesDb, /export\s+async\s+function\s+listResourcesForViewer/, 'resources data layer must expose listResourcesForViewer')
assert.match(resourcesDb, /export\s+async\s+function\s+listAdminResources/, 'resources data layer must expose listAdminResources')
assert.match(resourcesDb, /viewer\.canSeeAdmittedOnly/, 'viewer permission must be explicit before including admitted_only resources')
assert.match(resourcesDb, /\.or\('visibility\.eq\.public,visibility\.eq\.admitted_only'\)/, 'admitted viewers should fetch public + admitted_only resources')
assert.match(resourcesDb, /\.eq\('visibility', 'public'\)/, 'anonymous/non-paid viewers should fetch only public resources')

const resourcesPage = read('app/resources/page.tsx')
assert.match(resourcesPage, /listResourcesForViewer/, '/resources page must use the viewer-aware data layer')
assert.match(resourcesPage, /STAGE_LABELS/, '/resources page must group resources by stage')
assert.match(resourcesPage, /登录后可查看你可访问的资料范围/, '/resources page must explain login/access limits for anonymous viewers')
assert.match(resourcesPage, /暂无可访问资料/, '/resources page must render a graceful empty state')
assert.match(resourcesPage, /target="_blank"/, 'resource URLs must open as external links')

const resourcesApi = read('app/api/resources/route.ts')
assert.match(resourcesApi, /export\s+async\s+function\s+GET/, '/api/resources must expose GET')
assert.match(resourcesApi, /listResourcesForViewer/, '/api/resources must share the same viewer-aware filtering')
assert.match(resourcesApi, /NextResponse\.json\(\{ ok: true, resources/, '/api/resources must return resources JSON')

const statusPage = read('app/apply/status/page.tsx')
assert.match(statusPage, /href="\/resources"/, 'paid/admitted status page must link to /resources')
assert.match(statusPage, /reg\.status === 'paid'/, 'status page resources entry must be limited to paid users')

const profilePage = read('app/profile/page.tsx')
assert.match(profilePage, /href="\/resources"/, 'profile page must link to /resources for admitted/paid users')

console.log('resources contract ok')
