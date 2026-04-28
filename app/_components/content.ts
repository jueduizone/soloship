export const event = {
  name: 'SoloShip',
  volume: 'Vol.1',
  tagline: 'AI OPC 共学营',
  year: '2026',
  duration: '5.23 – 6.7',
  format: '线下开营 + 线上共学 + 线下 Demo Day',
  capacity: '80 人 · 40 支队伍 · 审核制',
  capacityShort: '80 人',
  price: '¥499',
  priceNote: '其中 ¥399 完成任务后退还',
  status: 'Vol.1 申请通道现已开启',
  statusShort: '即将开放',
  applyHref: '/apply',
  timelineHref: '#timeline',
}

export const nav = {
  links: [
    { label: '为什么', href: '#why' },
    { label: '活动节奏', href: '#timeline' },
    { label: '嘉宾', href: '#mentors' },
    { label: '合作伙伴', href: '#partners' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: '立即申请', href: event.applyHref },
}

export const hero = {
  eyebrow: `${event.volume} · ${event.year} · ${event.tagline}`,
  status: event.status,
  headline: '两周，把手里的 idea 做成一个能上线、能收款的全球化 AI 产品。',
  sub: '1 天线下开营 + 2 周线上共学 + 1 天线下 Demo Day。给 AI 时代的 OPC 一个带 deadline、带同伴、带真实反馈的 shipping sprint。',
  meta: [
    { label: '周期', value: event.duration },
    { label: '形式', value: event.format },
    { label: '名额', value: event.capacity },
    { label: '价格', value: `${event.price} · ${event.priceNote}` },
  ],
  primaryCta: { label: '立即申请', href: event.applyHref },
  secondaryCta: { label: '查看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 ¥499 · 其中 ¥399 完成任务后退还 · 申请通道开放时，候补名单优先通知',
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
      when: '4.23 – 5.16',
      points: [
        '开放线上招募，预计招募 80 人 / 40 支队伍',
        '提交 idea 与 build direction',
        '看重 OPC、全球化与商业落地潜力',
      ],
    },
    {
      phase: '02',
      name: '录取期',
      when: '5.18 – 5.22',
      points: [
        '审核申请、发放录取通知',
        '录取后完成 ¥499 门票，其中 ¥399 完成任务后退还',
        '目标：cohort 集结，方向确认',
      ],
    },
    {
      phase: '03',
      name: '开营 + 线上共学',
      when: '5.23 – 6.6',
      points: [
        '5.23 上海线下开营，干货分享、圆桌、分组与 Office Hour',
        '两周线上课程：方向、MVP、上线、定价、增长与 AI 硬件出海',
        '目标：idea 推到 demo 可见，并跑通商业闭环假设',
      ],
    },
    {
      phase: '04',
      name: 'Demo Day',
      when: '6.7 · 上海',
      points: [
        '上海｜长三角绿洲智谷·赵巷线下路演',
        '每队 5 分钟 Demo + 3 分钟评委 Q&A',
        '颁奖典礼与 Afterparty，优秀项目对外传播',
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

export const mentors = {
  eyebrow: 'Mentors & Guests',
  headline: '不是导师天团，是正在一线 ship 的实战派。',
  sub: '覆盖 OPC、需求验证、AI 工具栈、MVP 上线、产品品味、定价闭环、PH 打榜、AI 硬件出海等关键关卡。',
  groups: [
    {
      label: 'OPC / 方向',
      people: [
        {
          name: 'Luke Kim',
          role: '独立个人创业导师，UC Berkeley 讲师',
          bio: '$25M raised，500+ coached，聚焦 OPC 理念、定价与个人商业闭环。',
          avatarUrl: '/assets/guests/luke-kim.jpg',
        },
        {
          name: 'Cell 细胞',
          role: '独立开发者，造物矩阵社区发起人，小火炉播客创始人',
          bio: '2024 年发起 OPC 社区造物矩阵，社群人数 2k+；提出「BIP 订阅制真人秀」OPC 内容创业模式。',
          avatarUrl: '/assets/guests/cell.png',
        },
        {
          name: '江昪',
          role: 'VibeFriends 组织者，前稀土掘金联合创始人',
          bio: '分享真实需求发现、48 小时验证与细分市场机会判断。',
          avatarUrl: '/assets/guests/jiang-bian.png',
        },
      ],
    },
    {
      label: '产品 / 开发 / 上线',
      people: [
        {
          name: 'AN',
          role: 'AI Builder，慕尼黑工业大学 CS 硕士',
          bio: 'Fintech 行业近十年经验，个人项目月度 token 消耗 $10,000+，构建端到端自动化真实业务流程。',
          avatarUrl: '/assets/guests/an.jpg',
        },
        {
          name: '章鱼',
          role: '独立开发者，Founder of Web3Insight',
          bio: '香港大学计算机系毕业，多年区块链开发经验，纯粹的 Web3 开发者。',
        },
        {
          name: '百顺',
          role: '华语圈出海创业者背后的冷启动导师',
          bio: '亲手操盘超 200 个出海产品冷启动，擅长 Product Hunt 发布与运营，独立打造 HeyForm / EarlyBird 等产品。',
        },
        {
          name: '辰丰',
          role: '出海去孵化器合伙人，Design Engineer',
          bio: '曾领导和参与 Wikipedia 全量可视化、通用知识图谱构建和交互式数据新闻开发，连接技术、设计与人文表达。',
        },
      ],
    },
    {
      label: '增长 / 硬件 / 现场嘉宾',
      people: [
        {
          name: 'Iris 生姜',
          role: 'AFFiNE 联合创始人 & 前 COO，福布斯亚洲 30U30',
          bio: '奇绩 S21 校友，出海运营 3 年触达 100+ 国家/地区，累计辅导 40+ 项目，覆盖 PH 打榜与可持续运营。',
        },
        {
          name: '赵维奇',
          role: '中美 AI 软硬件创业导师与连续创业者，Rokid 全球产品、工程与生态负责人',
          bio: '深耕 AI、AR 与空间计算十余年，孵化上百个 AI 软硬件项目从 0 到 1 落地，拥有数十项国际专利。',
        },
        {
          name: 'Kagehiro',
          role: 'Lockedin AI Founder',
          bio: 'AI 面试神器创业者，开营日分享 AI 产品出海与个人创业实战。',
        },
      ],
    },
  ],
}

export const partners = {
  eyebrow: 'Partners',
  headline: '和合作伙伴一起，把 SoloShip Vol.1 推出去。',
  sub: '感谢每一位合作伙伴在招募、内容、场地与传播上的支持，让这次共学营真正落地。',
  groups: [
    {
      label: '深度合作社区',
      items: [
        {
          name: 'Startup Grind 创业磨坊',
          logoUrl: '/assets/partners/startup-grind.png',
        },
        {
          name: 'OpenBuild',
          logoUrl: '/assets/partners/openbuild.png',
        },
        {
          name: '出海去孵化器',
          logoUrl: '/assets/partners/chuhaiqu.png',
        },
        { name: 'VibeFriends' },
      ],
    },
    {
      label: '特邀支持',
      items: [
        {
          name: '小红书科技',
          logoUrl: '/assets/partners/xiaohongshu.png',
        },
        { name: '长三角绿洲智谷·赵巷' },
      ],
    },
    {
      label: '合作社区',
      items: [
        {
          name: 'AIGCOpen',
          logoUrl: '/assets/partners/aigcopen.png',
        },
        {
          name: '少数派',
          logoUrl: '/assets/partners/sspai.png',
        },
        {
          name: '开源社',
          logoUrl: '/assets/partners/kaiyuanshe.png',
        },
        {
          name: 'Tech PodFest',
          logoUrl: '/assets/partners/techpodfest.png',
        },
        { name: 'wteam' },
        {
          name: '周周黑客松',
          logoUrl: '/assets/partners/hackathonweekly.png',
        },
        { name: 'AGIVilla' },
        {
          name: 'Datawhale',
          logoUrl: '/assets/partners/datawhale.png',
        },
      ],
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
      q: '¥499 什么时候收？',
      a: '录取之后才收。先申请、再审核，通过了才收款——这样对双方都更干净。¥499 为门票，其中 ¥399 在完成任务后退还。',
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
  secondaryCta: { label: '查看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 ¥499 · 其中 ¥399 完成任务后退还',
}

export const footer = {
  tagline: '为真的会 ship 的 builder 准备的 cohort。',
  links: [
    { label: '活动节奏', href: '#timeline' },
    { label: '嘉宾', href: '#mentors' },
    { label: '合作伙伴', href: '#partners' },
    { label: 'FAQ', href: '#faq' },
    { label: '立即申请', href: event.applyHref },
  ],
}
