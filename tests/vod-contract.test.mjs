import assert from 'node:assert/strict'
import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const playbackRoute = read('app/api/resources/[id]/playback/route.ts')
assert.match(
  playbackRoute,
  /registration\?\.status === 'paid'/,
  'VOD playback token route must require paid registration access'
)
assert.match(
  playbackRoute,
  /isOrganizerUser\(user\)/,
  'VOD playback token route may allow organizers for operations'
)
assert.match(
  playbackRoute,
  /resource\.type !== 'video'/,
  'VOD playback token route must only sign video resources'
)
assert.match(
  playbackRoute,
  /createCloudflareStreamPlayback/,
  'VOD playback token route must create Cloudflare Stream signed playback params server-side'
)

const resourcesApi = read('app/api/resources/route.ts')
assert.match(
  resourcesApi,
  /url: resource\.type === 'video' \? null : resource\.url/,
  '/api/resources must not expose video source URLs or video UIDs'
)

const player = read('app/resources/[id]/CloudflareStreamPlayer.tsx')
assert.match(
  player,
  /\/api\/resources\/\$\{resourceId\}\/playback/,
  'VOD player must fetch signed playback params from the protected API'
)
assert.match(
  player,
  /ss-vod-watermark/,
  'VOD player must render account watermark for leakage tracing'
)

const detailPage = read('app/resources/[id]/page.tsx')
assert.match(
  detailPage,
  /listResourcesForViewer/,
  'VOD detail page must load the accessible course playlist'
)
assert.match(
  detailPage,
  /ss-resource-topbar ss-vod-topbar/,
  'VOD detail page must use the resources topbar spacing'
)
assert.doesNotMatch(
  detailPage,
  /<span>\{user\.email\}<\/span>|ss-vod-viewer/,
  'VOD detail page must not show user email in the content topbar'
)
assert.match(
  detailPage,
  /groupVideosByStage/,
  'VOD detail page must group playlist videos by course stage'
)
assert.match(
  detailPage,
  /aria-current=\{item\.id === resource\.id \? 'page' : undefined\}/,
  'VOD detail page must highlight the current playlist item'
)
assert.match(
  detailPage,
  /href=\{`\/resources\/\$\{item\.id\}`\}/,
  'VOD detail page must let viewers switch between playlist videos'
)

const cloudflareVod = read('lib/vod/cloudflare.ts')
assert.match(
  cloudflareVod,
  /downloadable: false/,
  'Cloudflare Stream signed tokens must disable download permission'
)
assert.match(
  cloudflareVod,
  /CLOUDFLARE_STREAM_API_TOKEN/,
  'Cloudflare Stream signing must use a server-side API token'
)

console.log('vod contract ok')
