import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const content = read('app/_components/content.ts')
assert.match(content, /export const zhContent/, 'site content must expose zhContent')
assert.match(content, /export const enContent/, 'site content must expose enContent')
assert.match(content, /A 3-week sprint to ship an AI product/, 'English homepage content must be present')
assert.match(content, /getSiteContent\(locale: SiteLocale\)/, 'site content must expose getSiteContent(locale)')

const siteI18n = read('lib/i18n/site.ts')
assert.match(siteI18n, /SITE_LOCALE_COOKIE = 'soloship_locale'/, 'site i18n must use a stable locale cookie')
assert.match(siteI18n, /normalizeLocale/, 'site i18n must normalize unknown locale values')

const switcher = read('app/_components/LanguageSwitch.tsx')
assert.match(switcher, /document\.cookie/, 'language switch must persist locale to a cookie')
assert.match(switcher, /router\.refresh\(\)/, 'language switch must refresh server-rendered pages')
assert.match(switcher, /aria-pressed/, 'language switch must expose selected language state')

const nav = read('app/_components/Nav.tsx')
assert.match(nav, /getCurrentLocale\(cookies\(\)\)/, 'nav must read the current locale from cookies')
assert.match(nav, /LanguageSwitch/, 'nav must render the language switch')
assert.match(nav, /getSiteContent\(locale\)/, 'nav must use localized content')

const home = read('app/page.tsx')
assert.match(home, /getSiteContent\(getCurrentLocale\(cookies\(\)\)\)/, 'home page must load localized content from cookies')
assert.match(home, /<Hero content=\{content\}/, 'home sections must receive localized content')

const resources = read('app/resources/page.tsx')
assert.match(resources, /RESOURCE_COPY/, 'resources page must define localized resources copy')
assert.match(resources, /Course Playlist/, 'resources page must include English copy')
assert.match(resources, /getCurrentLocale\(cookies\(\)\)/, 'resources page must read locale from cookies')

const vodPage = read('app/resources/[id]/page.tsx')
assert.match(vodPage, /VOD_COPY/, 'VOD page must define localized playback copy')
assert.match(vodPage, /Paid members only/, 'VOD page must include English access copy')
assert.match(vodPage, /loadingLabel=\{copy\.loading\}/, 'VOD player loading label must be localized')
assert.match(vodPage, /securityNote=\{copy\.note\}/, 'VOD player security note must be localized')

console.log('i18n contract ok')
