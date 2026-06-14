import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const schema = read('lib/db/schema.sql')
for (const table of [
  'public.lottery_draws',
  'public.lottery_participants',
  'public.lottery_prizes',
  'public.lottery_winners',
]) {
  assert.match(schema, new RegExp(`create table if not exists ${table.replace('.', '\\.')}`), `${table} must exist`)
  assert.match(schema, new RegExp(`alter table ${table.replace('.', '\\.')}\\s+enable row level security`), `${table} must enable RLS`)
}
assert.match(schema, /unique \(draw_id, email\)/, 'lottery winners must prevent duplicate winners within one draw')
assert.match(schema, /lottery_winners_admin_all/, 'lottery winner history must be admin-only')

const migration = read('lib/db/migrations/2026-06-14-lottery.sql')
assert.match(migration, /create table if not exists public\.lottery_draws/, 'lottery migration must create draw table')
assert.match(migration, /unique \(draw_id, email\)/, 'lottery migration must preserve no-repeat winner constraint')

const lotteryDb = read('lib/db/lottery.ts')
assert.match(lotteryDb, /parseLotteryEmails/, 'lottery data layer must parse imported emails')
assert.match(lotteryDb, /drawLotteryPrize/, 'lottery data layer must expose drawLotteryPrize')
assert.match(lotteryDb, /clearLotteryWinners/, 'lottery data layer must support clearing winner history')
assert.match(lotteryDb, /winnerEmails/, 'drawing must exclude previous winners in the same draw')
assert.match(lotteryDb, /randomInt/, 'drawing must use server-side random selection')
assert.match(lotteryDb, /remainingSlots/, 'drawing must only fill missing slots for a prize')

const lotteryPage = read('app/lottery/page.tsx')
assert.doesNotMatch(lotteryPage, /requireAdmin|getAdminUser|requireOrganizer/, 'hidden lottery page must be accessible without login')
assert.match(lotteryPage, /importLotteryParticipantsAction/, 'lottery page must support importing emails')
assert.match(lotteryPage, /createLotteryPrizeAction/, 'lottery page must support setting prize names and counts')
assert.match(lotteryPage, /LotteryDrawButton/, 'lottery page must expose animated draw buttons')
assert.match(lotteryPage, /历史中奖记录/, 'lottery page must show winner history')
assert.match(lotteryPage, /奖项设置/, 'lottery page must show prize setup beside email import')
assert.match(lotteryPage, /clearLotteryHistoryAction/, 'lottery page must support clearing winner history')
assert.match(lotteryPage, /ss-lottery-prize-item/, 'existing prizes must render in the right-side prize setup panel')
assert.doesNotMatch(lotteryPage, /公开隐藏链接|\/lottery。/, 'lottery page must not expose internal link wording in visible copy')

const lotteryActions = read('app/lottery/_actions.ts')
assert.doesNotMatch(lotteryActions, /requireAdmin|getAdminUser|requireOrganizer/, 'lottery setup actions must not require login')
assert.match(lotteryActions, /createAdminClient/, 'public lottery actions must still write through the server-side admin client')
assert.match(lotteryActions, /clearLotteryHistoryAction/, 'lottery setup actions must expose history clearing')
assert.match(lotteryActions, /clearLotteryWinners/, 'history clearing action must delete persisted winner rows')

const drawButton = read('app/lottery/LotteryDrawButton.tsx')
assert.match(drawButton, /ss-lottery-loading/, 'draw button must render a loading animation state')
assert.match(drawButton, /setInterval/, 'draw button must animate rolling emails during drawing')
assert.match(drawButton, /router\.refresh\(\)/, 'draw button must refresh history after drawing')
assert.match(drawButton, /\/api\/lottery\/prizes\/\$\{prizeId\}\/draw/, 'draw button must call the public hidden lottery API')

const adminCss = read('app/admin/admin.css')
assert.match(adminCss, /grid-template-columns: repeat\(auto-fit, minmax\(128px, 1fr\)\)/, 'lottery prize form must use responsive columns')
assert.match(adminCss, /\.ss-lottery-form-action \.ss-btn-action[\s\S]*width: 100%/, 'lottery prize submit buttons must stay inside narrow panels')
assert.match(adminCss, /ss-lottery-prize-item/, 'right-side prize list must use inline prize rows')
assert.match(adminCss, /ss-lottery-history-head/, 'history header must support a clear action')

const drawApi = read('app/api/lottery/prizes/[id]/draw/route.ts')
assert.doesNotMatch(drawApi, /getAdminUser|requireAdmin|requireOrganizer/, 'lottery draw API must be accessible without login')
assert.match(drawApi, /drawLotteryPrize/, 'lottery draw API must perform server-side drawing')

const adminLayout = read('app/admin/layout.tsx')
assert.doesNotMatch(adminLayout, /\/admin\/lottery/, 'lottery link must stay hidden from the admin menu')
assert.doesNotMatch(adminLayout, /\/lottery/, 'public hidden lottery link must not appear in the admin menu')

console.log('lottery contract ok')
