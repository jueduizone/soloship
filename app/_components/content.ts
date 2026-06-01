export const event = {
  name: 'SoloShip',
  volume: 'Vol.1',
  tagline: 'AI OPC 共学营',
  year: '2026',
  duration: '3 周',
  format: '线下开营 + 线上共学 + 线下 Demo Day',
  capacity: '80 人 · 40 支队伍 · 审核制',
  capacityShort: '80 人',
  price: '¥499',
  priceNote: '¥399 任务完成后退还，¥100 进入公共奖金池',
  status: 'Vol.1 申请通道现已开启',
  statusShort: '开放申请',
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
  headline: '3 周，把 idea ship 成能上线、能收款的全球 AI 产品。',
  sub: '1 天线下开营 + 3 周线上共学 + 1 天线下 Demo Day。给 AI 时代的 OPC 一个带 deadline、带同伴、带真实反馈的 shipping sprint。',
  meta: [
    { label: '周期', value: event.duration },
    { label: '形式', value: event.format },
    { label: '名额', value: event.capacity },
    { label: '价格', value: `${event.price} · ${event.priceNote}` },
  ],
  primaryCta: { label: '立即申请', href: event.applyHref },
  secondaryCta: { label: '查看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 ¥499 · 完成任务返还 ¥399 · 余下 ¥100 用于公共奖金池与讲师补贴 · 赞助商 Token 权益另行发放，价值已超过 ¥100',
}

export const whyNow = {
  eyebrow: '为什么是现在',
  headline: '这是超级个体第一次真正能独立做全球产品的窗口。',
  body: [
    'AI 基础设施第一次让一个人完整覆盖一款产品的每一环——写代码、做设计、跑增长、做客服。',
    '真正卡住的早就不是技术，而是出海、支付、增长，以及把一个项目做完的执行力。',
    'SoloShip 把这几件事压进 3 周。在同伴密度和 deadline 之下，让项目真的 ship 出去。',
  ],
}

export const whySoloship = {
  eyebrow: 'WHY SOLOSHIP',
  headline: 'Cohort，不是课程。Sprint，不是社群。',
  cards: [
    {
      title: 'Builder-only',
      body: '3 周高密度 cohort，所有人都在同一条 ship 上。没有旁观者，也没有纯内容消费。',
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
    '无法在 3 周里每天投入数小时的人',
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
      when: '4.23 – 5.23',
      points: [
        '开放线上招募，预计招募 80 人 / 40 支队伍',
        '提交 idea 与 build direction',
        '看重 OPC、全球化与商业落地潜力',
      ],
    },
    {
      phase: '02',
      name: '录取期',
      when: '5.18 – 5.23',
      points: [
        '审核申请、发放录取通知',
        '录取后支付 ¥499：¥399 作为任务保证金，完成任务后退还',
        '剩余 ¥100 进入公共奖金池，用于 Demo Day 奖金与讲师补贴',
        '大模型赞助商提供额外 Token 奖励，权益价值已超过 ¥100',
        '目标：cohort 集结，方向确认',
      ],
    },
    {
      phase: '03',
      name: '开营 + 线上共学',
      when: '5.23 起 · 3 周',
      points: [
        '5.23 上海线下开营，干货分享、圆桌、分组与 Office Hour',
        '3 周线上课程：方向、MVP、上线、定价、增长与 AI 硬件出海',
        '目标：idea 推到 demo 可见，并跑通商业闭环假设',
      ],
    },
    {
      phase: '04',
      name: 'Demo Day',
      when: '第 3 周末 · 上海',
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
  headline: '3 周之后，不是笔记，是结果。',
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
          avatarUrl: '/assets/guests/luke-kim.png',
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
          name: '章鱼',
          role: '独立开发者，Founder of Web3Insight',
          bio: '香港大学计算机系毕业，多年区块链开发经验，纯粹的 Web3 开发者。',
          avatarUrl: '/assets/guests/zhangyu.jpg',
        },
        {
          name: '百顺',
          role: '华语圈出海创业者背后的冷启动导师',
          bio: '亲手操盘超 200 个出海产品冷启动，擅长 Product Hunt 发布与运营，独立打造 HeyForm / EarlyBird 等产品。',
          avatarUrl: '/assets/guests/baishun.png',
        },
        {
          name: '辰丰',
          role: '出海去孵化器合伙人，Design Engineer',
          bio: '曾领导和参与 Wikipedia 全量可视化、通用知识图谱构建和交互式数据新闻开发，连接技术、设计与人文表达。',
          avatarUrl: '/assets/guests/chenfeng.png',
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
          avatarUrl: '/assets/guests/iris-jiang.png',
        },
        {
          name: '赵维奇',
          role: '中美 AI 软硬件创业导师与连续创业者，Rokid 全球产品、工程与生态负责人',
          bio: '深耕 AI、AR 与空间计算十余年，孵化上百个 AI 软硬件项目从 0 到 1 落地，拥有数十项国际专利。',
          avatarUrl: '/assets/guests/zhao-weiqi.jpg',
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
      label: '特邀支持',
      items: [
        {
          name: '长三角绿洲智谷·赵巷',
          logoUrl: '/assets/partners/changsanjiao.png',
        },
        {
          name: '小红书科技',
          logoUrl: '/assets/partners/xiaohongshu.png',
        },
      ],
    },
    {
      label: '深度合作伙伴',
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
        {
          name: 'VibeFriends',
          logoUrl: '/assets/partners/vibefriends.png',
        },
        {
          name: 'Gingiris',
          logoUrl: '/assets/partners/gingiris.png',
        },
      ],
    },
    {
      label: '合作社区',
      items: [
        {
          name: '硅星人',
          logoUrl: '/assets/partners/guixingren.png',
        },
        {
          name: '京城一灯',
          logoUrl: '/assets/partners/jingchengyideng.png',
        },
        {
          name: '周周黑客松',
          logoUrl: '/assets/partners/hackathonweekly.png',
        },
        {
          name: 'AI 不神秘',
          logoUrl: '/assets/partners/ai-bushenmi.png',
        },
        {
          name: 'AI 工坊',
          logoUrl: '/assets/partners/aiworkshop.png',
        },
        {
          name: '去探索',
          logoUrl: '/assets/partners/waytoagi.png',
        },
        {
          name: '造物矩阵',
          logoUrl: '/assets/partners/zaowujuzhen.png',
        },
      ],
    },
    {
      label: '高校社区',
      items: [
        {
          name: 'ECNU',
          logoUrl: '/assets/partners/ecnu.png',
        },
        {
          name: '创业协会',
          logoUrl: '/assets/partners/chuangyexiehui.png',
        },
        {
          name: '交慧',
          logoUrl: '/assets/partners/jiaohui.png',
        },
        {
          name: '博远',
          logoUrl: '/assets/partners/boyuan.png',
        },
        {
          name: '复旦',
          logoUrl: '/assets/partners/fudan.png',
        },
        {
          name: 'SIEA',
          logoUrl: '/assets/partners/siea.png',
        },
        {
          name: '中国科学技术大学',
          logoUrl: '/assets/partners/ustc.png',
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
      a: '录取之后才收。¥499 更接近一笔任务保证金：完成任务后退还 ¥399，剩余 ¥100 进入公共奖金池，用于 Demo Day 奖金和讲师补贴。赞助商提供的大模型 Token、开发资源等权益会额外发放，目前 Token 奖励价值已超过 ¥100。',
    },
    {
      q: '需要已经有项目吗？',
      a: '不强制，但需要有明确的方向和 idea。SoloShip 不是帮你从 0 想题目，是帮你用 3 周把手里的 idea ship 出去。',
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
      a: '可以。Vol.1 申请通道现已开启，提交申请后会进入审核流程，审核结果会在申请状态页更新。',
    },
  ],
}

export const finalCta = {
  eyebrow: '下一步',
  headline: '下一个真的 ship 出去的项目，是不是你的？',
  sub: `Vol.1 限额 ${event.capacityShort}，审核制。现在可以提交申请，录取后再完成付款。`,
  primaryCta: { label: '立即申请', href: event.applyHref },
  secondaryCta: { label: '查看活动节奏', href: event.timelineHref },
  fineprint: '审核制 · 录取后支付 ¥499 · 完成任务返还 ¥399 · ¥100 进入公共奖金池 · Token 权益另计',
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

export const zhContent = {
  event,
  nav,
  hero,
  whyNow,
  whySoloship,
  whoFor,
  timeline,
  outcome,
  mentors,
  partners,
  faq,
  finalCta,
  footer,
  common: {
    program: 'PROGRAM',
    guest: 'GUEST',
    outcome: 'OUTCOME',
    suitableFor: '适合谁',
    notSuitableFor: '不适合谁',
    loading: '加载中',
    logout: '退出登录',
    loggingOut: '退出中',
    applyStatus: '申请状态',
    resources: '资料库',
    benefits: '福利',
    fellows: '同学录',
    admin: '后台',
  },
  wechat: {
    kicker: '微信内置浏览器',
    title: '请用系统浏览器打开',
    body: '报名、登录和付款确认在微信里可能无法正常完成。请点击右上角「...」，选择「在浏览器打开」。',
    continue: '继续浏览',
  },
}

export const enContent: typeof zhContent = {
  event: {
    ...event,
    tagline: 'AI OPC Cohort',
    duration: '3 weeks',
    format: 'Offline kickoff + online sprint + offline Demo Day',
    capacity: '80 builders · 40 teams · application-based',
    capacityShort: '80 builders',
    priceNote: '¥399 refunded after completion, ¥100 goes into the public prize pool',
    status: 'Applications for Vol.1 are open',
    statusShort: 'Applications open',
  },
  nav: {
    links: [
      { label: 'Why Now', href: '#why' },
      { label: 'Timeline', href: '#timeline' },
      { label: 'Guests', href: '#mentors' },
      { label: 'Partners', href: '#partners' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'Apply Now', href: event.applyHref },
  },
  hero: {
    eyebrow: `${event.volume} · ${event.year} · AI OPC Cohort`,
    status: 'Applications for Vol.1 are open',
    headline: 'A 3-week sprint to ship an AI product that can launch and charge globally.',
    sub: 'One offline kickoff, three weeks of online shipping, and one offline Demo Day. SoloShip gives AI-era OPC builders a deadline, peers, and real feedback.',
    meta: [
      { label: 'Duration', value: '3 weeks' },
      { label: 'Format', value: 'Offline kickoff + online sprint + offline Demo Day' },
      { label: 'Seats', value: '80 builders · 40 teams · application-based' },
      { label: 'Price', value: '¥499 · ¥399 refunded after completion, ¥100 goes into the prize pool' },
    ],
    primaryCta: { label: 'Apply Now', href: event.applyHref },
    secondaryCta: { label: 'View Timeline', href: event.timelineHref },
    fineprint: 'Application-based · Pay ¥499 after admission · Complete the sprint to get ¥399 back · ¥100 supports the prize pool and mentors · Sponsor token rewards are issued separately and already exceed ¥100 in value',
  },
  whyNow: {
    eyebrow: 'Why now',
    headline: 'For the first time, solo builders can realistically build global products end to end.',
    body: [
      'AI infrastructure now lets one person cover the full product loop: code, design, growth, support, and iteration.',
      'The real bottlenecks are no longer only technical. They are distribution, payments, growth, and finishing what you start.',
      'SoloShip compresses those constraints into three weeks, with peers and deadlines that make shipping real.',
    ],
  },
  whySoloship: {
    eyebrow: 'WHY SOLOSHIP',
    headline: 'A cohort, not a course. A sprint, not a group chat.',
    cards: [
      {
        title: 'Builder-only',
        body: 'A high-density 3-week cohort where everyone is building on the same timeline. No spectators, no passive content consumption.',
      },
      {
        title: 'Deadline-driven',
        body: 'This is not about collecting notes. By Demo Day, your product should be online or demoable.',
      },
      {
        title: 'Global-first',
        body: 'Projects default to global markets: English product surfaces, overseas payments, and global distribution.',
      },
      {
        title: 'Signal, not noise',
        body: 'Small scale and application-based admission keep the peer density high. You meet people who can actually ship with you.',
      },
    ],
  },
  whoFor: {
    eyebrow: 'Who it is for / not for',
    headline: 'Application-based, intentionally selective.',
    suits: [
      'Builders with an idea who want to ship a global product',
      'Indie builders who have made things but need a stronger shipping rhythm',
      'People who want deadlines, peer pressure, and Demo Day to push them forward',
      'Builders looking for a high-density cohort instead of a broad community',
    ],
    notSuits: [
      'People who only want to watch lessons and save notes',
      'People who cannot invest meaningful time during the 3-week sprint',
      'People who are not currently interested in global products',
      'People expecting step-by-step handholding through every decision',
    ],
  },
  timeline: {
    eyebrow: 'Timeline',
    headline: 'Four stages from application to Demo Day.',
    stages: [
      {
        phase: '01',
        name: 'Recruiting',
        when: 'Apr 23 – May 23',
        points: [
          'Open online applications for about 80 builders / 40 teams',
          'Submit your idea and build direction',
          'We look for OPC thinking, global potential, and commercial clarity',
        ],
      },
      {
        phase: '02',
        name: 'Admission',
        when: 'May 18 – May 23',
        points: [
          'Review applications and send admission decisions',
          'Admitted builders pay ¥499: ¥399 is a completion deposit and will be refunded after finishing the sprint',
          'The remaining ¥100 goes into the public prize pool for Demo Day rewards and mentor support',
          'LLM sponsors provide additional token rewards, already worth more than ¥100',
          'Goal: assemble the cohort and lock in directions',
        ],
      },
      {
        phase: '03',
        name: 'Kickoff + Online Sprint',
        when: 'From May 23 · 3 weeks',
        points: [
          'Offline kickoff in Shanghai with talks, roundtables, grouping, and office hours',
          'Three weeks of online sessions: direction, MVP, launch, pricing, growth, and AI hardware going global',
          'Goal: push an idea into a visible demo and test the business loop',
        ],
      },
      {
        phase: '04',
        name: 'Demo Day',
        when: 'Weekend of week 3 · Shanghai',
        points: [
          'Offline roadshow at Yangtze River Delta Oasis Zhigu · Zhaoxiang, Shanghai',
          'Each team gets 5 minutes for demo and 3 minutes for judges Q&A',
          'Awards and afterparty, with standout projects amplified publicly',
        ],
      },
    ],
  },
  outcome: {
    eyebrow: 'What you walk away with',
    headline: 'After three weeks, you leave with outcomes, not notes.',
    items: [
      {
        title: 'A real project people can see',
        body: 'Code, demo, and a public entry point. Not a slide deck or a roadmap.',
      },
      {
        title: 'A Demo Day stage',
        body: 'Present inside the cohort, with standout projects amplified publicly.',
      },
      {
        title: 'Peers you may keep building with',
        body: 'Small scale, high signal, and filtered motivation make future collaboration more likely.',
      },
      {
        title: 'A public builder profile',
        body: 'Join the SoloShip fellows directory, where your project and links become part of the cohort archive.',
      },
    ],
  },
  mentors: {
    eyebrow: 'Mentors & Guests',
    headline: 'Not a celebrity mentor lineup. Practical builders shipping in the field.',
    sub: 'Covering OPC, demand validation, AI toolchains, MVP launch, product taste, pricing loops, Product Hunt, and AI hardware going global.',
    groups: mentors.groups.map(group => ({
      ...group,
      label: group.label,
      people: group.people.map(person => ({
        ...person,
        role: person.role,
        bio: person.bio,
      })),
    })),
  },
  partners: {
    eyebrow: 'Partners',
    headline: 'Together with our partners, we bring SoloShip Vol.1 to life.',
    sub: 'Thanks to every partner supporting recruiting, content, venue, and distribution.',
    groups: partners.groups.map(group => ({
      ...group,
      label: group.label,
      items: group.items,
    })),
  },
  faq: {
    eyebrow: 'FAQ',
    headline: 'What you may want to know before applying.',
    items: [
      {
        q: 'Does applying guarantee admission?',
        a: 'No. SoloShip is an application-based cohort. We review build motivation, idea clarity, and available time before admitting builders.',
      },
      {
        q: 'When do I pay ¥499?',
        a: 'Only after admission. ¥499 works like a completion deposit: ¥399 is refunded when you finish the sprint, and ¥100 goes into the public prize pool for Demo Day rewards and mentor support. Sponsor tokens and developer resources are issued separately and already exceed ¥100 in value.',
      },
      {
        q: 'Do I need an existing project?',
        a: 'Not strictly, but you need a clear direction and idea. SoloShip is not here to invent your topic from scratch; it helps you ship what you already want to build.',
      },
      {
        q: 'Is it online or offline?',
        a: 'Vol.1 is online-first with asynchronous shipping, plus offline kickoff and Demo Day moments. Weekly sessions provide rhythm while builders drive execution.',
      },
      {
        q: 'What counts as completing the project?',
        a: 'The minimum requirement is a demoable project on Demo Day, with code and a working demo. A public launch is a bonus.',
      },
      {
        q: 'Will the materials remain available after the cohort?',
        a: 'Yes. Admitted builders keep access to the SoloShip directory and resource library, and standout projects may be featured publicly in future recruiting.',
      },
      {
        q: 'Can I apply now?',
        a: 'Yes. Applications for Vol.1 are open. After submission, your review status will be updated on the application status page.',
      },
    ],
  },
  finalCta: {
    eyebrow: 'Next step',
    headline: 'Will the next project that actually ships be yours?',
    sub: `Vol.1 is capped at 80 builders and application-based. Submit your application now; payment only happens after admission.`,
    primaryCta: { label: 'Apply Now', href: event.applyHref },
    secondaryCta: { label: 'View Timeline', href: event.timelineHref },
    fineprint: 'Application-based · Pay ¥499 after admission · Complete the sprint to get ¥399 back · ¥100 goes into the prize pool · Token rewards counted separately',
  },
  footer: {
    tagline: 'A cohort for builders who are actually ready to ship.',
    links: [
      { label: 'Timeline', href: '#timeline' },
      { label: 'Guests', href: '#mentors' },
      { label: 'Partners', href: '#partners' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Apply Now', href: event.applyHref },
    ],
  },
  common: {
    program: 'PROGRAM',
    guest: 'GUEST',
    outcome: 'OUTCOME',
    suitableFor: 'For',
    notSuitableFor: 'Not for',
    loading: 'Loading',
    logout: 'Log out',
    loggingOut: 'Logging out',
    applyStatus: 'Status',
    resources: 'Resources',
    benefits: 'Benefits',
    fellows: 'Fellows',
    admin: 'Admin',
  },
  wechat: {
    kicker: 'WeChat in-app browser',
    title: 'Open in your system browser',
    body: 'Application, login, and payment confirmation may not work reliably inside WeChat. Tap the menu in the top-right corner and choose "Open in browser".',
    continue: 'Continue browsing',
  },
}

export type SiteContent = typeof zhContent
export type SiteLocale = 'zh' | 'en'

export function getSiteContent(locale: SiteLocale): SiteContent {
  return locale === 'en' ? enContent : zhContent
}
