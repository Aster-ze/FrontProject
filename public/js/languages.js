// js/languages.js
const translations = {
  // 首页 firstindex.html
  'firstindex': {
    'market-overview': { 'zh': '市场概览', 'en': 'Market Overview' },
    'view-all': { 'zh': '查看全部', 'en': 'View All' },
    'community-insights': { 'zh': '社区观点', 'en': 'Community Insights' },
    'sector-performance': { 'zh': '热门板块', 'en': 'Sector Performance' },
    'tech': { 'zh': '科技', 'en': 'Technology' },
    'healthcare': { 'zh': '医疗保健', 'en': 'Healthcare' },
    'energy': { 'zh': '能源', 'en': 'Energy' },
    'spx-name': { 'zh': '标普 500', 'en': 'S&P 500' },
    'ndx-name': { 'zh': '纳斯达克 100', 'en': 'Nasdaq 100' },
    'dji-name': { 'zh': '道琼斯工业平均', 'en': 'Dow Jones' },
    'rut-name': { 'zh': '罗素 2000', 'en': 'Russell 2000' },
    'article-title-1': { 'zh': '你一直在亏损？不是因为方法，而是因为你的心态。', 'en': 'Always losing? It\'s not the method, it\'s your mindset.' },
    'article-content-1': { 'zh': '你一直在亏损？不是因为方法，而是因为你的心态。先问问自己：你是不是一直在重复那些你明知道是错的交易习惯？你知道不该在没有信号的情况下进场——但你还是进了。你知道止...', 'en': 'Are you always losing? It\'s not the method, it\'s your mindset. Ask yourself: are you constantly repeating trading habits you know are wrong? You know you shouldn\'t enter without a signal - but you still do. You know to...' },
    'article-author-1': { 'zh': '由NMFlowTrading提供', 'en': 'By NMFlowTrading' },
    'article-title-2': { 'zh': '利多用尽？美元背后的下行风险不容忽视', 'en': 'Exhausted bullishness? Downside risks behind the dollar cannot be ignored' },
    'article-content-2': { 'zh': '在强劲非农就业报告后曾短暂反弹的美元，如今再度显得疲弱。近期DXY的上涨更像是长期跌势中的回调而非趋势反转。动能在关键阻力区消退，自7月初以来，美元指数（DXY）持...', 'en': 'The dollar, which briefly rebounded after the strong non-farm payroll report, now appears weak again. The recent rise in the DXY is more like a retracement in a long-term downtrend rather than a trend reversal. Momentum fades at key resistance levels...' },
    'article-author-2': { 'zh': '由Capitalcom提供', 'en': 'By Capitalcom' },
    'article-title-3': { 'zh': '21日黄金希望回踩3330，4H BB区域重新上涨', 'en': 'Gold hopes to retrace to 3330 on the 21st, rebound from 4H BB area' },
    'article-content-3': { 'zh': '黄金上周四美盘前清除了10日低点后开启了一轮上涨，期望周一低开回到3330区域，也就是回踩4H的破坏块区域，有反转信号，跟随做多，目标上方77，随后再逐步向上。', 'en': 'After clearing the 10-day low before the US market opened last Thursday, gold started a new round of rallies. It is expected to open lower on Monday and return to the 3330 area, which is the retracement to the 4H breakout block area...' },
    'article-author-3': { 'zh': '由willsenwong提供', 'en': 'By willsenwong' },
    'stock-count-1': { 'zh': '124 只股票', 'en': '124 stocks' },
    'stock-count-2': { 'zh': '98 只股票', 'en': '98 stocks' },
    'stock-count-3': { 'zh': '67 只股票', 'en': '67 stocks' },
    'today': { 'zh': '今日', 'en': 'Today' },
    'nvidia': { 'zh': '英伟达', 'en': 'NVIDIA' },
    'meta': { 'zh': 'Meta', 'en': 'Meta' },
    'tsmc': { 'zh': '台积电', 'en': 'TSMC' },
    'merck': { 'zh': '默克', 'en': 'Merck' },
    'pfizer': { 'zh': '辉瑞', 'en': 'Pfizer' },
    'moderna': { 'zh': 'Moderna', 'en': 'Moderna' },
    'exxon': { 'zh': '埃克森美孚', 'en': 'Exxon Mobil' },
    'chevron': { 'zh': '雪佛龙', 'en': 'Chevron' },
    'conocophillips': { 'zh': '康菲石油', 'en': 'ConocoPhillips' },
    'view-all-insights': { 'zh': '查看全部', 'en': 'View All' },
    'view-all-sectors': { 'zh': '查看全部', 'en': 'View All' }
  },
  
  // 其他页面翻译（保持不变）
 // 在translations对象中添加或修改index页面的翻译
// 在index对象中补充所有缺失的翻译键
'index': {
  'market-center': { 'zh': '行情中心', 'en': 'Market Center' },
  'sort-by-change': { 'zh': '按涨幅排序', 'en': 'Sort by Change' },
  'sort-by-market-cap': { 'zh': '按市值排序', 'en': 'Sort by Market Cap' },
  'sort-by-name': { 'zh': '按名称排序', 'en': 'Sort by Name' },
  'id': { 'zh': 'ID', 'en': 'ID' },
  'name': { 'zh': '名字', 'en': 'Name' },
  'change': { 'zh': '涨幅', 'en': 'Change' },
  'volume': { 'zh': '成交量', 'en': 'Volume' },
  'pe-ratio': { 'zh': '市盈率', 'en': 'P/E Ratio' },
  'turnover-rate': { 'zh': '换手率', 'en': 'Turnover Rate' },
  'funds-inflow': { 'zh': '资金流入', 'en': 'Funds Inflow' },
  'high-52w': { 'zh': '52周最高', 'en': '52W High' },
  'pb-ratio': { 'zh': '市净率', 'en': 'P/B Ratio' },
  'funds-outflow': { 'zh': '资金流出', 'en': 'Funds Outflow' },
  'low-52w': { 'zh': '52周最低', 'en': '52W Low' },
  'buy': { 'zh': '买入', 'en': 'Buy' },
  'buy-confirmation': { 'zh': '买入确认', 'en': 'Buy Confirmation' },
  'stock-name': { 'zh': '股票名称:', 'en': 'Stock Name:' },
  'stock-code': { 'zh': '股票代码:', 'en': 'Stock Code:' },
  'current-price': { 'zh': '当前价格:', 'en': 'Current Price:' },
  'trading-quantity': { 'zh': '交易数量:', 'en': 'Trading Quantity:' },
  'shares': { 'zh': '股', 'en': 'shares' },
  'trading-amount': { 'zh': '交易金额:', 'en': 'Trading Amount:' },
  'cancel': { 'zh': '取消', 'en': 'Cancel' },
  'confirm': { 'zh': '确认', 'en': 'Confirm' },
  // 新增翻译键
  'search-stocks': { 'zh': '搜索股票...', 'en': 'Search for stocks' },
  'capital-inflow': { 'zh': '资金流入', 'en': 'Capital Inflow' },
  'capital-outflow': { 'zh': '资金流出', 'en': 'Capital Outflow' },
  'trading-volume': { 'zh': '成交量', 'en': 'Trading Volume' },
  'close-modal': { 'zh': '关闭', 'en': 'Close' }
},
  'positions': {
    'portfolio': { 'zh': '持仓', 'en': 'Portfolio' },
    'total-assets': { 'zh': '总资产', 'en': 'Total Assets' },
    'daily-pnl': { 'zh': '当日盈亏', 'en': 'Daily P&L' },
    'holdings-count': { 'zh': '持仓股票数', 'en': 'Holdings' },
    'shanghai-index': { 'zh': '上证指数', 'en': 'Shanghai Index' },
    'portfolio-details': { 'zh': '持仓详情', 'en': 'Portfolio Details' },
    'search-placeholder': { 'zh': '搜索股票代码或名称...', 'en': 'Search by code or name...' },
    'view-all': { 'zh': '全部', 'en': 'All' },
    'profit': { 'zh': '盈利', 'en': 'Profit' },
    'loss': { 'zh': '亏损', 'en': 'Loss' },
    'stock-code': { 'zh': '股票代码', 'en': 'Code' },
    'stock-name': { 'zh': '名称', 'en': 'Name' },
    'quantity': { 'zh': '持仓数量', 'en': 'Quantity' },
    'cost-price': { 'zh': '成本价', 'en': 'Cost Price' },
    'current-price': { 'zh': '当前价', 'en': 'Current Price' },
    'pnl': { 'zh': '盈亏', 'en': 'P&L' },
    'action': { 'zh': '操作', 'en': 'Action' },
    'buy': { 'zh': '买入', 'en': 'Buy' },
    'sell': { 'zh': '卖出', 'en': 'Sell' },
    'history': { 'zh': '查看历史交易记录', 'en': 'View Transaction History' },
    'history-title': { 'zh': '历史交易记录', 'en': 'Transaction History' }
  },
  'news': {
    'news-title': { 'zh': '股票市场新闻', 'en': 'Stock Market News' },
    'market-analysis': { 'zh': '市场分析', 'en': 'Market Analysis' },
    'industry-news': { 'zh': '行业动态', 'en': 'Industry News' },
    'sector-analysis': { 'zh': '板块分析', 'en': 'Sector Analysis' },
    'fund-flows': { 'zh': '资金流向', 'en': 'Fund Flows' },
    'earnings': { 'zh': '公司财报', 'en': 'Earnings' },
    'macro': { 'zh': '宏观政策', 'en': 'Macro Policy' },
    'hk-market': { 'zh': '港股动态', 'en': 'HK Market' }
  },
  'personal-settings': {
    'personal-settings': { 'zh': '个人设置', 'en': 'Personal Settings' },
    'full-name': { 'zh': '姓名', 'en': 'Full Name' },
    'nickname': { 'zh': '昵称', 'en': 'Nickname' },
    'email': { 'zh': '邮箱', 'en': 'Email' },
    'phone': { 'zh': '手机号', 'en': 'Phone' },
    'bio': { 'zh': '个人简介', 'en': 'Bio' },
    'avatar': { 'zh': '头像', 'en': 'Avatar' },
    'change-avatar': { 'zh': '更换头像', 'en': 'Change Avatar' },
    'save-settings': { 'zh': '保存设置', 'en': 'Save Settings' }
  },
  'account-settings': {
    'account-settings': { 'zh': '账户信息', 'en': 'Account Settings' },
    'account-details': { 'zh': '账户详情', 'en': 'Account Details' },
    'username': { 'zh': '用户名', 'en': 'Username' },
    'account-id': { 'zh': '账户ID', 'en': 'Account ID' },
    'register-date': { 'zh': '注册时间', 'en': 'Register Date' },
    'last-login': { 'zh': '最后登录', 'en': 'Last Login' },
    'security-settings': { 'zh': '安全设置', 'en': 'Security Settings' },
    'current-password': { 'zh': '当前密码', 'en': 'Current Password' },
    'new-password': { 'zh': '新密码', 'en': 'New Password' },
    'confirm-password': { 'zh': '确认新密码', 'en': 'Confirm New Password' },
    'change-password': { 'zh': '修改密码', 'en': 'Change Password' },
    'danger-zone': { 'zh': '危险操作', 'en': 'Danger Zone' },
    'delete-account': { 'zh': '注销账户', 'en': 'Delete Account' },
    'delete-warning': { 'zh': '注销后将永久删除您的所有数据，此操作不可恢复', 'en': 'Deleting your account will permanently remove all your data. This action cannot be undone.' }
  },
  'login': {
    'login-title': { 'zh': '登录您的账户', 'en': 'Login to Your Account' },
    'login-prompt': { 'zh': '输入您的凭证以访问交易系统', 'en': 'Enter your credentials to access the trading system' },
    'username': { 'zh': '用户名', 'en': 'Username' },
    'password': { 'zh': '密码', 'en': 'Password' },
    'remember-me': { 'zh': '记住我', 'en': 'Remember Me' },
    'forgot-password': { 'zh': '忘记密码？', 'en': 'Forgot Password?' },
    'login': { 'zh': '登录', 'en': 'Login' },
    'no-account': { 'zh': '还没有账户？', 'en': 'No account yet?' },
    'register': { 'zh': '立即注册', 'en': 'Register Now' }
  },
  'common': {
    'home': { 'zh': '首页', 'en': 'Home' },
    'details': { 'zh': '详情', 'en': 'Details' },
    'portfolio': { 'zh': '持仓', 'en': 'Portfolio' },
    'news': { 'zh': '新闻', 'en': 'News' },
    'personal-settings': { 'zh': '个人设置', 'en': 'Personal Settings' },
    'account-info': { 'zh': '账户信息', 'en': 'Account Info' },
    'logout': { 'zh': '退出登录', 'en': 'Logout' },
    'search-placeholder': { 'zh': '搜索股票...', 'en': 'Search stocks...' },
    'search-placeholder-news': { 'zh': '搜索股票、指数、加密货币...', 'en': 'Search stocks, indices, crypto...' }
  }
};

// 修复后的语言管理器
class LanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'zh';
    this.init();
  }
  
  init() {
    // 强制初始化翻译
    this.setLanguage(this.currentLanguage);
    this.translatePage(); // 手动触发一次翻译
    
    // 绑定语言切换事件
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }
  }
  
  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', this.currentLanguage);
    this.setLanguage(this.currentLanguage);
  }
  
  setLanguage(lang) {
    this.currentLanguage = lang;
    this.translatePage();
    this.updateLanguageText();
  }
  
  updateLanguageText() {
    const languageText = document.getElementById('languageText');
    if (languageText) {
      languageText.textContent = this.currentLanguage === 'zh' ? 'EN' : '中文';
    }
  }
  
  translatePage() {
    const pageId = this.getCurrentPageId();
    if (!pageId) return;

    // 翻译通用元素（导航栏等）
    this.translateCommonElements();
    
    // 翻译页面特定元素
    const pageTranslations = translations[pageId];
    if (pageTranslations) {
      Object.keys(pageTranslations).forEach(key => {
        this.translateElement(key, pageId, key);
      });
    }
  }
  
  // 单独翻译通用元素（导航、按钮等）
  translateCommonElements() {
    const commonKeys = Object.keys(translations.common);
    commonKeys.forEach(key => {
      this.translateElement(`common-${key}`, 'common', key);
    });
  }
  
  getCurrentPageId() {
    const path = window.location.pathname;
    if (path.includes('firstindex')) return 'firstindex';
    if (path.includes('index') && !path.includes('firstindex')) return 'index';
    if (path.includes('positions')) return 'positions';
    if (path.includes('news')) return 'news';
    if (path.includes('personal-settings')) return 'personal-settings';
    if (path.includes('account-settings')) return 'account-settings';
    if (path.includes('login')) return 'login';
    return null;
  }
  
  // 修复的元素翻译方法（精准匹配data-i18n属性）
  translateElement(elementKey, page, translationKey) {
    // 直接通过data-i18n属性查找元素（最可靠）
    const element = document.querySelector(`[data-i18n="${elementKey}"]`);
    if (!element) return;

    // 获取对应翻译
    const translation = translations[page]?.[translationKey]?.[this.currentLanguage];
    if (!translation) return;

    // 应用翻译
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation; // 输入框占位符
    } else {
      element.textContent = translation; // 普通文本
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  window.languageManager = new LanguageManager();
});