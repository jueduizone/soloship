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
assert.match(lotteryDb, /winnerEmails/, 'drawing must exclude previous winners in the same draw')
assert.match(lotteryDb, /randomInt/, 'drawing must use server-side random selection')
assert.match(lotteryDb, /remainingSlots/, 'drawing must only fill missing slots for a prize')

const lotteryPage = read('app/admin/lottery/page.tsx')
assert.match(lotteryPage, /requireAdmin/, 'hidden lottery page must require true admin access')
assert.match(lotteryPage, /importLotteryParticipantsAction/, 'lottery page must support importing emails')
assert.match(lotteryPage, /createLotteryPrizeAction/, 'lottery page must support setting prize names and counts')
assert.match(lotteryPage, /LotteryDrawButton/, 'lottery page must expose animated draw buttons')
assert.match(lotteryPage, /历史中奖记录/, 'lottery page must show winner history')

const drawButton = read('app/admin/lottery/LotteryDrawButton.tsx')
assert.match(drawButton, /ss-lottery-loading/, 'draw button must render a loading animation state')
assert.match(drawButton, /setInterval/, 'draw button must animate rolling emails during drawing')
assert.match(drawButton, /router\.refresh\(\)/, 'draw button must refresh history after drawing')

const drawApi = read('app/api/admin/lottery/prizes/[id]/draw/route.ts')
assert.match(drawApi, /getAdminUser/, 'lottery draw API must require true admin access')
assert.match(drawApi, /drawLotteryPrize/, 'lottery draw API must perform server-side drawing')

const adminLayout = read('app/admin/layout.tsx')
assert.doesNotMatch(adminLayout, /\/admin\/lottery/, 'lottery link must stay hidden from the admin menu')

console.log('lottery contract ok')
