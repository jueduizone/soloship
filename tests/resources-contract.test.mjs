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
assert.match(resourcesPage, /ss-resource-topbar/, '/resources page must use the resources topbar spacing')
assert.doesNotMatch(resourcesPage, /\{user \? <span>\{user\.email\}<\/span>/, '/resources page must not show user email in the content topbar')
assert.match(resourcesPage, /课程播放列表/, '/resources page should present itself as the course playlist')
assert.match(resourcesPage, /RESOURCE_TYPE_LABELS/, '/resources page should render localized resource type labels')
assert.match(resourcesPage, /登录后可查看你可访问的资料范围/, '/resources page must explain login/access limits for anonymous viewers')
assert.match(resourcesPage, /暂无可访问资料/, '/resources page must render a graceful empty state')
assert.match(resourcesPage, /target="_blank"/, 'resource URLs must open as external links')

const resourcesApi = read('app/api/resources/route.ts')
assert.match(resourcesApi, /export\s+async\s+function\s+GET/, '/api/resources must expose GET')
assert.match(resourcesApi, /listResourcesForViewer/, '/api/resources must share the same viewer-aware filtering')
assert.match(resourcesApi, /NextResponse\.json\(\{ ok: true, resources/, '/api/resources must return resources JSON')

const navComponent = read('app/_components/Nav.tsx')
assert.match(navComponent, /NavLink/, 'site nav must use route-aware active links')
assert.match(navComponent, /href="\/resources"/, 'site nav must expose the resources route')
assert.match(navComponent, /href="\/admin"/, 'site nav must highlight admin only on admin routes')
const navLinkComponent = read('app/_components/NavLink.tsx')
assert.match(navLinkComponent, /usePathname/, 'route-aware nav links must read the current pathname')
assert.match(navLinkComponent, /href\.includes\('#'\)/, 'hash anchors should not all appear active on the home page')

const adminResourcesPage = read('app/admin/resources/page.tsx')
assert.match(adminResourcesPage, /createResourceAction/, 'admin resources page must allow creating playlist items')
assert.match(adminResourcesPage, /updateResourceAction/, 'admin resources page must allow editing playlist items')
assert.match(adminResourcesPage, /ss-resource-management-table/, 'admin resources page must use a compact management table')
assert.match(adminResourcesPage, /details className="ss-resource-management-row"/, 'admin resources page must keep row edits collapsed by default')
assert.match(adminResourcesPage, /name="summary"/, 'admin resources page must expose editable video descriptions')
assert.match(adminResourcesPage, /Cloudflare Stream UID/, 'admin resources page must explain video UID input')
assert.match(adminResourcesPage, /href=\{`\/resources\/\$\{resource\.id\}`\}/, 'admin resources page must link video items to playback preview')

const adminResourceApi = read('app/api/admin/resources/[id]/route.ts')
assert.match(adminResourceApi, /export\s+async\s+function\s+PATCH/, 'admin resource detail API must expose PATCH')
assert.match(adminResourceApi, /title 不能为空/, 'admin resource detail API must reject empty titles')
assert.match(adminResourceApi, /updateResource/, 'admin resource detail API must persist resource edits')

const statusPage = read('app/apply/status/page.tsx')
assert.match(statusPage, /href="\/resources"/, 'paid/admitted status page must link to /resources')
assert.match(statusPage, /reg\.status === 'paid'/, 'status page resources entry must be limited to paid users')

const profilePage = read('app/profile/page.tsx')
assert.match(profilePage, /href="\/resources"/, 'profile page must link to /resources for admitted/paid users')

console.log('resources contract ok')
