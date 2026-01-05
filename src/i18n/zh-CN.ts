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
    volume24h: '24h交易量',
    openInterest: '持仓量',
    totalVolume: '总交易量',
    bidDepth: '买盘深度',
    askDepth: '卖盘深度',
    depthSkew: '深度偏斜',
    change24h: '24h涨跌',
    tradeOnPolymarket: '在 Polymarket 交易',

    // 数据项提示说明
    tooltips: {
      volume24h: '过去24小时内该市场的总交易金额',
      openInterest: '当前所有未平仓合约的总价值',
      bidDepth: '买盘订单簿中前10档的总深度(支撑力度)',
      askDepth: '卖盘订单簿中前10档的总深度(阻力力度)',
      depthSkew: '买卖盘深度的不平衡程度,正值表示买盘更强,负值表示卖盘更强',
      priceChange24h: '过去24小时内价格的涨跌幅度',
      yesPrice: '看涨方(YES)的当前价格',
      noPrice: '看跌方(NO)的当前价格',
      drawPrice: '平局方(DRAW)的当前价格',
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
