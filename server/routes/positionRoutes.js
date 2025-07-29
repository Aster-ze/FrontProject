const express = require('express');
const router = express.Router();

// 模拟持仓数据
let positionData = [
  {
    code: '600519',
    name: '贵州茅台',
    amount: 100,
    costPrice: 1750.0,
    currentPrice: 1800.0,
    profit: 5000.0,
    profitRate: '+2.86%',
  },
  {
    code: '000001',
    name: '平安银行',
    amount: 500,
    costPrice: 41.5,
    currentPrice: 42.35,
    profit: 425.0,
    profitRate: '+2.05%',
  },
  // 其他持仓数据...
];

// 模拟历史交易记录
const historyData = [
  {
    id: 1,
    type: 'sell',
    name: '平安银行',
    code: '000001',
    date: '2023-06-14 14:20',
    amount: -200,
    price: 42.1,
  },
  {
    id: 2,
    type: 'buy',
    name: '宁德时代',
    code: '300750',
    date: '2023-06-12 10:15',
    amount: 200,
    price: 545.5,
  },
  // 其他历史记录...
];

// 获取持仓列表
router.get('/list', (req, res) => {
  try {
    res.json({
      success: true,
      data: positionData,
    });
  } catch (error) {
    res.json({
      success: false,
      message: '获取持仓列表失败',
      error: error.message,
    });
  }
});

// 获取历史交易记录
router.get('/history', (req, res) => {
  try {
    res.json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    res.json({
      success: false,
      message: '获取历史交易记录失败',
      error: error.message,
    });
  }
});

// 执行交易（买入/卖出）
router.post('/trade', (req, res) => {
  try {
    const { code, type, quantity, price } = req.body;

    if (!code || !type || !quantity || !price) {
      return res.json({
        success: false,
        message: '交易参数不完整',
      });
    }

    if (quantity <= 0 || price <= 0) {
      return res.json({
        success: false,
        message: '数量和价格必须为正数',
      });
    }

    // 这里应该添加实际的交易逻辑
    // 简化处理：更新持仓数据并添加到历史记录

    // 查找股票是否已在持仓中
    const stockIndex = positionData.findIndex((item) => item.code === code);

    if (type === 'buy') {
      // 买入逻辑
      if (stockIndex > -1) {
        // 已持仓，更新数量和成本价
        const oldStock = positionData[stockIndex];
        const totalCost =
          oldStock.costPrice * oldStock.amount + price * quantity;
        const totalAmount = oldStock.amount + quantity;

        positionData[stockIndex] = {
          ...oldStock,
          amount: totalAmount,
          costPrice: totalCost / totalAmount,
          // 其他字段会在前端根据最新行情更新
        };
      } else {
        // 未持仓，新增持仓记录
        // 这里需要从股票接口获取股票名称
        const stockNames = {
          600519: '贵州茅台',
          '000001': '平安银行',
          600036: '招商银行',
          '000858': '五 粮 液',
          601899: '紫金矿业',
        };

        positionData.push({
          code,
          name: stockNames[code] || '未知股票',
          amount: quantity,
          costPrice: price,
          currentPrice: price,
          profit: 0,
          profitRate: '0.00%',
        });
      }
    } else if (type === 'sell') {
      // 卖出逻辑
      if (stockIndex > -1) {
        const oldStock = positionData[stockIndex];

        if (oldStock.amount < quantity) {
          return res.json({
            success: false,
            message: '持仓数量不足',
          });
        } else if (oldStock.amount === quantity) {
          // 全部卖出，移除持仓记录
          positionData.splice(stockIndex, 1);
        } else {
          // 部分卖出，更新数量
          positionData[stockIndex] = {
            ...oldStock,
            amount: oldStock.amount - quantity,
          };
        }
      } else {
        return res.json({
          success: false,
          message: '该股票不在持仓中',
        });
      }
    } else {
      return res.json({
        success: false,
        message: '交易类型不正确',
      });
    }

    // 添加到历史记录
    const stockNames = {
      600519: '贵州茅台',
      '000001': '平安银行',
      600036: '招商银行',
      '000858': '五 粮 液',
      601899: '紫金矿业',
    };

    historyData.unshift({
      id: Date.now(),
      type,
      name: stockNames[code] || '未知股票',
      code,
      date: new Date()
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(',', ''),
      amount: type === 'buy' ? quantity : -quantity,
      price,
    });

    res.json({
      success: true,
      message: `${type === 'buy' ? '买入' : '卖出'}成功`,
      data: {
        position: positionData,
        history: historyData,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: '交易失败',
      error: error.message,
    });
  }
});

module.exports = router;
