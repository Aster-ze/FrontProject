const express = require('express');
const router = express.Router();

// 模拟股票数据
const stockData = {
  600519: {
    name: '贵州茅台',
    price: 1800.0,
    change: '+1.23%',
    trend: 'up',
    volume: '123.45万',
    pe: '28.5',
    turnover: '0.8%',
    inflow: '¥ 5.67亿',
    high52: '¥ 2100.00',
    pb: '12.3',
    volumeHand: '2.3万手',
    outflow: '¥ 3.21亿',
    low52: '¥ 1500.00',
    kline: [1780, 1785, 1790, 1795, 1800, 1805, 1810, 1808, 1805, 1803, 1800],
  },
  _000001: {
    name: '平安银行',
    price: 42.35,
    change: '+0.87%',
    trend: 'up',
    volume: '678.90万',
    pe: '8.5',
    turnover: '0.9%',
    inflow: '¥ 2.89亿',
    high52: '¥ 50.10',
    pb: '1.2',
    volumeHand: '67.89万手',
    outflow: '¥ 2.56亿',
    low52: '¥ 38.20',
    kline: [
      41.9, 42.05, 42.1, 42.15, 42.2, 42.25, 42.3, 42.32, 42.33, 42.34, 42.35,
    ],
  },
  // 其他股票数据...
};

// 获取所有股票列表
router.get('/list', (req, res) => {
  try {
    // 提取股票列表所需的基本信息
    const stockList = Object.keys(stockData).map((stockId) => ({
      id: stockId,
      name: stockData[stockId].name,
      change: stockData[stockId].change,
      trend: stockData[stockId].trend,
    }));

    res.json({
      success: true,
      data: stockList,
    });
  } catch (error) {
    res.json({
      success: false,
      message: '获取股票列表失败',
      error: error.message,
    });
  }
});

// 获取单个股票详情
router.get('/detail/:stockId', (req, res) => {
  try {
    const { stockId } = req.params;
    const stock = stockData[stockId];

    if (!stock) {
      return res.json({
        success: false,
        message: '未找到该股票',
      });
    }

    res.json({
      success: true,
      data: stock,
    });
  } catch (error) {
    res.json({
      success: false,
      message: '获取股票详情失败',
      error: error.message,
    });
  }
});

// 搜索股票
router.get('/search', (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.json({
        success: false,
        message: '请输入搜索关键词',
      });
    }

    const keywordLower = keyword.toLowerCase();
    const results = Object.keys(stockData)
      .filter(
        (stockId) =>
          stockId.toLowerCase().includes(keywordLower) ||
          stockData[stockId].name.toLowerCase().includes(keywordLower)
      )
      .map((stockId) => ({
        id: stockId,
        name: stockData[stockId].name,
        change: stockData[stockId].change,
        trend: stockData[stockId].trend,
      }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.json({
      success: false,
      message: '搜索股票失败',
      error: error.message,
    });
  }
});

module.exports = router;
