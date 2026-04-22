export const event = {
  name: 'SoloShip',
  volume: 'Vol.1',
  tagline: 'Global AI Builders',
  year: '2026',
  duration: '2 周',
  format: '线上 + 异步',
  capacity: '约 100 人 · 审核制',
  capacityShort: '100 人',
  price: '¥399',
  priceNote: '录取后支付 · 完成后退还',
  status: 'Vol.1 申请通道筹备中',
  statusShort: '即将开放',
  applyHref: '/apply',
  timelineHref: '#timeline',
}

export const nav = {
  links: [
    { label: '为什么', href: '#why' },
    { label: '活动节奏', href: '#timeline' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: '立即申请', href: event.applyHref },
}

export const hero = {
  eyebrow: `${event.volume} · ${event.year} · ${event.tagline}`,
  status: event.status,
  headline: '两周，把手里的 idea 做成一个能上线的全球化产品。',
  sub: '面向独立 builder 的两周 shipping sprint——带 deadline、带同伴、带 Demo Day。',
  meta: [
    { label: '周期', value: event.duration },
    { label: '形式', value: event.format },
    { label: '名额', value: event.capacity },
    { label: '价格', value: `${event.price} · ${event.priceNote}` },
  ],
  primaryCta: { label: '立即申请', href: event.applyHref },
  secondaryCta: { label: '查看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 · 完成 Demo Day 后全额退还 · 申请通道开放时，候补名单优先通知',
}

export const whyNow = {
  eyebrow: '为什么是现在',
  headline: '这是超级个体第一次真正能独立做全球产品的窗口。',
  body: [
    'AI 基础设施第一次让一个人完整覆盖一款产品的每一环——写代码、做设计、跑增长、做客服。',
    '真正卡住的早就不是技术，而是出海、支付、增长，以及把一个项目做完的执行力。',
    'SoloShip 把这几件事压进两周。在同伴密度和 deadline 之下，让项目真的 ship 出去。',
  ],
}

export const whySoloship = {
  eyebrow: 'WHY SOLOSHIP',
  headline: 'Cohort，不是课程。Sprint，不是社群。',
  cards: [
    {
      title: 'Builder-only',
      body: '两周高密度 cohort，所有人都在同一条 ship 上。没有旁观者，也没有纯内容消费。',
    },
    {
      title: 'Deadline-driven',
      body: '不是听课，是交付。Demo Day 一到，项目必须能上线或对外演示。',
    },
    {
      title: 'Global-first',
      body: '所有项目默认面向全球市场——英文产品、海外支付、全球增长。',
    },
    {
      title: 'Signal, not noise',
      body: '审核制 + 小规模，保证同伴密度。没有 broadcast 讲师，只有能一起 ship 的人。',
    },
  ],
}

export const whoFor = {
  eyebrow: '适合谁 / 不适合谁',
  headline: '审核制，宁缺毋滥。',
  suits: [
    '手里有 idea，想真正 ship 出海产品的 builder',
    '做过一点东西，但还没形成节奏的独立开发者',
    '愿意被 deadline、同伴压力、Demo Day 推一把的人',
    '想进入一个高密度、非泛社群的 cohort',
  ],
  notSuits: [
    '只想听课、收藏课件的学习者',
    '两周内没法每天投入数小时的人',
    '当下并不打算做全球化产品的人',
    '期待有人手把手带你走完全程的人',
  ],
}

export const timeline = {
  eyebrow: '活动节奏',
  headline: '从招募到 Demo Day，4 个阶段。',
  stages: [
    {
      phase: '01',
      name: '招募期',
      when: 'Week 0',
      points: [
        '开放申请通道',
        '提交 idea 与 build direction',
        '目标：筛出真正会 ship 的 cohort',
      ],
    },
    {
      phase: '02',
      name: '录取期',
      when: 'Week 0.5',
      points: [
        '审核申请、发放录取通知',
        '录取后完成 ¥399 防鸽费（完成 Demo Day 后退还）',
        '目标：cohort 集结，方向确认',
      ],
    },
    {
      phase: '03',
      name: '共学期',
      when: 'Week 1 – 2',
      points: [
        '每周固定节奏会 + 异步 sprint',
        '出海 / 支付 / 增长关卡分享',
        '目标：idea 推到 demo 可见',
      ],
    },
    {
      phase: '04',
      name: 'Demo Day',
      when: '第 2 周末',
      points: [
        '线上集中 Demo',
        '项目上线或对外可演示',
        '同学录与项目沉淀对外公开',
      ],
    },
  ],
}

export const outcome = {
  eyebrow: '你最后会带走什么',
  headline: '两周之后，不是笔记，是结果。',
  items: [
    {
      title: '一个真实可展示的项目',
      body: '代码 + demo + 可对外访问的入口，不是 PPT，也不是 roadmap。',
    },
    {
      title: '一次 Demo Day 登台机会',
      body: '面向 cohort 内部展示，优秀项目对外公开传播。',
    },
    {
      title: '一组能继续合作的 cohort 同伴',
      body: '小规模、高信号、过滤过动机——大概率是你以后真正合作的人。',
    },
    {
      title: '一份可公开的个人 profile',
      body: '进入 SoloShip 同学录，项目和链接长期沉淀在活动资产里。',
    },
  ],
}

export const faq = {
  eyebrow: 'FAQ',
  headline: '申请前你可能想知道的。',
  items: [
    {
      q: '报名之后是不是一定能进？',
      a: '不是。SoloShip 是审核制 cohort。报名后会进入待审核状态，我们会基于 build 动机、idea 清晰度、可投入时间来筛选。',
    },
    {
      q: '¥399 什么时候收？',
      a: '录取之后才收。先申请、再审核，通过了才收款——这样对双方都更干净。¥399 是防鸽费，完成全流程（到达 Demo Day）后全额退还。',
    },
    {
      q: '需要已经有项目吗？',
      a: '不强制，但需要有明确的方向和 idea。SoloShip 不是帮你从 0 想题目，是帮你把手里的 idea 两周内 ship 出去。',
    },
    {
      q: '线上还是线下？',
      a: 'Vol.1 主要是线上 + 异步。每周有固定节奏会，其余时间按 cohort 节奏自驱 shipping。',
    },
    {
      q: '怎样算完成项目？',
      a: '最低要求是 Demo Day 当天项目能对外演示（有代码 + 有 demo）。对外正式上线是 bonus。',
    },
    {
      q: '活动结束后资料会保留吗？',
      a: '会。录取学员会进入 SoloShip 同学录和资料页；优秀项目会在下一期招募时被公开展示。',
    },
    {
      q: '现在能申请吗？',
      a: 'Vol.1 申请通道筹备中，先以候补名单形式收集意向。开放后会优先通知名单上的 builder。',
    },
  ],
}

export const finalCta = {
  eyebrow: '下一步',
  headline: '下一个真的 ship 出去的项目，是不是你的？',
  sub: `Vol.1 限额 ${event.capacityShort}，审核制。申请通道开放时，候补名单会先收到通知。`,
  primaryCta: { label: '立即申请', href: event.applyHref },
  secondaryCta: { label: '先看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 ¥399 · 完成 Demo Day 后全额退还',
}

export const footer = {
  tagline: '为真的会 ship 的 builder 准备的 cohort。',
  links: [
    { label: '活动节奏', href: '#timeline' },
    { label: 'FAQ', href: '#faq' },
    { label: '立即申请', href: event.applyHref },
  ],
}
