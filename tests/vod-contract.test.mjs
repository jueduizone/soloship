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
  /createTencentVodPlayback/,
  'VOD playback token route must create Tencent VOD signed playback params server-side'
)

const resourcesApi = read('app/api/resources/route.ts')
assert.match(
  resourcesApi,
  /url: resource\.type === 'video' \? null : resource\.url/,
  '/api/resources must not expose video source URLs or fileIds'
)

const player = read('app/resources/[id]/TencentVodPlayer.tsx')
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

const tencentVod = read('lib/vod/tencent.ts')
assert.match(
  tencentVod,
  /contentInfo/,
  'Tencent VOD player signatures must include contentInfo'
)
assert.match(
  tencentVod,
  /TENCENT_VOD_CONTENT_INFO/,
  'Tencent VOD contentInfo should be configurable for Original, Transcode, RawAdaptive, or ProtectedAdaptive playback'
)

console.log('vod contract ok')
