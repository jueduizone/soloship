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

const dictionaryIndex = read('lib/i18n/index.ts')
assert.match(dictionaryIndex, /getDictionary\(locale: SiteLocale\)/, 'shared i18n must expose getDictionary(locale)')
assert.match(dictionaryIndex, /dictionaries = \{\s*zh,\s*en,/s, 'shared i18n must register both zh and en dictionaries')

const authEn = read('lib/i18n/en.ts')
assert.match(authEn, /Login to SoloShip/, 'English auth dictionary must include login copy')
assert.match(authEn, /Continue with Google/, 'English auth dictionary must include OAuth copy')
assert.match(authEn, /Verification email sent/, 'English auth dictionary must include verify copy')

const authErrors = read('lib/i18n/auth-errors.ts')
assert.match(authErrors, /mapAuthError\(err: unknown, dictionary: Dictionary = t\)/, 'auth error mapper must accept a localized dictionary')
assert.match(authErrors, /dictionary\.auth\.errors/, 'auth error mapper must read errors from the provided dictionary')

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

const loginPage = read('app/auth/login/page.tsx')
assert.match(loginPage, /getCurrentLocale\(cookies\(\)\)/, 'login page must read locale from cookies')
assert.match(loginPage, /getDictionary\(locale\)/, 'login page must load the localized auth dictionary')
assert.match(loginPage, /<LoginClient dictionary=\{dictionary\} locale=\{locale\}/, 'login page must pass locale and dictionary to the client form')

const loginClient = read('app/auth/login/LoginClient.tsx')
assert.match(loginClient, /mapAuthError\(error, copy\)/, 'login client must localize auth errors')
assert.match(loginClient, /locale === 'en' \? 'en' : 'zh_CN'/, 'Google login button must use the selected locale')
assert.match(loginClient, /copy\.auth\.login\.googleLoading/, 'login client must localize Google loading copy')

const verifyPage = read('app/auth/verify/page.tsx')
assert.match(verifyPage, /getCurrentLocale\(cookies\(\)\)/, 'verify page must read locale from cookies')
assert.match(verifyPage, /getDictionary\(getCurrentLocale\(cookies\(\)\)\)/, 'verify page must load localized verify copy')

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
