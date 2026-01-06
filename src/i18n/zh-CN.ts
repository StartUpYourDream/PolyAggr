// 中文语言包
export const zhCN = {
  // 通用
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    all: '全部',
  },

  // 页面导航
  nav: {
    trending: '热门',
    leaderboard: '排行榜',
    dashboard: '数据看板',
    portfolio: '我的持仓',
    events: '事件',
    user: '用户',
    search: '搜索',
  },

  // Trending 页面
  trending: {
    title: '热门市场',
    category: '分类',
    categories: {
      all: '全部',
      politics: '政治',
      crypto: '加密货币',
      sports: '体育',
      business: '商业',
      science: '科技',
      entertainment: '娱乐',
    },
    table: {
      event: '事件',
      category: '分类',
      volume: '24h交易量',
      oi: '持仓量',
      oiChange: '持仓变化',
      bidDepth: '买盘深度',
      askDepth: '卖盘深度',
      change1h: '1h涨跌',
      change24h: '24h涨跌',
    },
  },

  // Event Detail 页面
  eventDetail: {
    priceChart: '价格走势',
    orderBook: '订单簿',
    marketStats: '市场数据',

    // 数据概览 - 12个核心指标
    totalOpenInterest: '总持仓',
    volume24h: '24h成交额',
    turnoverRate: '换手率',
    activeTraders: '活跃地址',
    newTraders: '新增地址',
    avgSpread: '平均价差',
    volatility: '波动率',
    whaleConcentration: '持仓集中度',
    liquidityConcentration: '流动性集中度',
    lateVolumeSpike: '临期异动',
    disputeRisk: '争议风险',
    creditScore: '信用评分',

    // YES/NO 单腿数据 - 16个指标
    price: '当前价格',
    priceChange1h: '1h变化',
    priceChange24h: '24h变化',
    outcomeVolume24h: '单腿成交额',
    outcomeOI: '单腿持仓',
    legTurnoverRate: '单腿换手',
    bidDepth: '买盘深度',
    askDepth: '卖盘深度',
    depthSkew: '深度偏斜',
    liquidityGap: '流动性缺口',
    liquidityWalls: '流动性墙',
    vwapDeviation: '均价偏离',
    smartMoneyRatio: '聪明钱占比',
    whaleRatio: '鲸鱼占比',
    manipulationRisk: '操纵风险',
    legConfidence: '可信度',

    tradeOnPolymarket: '在 Polymarket 交易',

    // 数据项提示说明
    tooltips: {
      totalOpenInterest: '事件所有方向的总持仓量',
      volume24h: '过去24小时的总交易金额',
      turnoverRate: '24h成交额/总持仓,反映市场活跃度',
      activeTraders: '24h内有交易活动的地址数',
      newTraders: '24h内首次参与该市场的新地址数',
      avgSpread: '买一卖一价格差的平均值,反映流动性',
      volatility: '价格波动的标准差,反映市场不确定性',
      whaleConcentration: '大户持仓占比,反映市场集中度',
      liquidityConcentration: '做市商流动性集中程度',
      lateVolumeSpike: '临近结算时的异常交易量',
      disputeRisk: '基于历史数据的结算争议可能性',
      creditScore: '综合评估该事件的质量评分',

      price: '当前该方向的价格',
      priceChange1h: '过去1小时的价格变化',
      priceChange24h: '过去24小时的价格变化',
      outcomeVolume24h: '该单腿24h的成交金额',
      outcomeOI: '该单腿的持仓量',
      legTurnoverRate: '该单腿的换手率',
      bidDepth: '买盘订单簿前10档深度',
      askDepth: '卖盘订单簿前10档深度',
      depthSkew: '买卖深度差异,正值表示买盘强',
      liquidityGap: '订单簿中的流动性真空区域',
      liquidityWalls: '大额挂单形成的流动性障碍',
      vwapDeviation: '当前价与成交均价的偏离度',
      smartMoneyRatio: '专业交易者的参与比例',
      whaleRatio: '大户交易占该腿的比例',
      manipulationRisk: '该方向被操纵的风险评分',
      legConfidence: '该方向数据可信度评分',
    },

    tabs: {
      holders: '持仓者',
      topTraders: '顶级交易者',
      activity: '活动记录',
    },

    table: {
      address: '地址',
      shares: '份额',
      value: '价值',
      avgBuy: '买入均价',
      avgSell: '卖出均价',
      realizedPnL: '已实现盈亏',
      unrealizedPnL: '未实现盈亏',
      time: '时间',
      type: '类型',
      price: '价格',
      total: '总计',
      txHash: '交易哈希',
    },
  },

  // User Detail 页面
  userDetail: {
    address: '地址',
    balance: '余额',
    winRate: '胜率',
    realizedPnL: '已实现盈亏',
    totalPnL: '总盈亏',
    roi: '投资回报率',

    analysis: '数据分析',
    distribution: '分布情况',

    stats: {
      marketsTraded: '交易市场数',
      totalTrades: '总交易次数',
      volume7d: '7天交易量',
      avgTradeSize: '平均交易规模',
      avgHoldingTime: '平均持仓时间',
      bestTrade: '最佳交易',
    },

    tabs: {
      holdings: '持仓',
      tradeHistory: '交易历史',
      activity: '活动记录',
    },

    table: {
      eventName: '事件名称',
      shares: '份额',
      value: '价值',
      avgBuy: '买入均价',
      avgSell: '卖出均价',
      realizedPnL: '已实现盈亏',
      unrealizedPnL: '未实现盈亏',
      endDate: '结束日期',
      firstTrade: '首次交易',
      status: '状态',
      txCount: '交易次数',
      holdingDays: '持仓天数',
      time: '时间',
      type: '类型',
      price: '价格',
      total: '总计',
      txHash: '交易哈希',
    },

    status: {
      active: '活跃',
      closed: '已关闭',
      resolved: '已结算',
    },
  },

  // Search 页面
  search: {
    placeholder: '搜索事件或用户地址...',
    history: '搜索历史',
    clearAll: '清空全部',
    notFound: '未找到结果',
  },

  // Leaderboard 页面
  leaderboard: {
    title: '用户排行榜',
    subtitle: '根据投资回报率和交易表现排名的顶级交易者',
    rank: '排名',
    address: '地址',
    balance: '余额',
    portfolioValue: '持仓价值',
    roi7d: '7日回报',
    roi30d: '30日回报',
    roiTotal: '总回报',
    winRate: '胜率',
    buyCount: '买入',
    sellCount: '卖出',
  },

  // Dashboard 页面
  dashboard: {
    title: '数据看板',
    subtitle: '预测市场平台的关键指标和趋势分析',
    platform: {
      all: '所有平台',
      polymarket: 'Polymarket',
      kalshi: 'Kalshi',
      manifold: 'Manifold',
    },
    kpi: {
      totalVolume: '总交易量',
      volume24h: '24h交易量',
      totalUsers: '总用户数',
      activeUsers: '活跃用户',
      totalMarkets: '总市场数',
      activeMarkets: '活跃市场',
    },
    charts: {
      volumeTrend: '交易量趋势',
      userGrowth: '用户增长',
      eventStatus: '事件状态分布',
      categoryDistribution: '分类分布',
      tradingHeatmap: '交易热力图',
      topMarkets: '热门市场',
    },
  },

  // 时间
  time: {
    day: '天',
    hour: '小时',
    minute: '分钟',
    second: '秒',
    ago: '前',
  },
}

export type Locale = typeof zhCN
