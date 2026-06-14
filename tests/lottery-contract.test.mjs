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
assert.match(lotteryDb, /drawLotteryAllPrizes/, 'lottery data layer must expose one-click all-prize drawing')
assert.match(lotteryDb, /createNextLotteryRound/, 'lottery data layer must support starting a new round without deleting history')
assert.match(lotteryDb, /clearLotteryWinners/, 'lottery data layer must support clearing winner history')
assert.match(lotteryDb, /clearLotteryWinnersForEvent/, 'lottery data layer must support explicit all-round history reset')
assert.match(lotteryDb, /deleteLotteryPrize/, 'lottery data layer must support deleting prize settings')
assert.match(lotteryDb, /allWinners/, 'drawing must exclude winners from all rounds in the same event')
assert.match(lotteryDb, /findDuplicatePrizeNames/, 'drawing must validate duplicate prize names when the draw starts')
assert.match(lotteryDb, /randomInt/, 'drawing must use server-side random selection')
assert.match(lotteryDb, /totalRemaining/, 'drawing must validate total remaining slots across all prizes')

const lotteryPage = read('app/lottery/page.tsx')
assert.doesNotMatch(lotteryPage, /requireAdmin|getAdminUser|requireOrganizer/, 'hidden lottery page must be accessible without login')
assert.match(lotteryPage, /importLotteryParticipantsAction/, 'lottery page must support importing emails')
assert.match(lotteryPage, /clearLotteryParticipantsAction/, 'lottery page must support clearing imported emails')
assert.match(lotteryPage, /清空邮箱池/, 'lottery page must expose a clear email pool action')
assert.match(lotteryPage, /pendingLabel="清空中"/, 'clear email pool action must show pending feedback')
assert.match(lotteryPage, /createLotteryPrizeAction/, 'lottery page must support setting prize names and counts')
assert.match(lotteryPage, /pendingLabel="新增中"/, 'prize creation must show pending feedback')
assert.match(lotteryPage, /LotteryDrawButton/, 'lottery page must expose animated draw buttons')
assert.match(lotteryPage, /历史中奖记录/, 'lottery page must show winner history')
assert.match(lotteryPage, /奖项设置/, 'lottery page must show prize setup beside email import')
assert.match(lotteryPage, /ss-lottery-draw-all/, 'lottery page must have one all-prize draw control')
assert.match(lotteryPage, /开启新一轮/, 'lottery page must expose a clear-current-round action near the draw control')
assert.match(lotteryPage, /pendingLabel="开启中"/, 'new-round action must show pending feedback')
assert.match(lotteryPage, /startNextLotteryRoundAction/, 'lottery page must start a new round instead of clearing winner history')
assert.match(lotteryPage, /state\.allWinners/, 'lottery page must show and count all-round winner history')
assert.match(lotteryPage, /清除全部历史（重置排重）/, 'lottery page must expose an explicit dangerous history reset')
assert.match(lotteryPage, /pendingLabel="清除中"/, 'history reset action must show pending feedback')
assert.match(lotteryPage, /pendingLabel="删除中"/, 'prize deletion must show pending feedback')
assert.match(lotteryPage, /ss-lottery-prize-item/, 'existing prizes must render in the right-side prize setup panel')
assert.doesNotMatch(lotteryPage, /公开隐藏链接|\/lottery。/, 'lottery page must not expose internal link wording in visible copy')
assert.doesNotMatch(lotteryPage, /剩余可抽邮箱不足，无法完成该奖项/, 'lottery page must not show capacity errors before draw is clicked')

const adminSubmitButton = read('app/admin/AdminSubmitButton.tsx')
assert.match(adminSubmitButton, /className = 'ss-btn-action is-primary'/, 'submit button must keep the primary style by default')
assert.match(adminSubmitButton, /className\?: string/, 'submit button must allow contextual styles')
assert.match(adminSubmitButton, /title\?: string/, 'submit button must allow action explanations')

const lotteryActions = read('app/lottery/_actions.ts')
assert.doesNotMatch(lotteryActions, /requireAdmin|getAdminUser|requireOrganizer/, 'lottery setup actions must not require login')
assert.match(lotteryActions, /createAdminClient/, 'public lottery actions must still write through the server-side admin client')
assert.match(lotteryActions, /clearLotteryParticipantsAction/, 'lottery setup actions must expose email pool clearing')
assert.match(lotteryActions, /startNextLotteryRoundAction/, 'lottery setup actions must expose new-round creation')
assert.match(lotteryActions, /createNextLotteryRound/, 'new-round action must preserve historical winners for dedupe')
assert.match(lotteryActions, /clearLotteryWinnersForEvent/, 'history reset action must clear all-round winner rows')
assert.match(lotteryActions, /deleteLotteryPrizeAction/, 'lottery setup actions must expose prize deletion')

const drawButton = read('app/lottery/LotteryDrawButton.tsx')
assert.match(drawButton, /ss-lottery-rolling-stage/, 'draw button must render a suspense loading state')
assert.match(drawButton, /setInterval/, 'draw button must animate rolling emails during drawing')
assert.match(drawButton, /router\.refresh\(\)/, 'draw button must refresh history after drawing')
assert.match(drawButton, /\/api\/lottery\/draw/, 'draw button must call the public all-prize lottery API')
assert.match(drawButton, /ss-lottery-modal/, 'draw button must show a modal drawing experience')
assert.match(drawButton, /groupedWinners/, 'draw result modal must group winners by prize')
assert.doesNotMatch(drawButton, /prizeId/, 'draw button must not draw one prize at a time')

const adminCss = read('app/admin/admin.css')
assert.match(adminCss, /grid-template-columns: minmax\(180px, 1\.4fr\)/, 'lottery prize form must use compact management columns')
assert.match(adminCss, /\.ss-lottery-form-action \.ss-btn-action[\s\S]*width: 100%/, 'lottery prize submit buttons must stay inside narrow panels')
assert.match(adminCss, /ss-lottery-prize-item/, 'right-side prize list must use inline prize rows')
assert.match(adminCss, /ss-lottery-prize-row/, 'existing prizes must use compact inline editing rows')
assert.match(adminCss, /ss-lottery-modal-card/, 'lottery CSS must style the suspense modal')
assert.match(adminCss, /ss-lottery-reset-button/, 'lottery CSS must style the new-round reset action')
assert.match(adminCss, /ss-lottery-clear-emails-button/, 'lottery CSS must style the email clearing action')
assert.match(adminCss, /ss-lottery-history-head/, 'history header must support a clear action')
assert.match(adminCss, /ss-lottery-draw-all/, 'lottery CSS must style the all-prize draw control')

const drawApi = read('app/api/lottery/draw/route.ts')
assert.doesNotMatch(drawApi, /getAdminUser|requireAdmin|requireOrganizer/, 'lottery draw API must be accessible without login')
assert.match(drawApi, /drawLotteryAllPrizes/, 'lottery draw API must perform server-side all-prize drawing')

const adminLayout = read('app/admin/layout.tsx')
assert.doesNotMatch(adminLayout, /\/admin\/lottery/, 'lottery link must stay hidden from the admin menu')
assert.doesNotMatch(adminLayout, /\/lottery/, 'public hidden lottery link must not appear in the admin menu')

console.log('lottery contract ok')
