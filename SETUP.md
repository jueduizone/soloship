# SoloShip Development Setup

## Stack 决策（基于 MVP 设计文档的最终边界）

### 数据层
- **Supabase 已就绪**，Project: `bfqdgzawkyemprfactkf`
- URL: `https://bfqdgzawkyemprfactkf.supabase.co`
- Credentials 在 `.env.local`（已 gitignore）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`（只在 server-side 使用）

### 登录（三路，走 Supabase Auth）
1. **Google** OAuth
2. **GitHub** OAuth
3. **邮箱 + 密码**（含邮箱验证）

> Ian 确认：auth 直接接真实 Supabase，不做 mock auth。
> OAuth provider 未在 Supabase Dashboard 配置的，CC 实现时留 TODO 注释说明需要 Dashboard 侧补配（client_id/secret），代码先跑通流程。

### Data Layer（业务表）
- **Schema-first**：在 `lib/db/schema.sql`（或类似）写完整 SQL（registrations, events, users, admission_decisions 等），通过 Supabase SQL Editor 执行
- **Server-side access**：统一走 `lib/db/*.ts`，调用 Supabase JS client；service role 只在 API routes
- **MVP 允许先用 seed/mock 跑通，但接口和数据模型必须按真实 schema 写**（避免后续重构）

### 支付
- **不接任何真实支付网关**
- 录取后走「人工支付确认」流程：
  - 录取邮件附带主办方付款方式（微信/支付宝收款码 or 银行转账）
  - 用户付款后，后台手动标记 `payment_status = confirmed`
- 状态机：`submitted → reviewed → admitted → payment_pending → paid/declined`

### 不做
- ❌ Stripe / Paddle / 第三方支付
- ❌ 自动续费 / 订阅
- ❌ 复杂权限系统（admin = Supabase Auth 里打标，够用即可）
- ❌ 国际化（先中文，文案全走 `lib/i18n/` 留扩展位）

## 目录建议
```
app/
  (public)/              # 现有 landing
  apply/                 # 报名表单 + 状态页
  admin/                 # 后台（审核 + 录取 + 支付确认）
    registrations/
    events/
  auth/
    login/
    callback/            # OAuth 回调
    verify/              # 邮箱验证
  api/
    auth/                # Supabase session helpers
    registrations/
    admin/
lib/
  db/
    schema.sql
    registrations.ts
    events.ts
  supabase/
    client.ts            # browser client
    server.ts            # server client (with cookies)
    admin.ts             # service-role client
  i18n/
```

## Commit 规范
- `feat:` / `fix:` / `refine:` / `chore:`
- 中文正文 OK，subject 英文
- Ian git email: `jueduizone@gmail.com`（已在 ~/.gitconfig）

## Repo
- https://github.com/jueduizone/soloship
- `git push origin main` 正常工作（已配置）
