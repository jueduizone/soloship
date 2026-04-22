// 中文文案字典。新增文案一律加到这里，不要直接写字面量。
export const zh = {
  auth: {
    login: {
      title: '登录 SoloShip',
      subtitle: '选择一种方式开始：',
      google: '使用 Google 继续',
      github: '使用 GitHub 继续',
      emailTab: '邮箱登录',
      signUpTab: '邮箱注册',
      email: '邮箱',
      password: '密码',
      submitLogin: '登录',
      submitSignUp: '创建账号',
      verifyHint: '我们已发送验证邮件到你的邮箱，点击邮件中的链接即可完成注册。',
      backToHome: '返回首页',
    },
    verify: {
      title: '请查收验证邮件',
      body: '验证链接已发送到你的邮箱。点击邮件中的链接后，会自动跳回这里。',
    },
  },
  apply: {
    title: '报名 SoloShip Vol.1',
    subtitle: '两周高压 shipping sprint。先提交申请，录取后再付款。',
    form: {
      name: '姓名 / 英文名',
      email: '邮箱',
      city: '所在城市',
      contact: '联系方式（微信或手机号）',
      bio: '一句话介绍自己',
      direction: '方向标签（选填）',
      idea: '想做什么项目（选填）',
      links: '相关链接（GitHub / Twitter / 作品，一行一个，选填）',
      submit: '提交申请',
    },
    success: {
      title: '申请已提交',
      body: '我们会在 3 个工作日内审核完成，并通过邮件发送结果。你可以在报名状态页随时查询进度。',
    },
    status: {
      title: '我的报名状态',
      empty: '你还没有提交报名。',
      goApply: '去报名',
    },
  },
  common: {
    loading: '加载中…',
    error: '出错了，请稍后再试。',
  },
} as const
