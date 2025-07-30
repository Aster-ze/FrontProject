// 股票数据 - 用于详情展示
const stockData = {};
// 初始化页面
document.addEventListener('DOMContentLoaded', function () {
  // 从API获取股票数据
  fetchStockData();

  // 绑定事件
  bindEvents();
});

// 从API获取股票数据
async function fetchStockData() {
  try {
    const response = await fetch('http://localhost:3003/assets');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 限制只显示10条数据
    const limitedData = data.slice(0, 10);
    console.log("请求的列表总股票为",limitedData);

    // 存储所有股票数据的Promise
    const stockPromises = limitedData.map(async (item) => {
      // 获取历史数据
      const historyData = await fetchStockHistory(item.ticker_symbol);
      console.log("请求的股票历史数据为",historyData);
      // 计算涨幅
      const { percentChange, trend } = calculatePriceChange(
        parseFloat(item.current_price),
        historyData
      );

      return {
        id: item.id,
        name: item.name,
        ticker: item.ticker_symbol,
        price: parseFloat(item.current_price),
        change: percentChange.toFixed(2) + '%',
        trend: trend,
        assetType: item.asset_type,
        updatedAt: item.lastUpdated,
        currency: item.currency,
        // 生成模拟的K线数据
        // kline: generateMockKline(historyData),
      };
    });

    // 等待所有股票数据处理完成
    const processedStocks = await Promise.all(stockPromises);

    // 填充stockData对象
    processedStocks.forEach((stock) => {
      stockData[stock.ticker] = stock;
    });

    // 初始化股票表格
    initStockTable();

    // 如果有数据，默认选中第一个
    if (Object.keys(stockData).length > 0) {
      const firstStockId = Object.keys(stockData)[0];
      document.querySelector(`tr[data-id="${firstStockId}"]`).click();
    }
  } catch (error) {
    console.error('获取股票数据失败:', error);
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = `
                    <tr class="text-center">
                        <td colspan="3" class="px-3 py-8 text-danger">
                            <i class="fa fa-exclamation-circle mr-2"></i>数据加载失败，请稍后重试
                        </td>
                    </tr>
                `;
  }
}

// 获取股票历史数据
async function fetchStockHistory(assetId) {
  try {
    // 计算日期范围：过去30天到今天
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await fetch(
      `http://localhost:3003/assets/ticker/${assetId}/history?startDate=${startDate}&endDate=${endDate}&page=1&limit=30`
    );

    if (!response.ok) {
      throw new Error(`获取历史数据失败: ${response.status}`);
    }

    const data = await response.json();

    // 按日期排序，确保最新的在前面
    if (data.data && Array.isArray(data.data)) {
      return data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return [];
  } catch (error) {
    console.error('获取历史数据出错:', error);
    return [];
  }
}

// 计算价格变化和涨幅
function calculatePriceChange(currentPrice, historyData) {
  // 如果没有历史数据，默认持平
  if (!historyData || historyData.length === 0) {
    return { percentChange: 0, trend: 'flat' };
  }

  // 获取上一次的收盘价
  const lastClosePrice = parseFloat(historyData[1].close_price);

  // 计算价格变化百分比
  const percentChange =
    ((currentPrice - lastClosePrice) / lastClosePrice) * 100;

  // 确定趋势
  let trend;
  if (percentChange > 0) {
    trend = 'up';
  } else if (percentChange < 0) {
    trend = 'down';
  } else {
    trend = 'flat';
  }

  return { percentChange, trend };
}

// 初始化股票表格
function initStockTable() {
  const tableBody = document.getElementById('stockTableBody');
  tableBody.innerHTML = '';

  // 遍历股票数据，生成表格行
  Object.keys(stockData).forEach((stockId) => {
    const stock = stockData[stockId];
    const row = document.createElement('tr');
    row.dataset.id = stockId;
    row.dataset.name = stock.name;
    row.dataset.change = stock.trend;
    row.dataset.changeValue = stock.change;

    // 设置行样式
    row.className = 'hover:bg-gray-50 cursor-pointer transition-colors';

    // 涨幅颜色样式
    let changeClass = '';
    if (stock.trend === 'up') changeClass = 'text-success';
    else if (stock.trend === 'down') changeClass = 'text-danger';

    row.innerHTML = `
                    <td class="px-3 py-3 whitespace-nowrap">${stockId}</td>
                    <td class="px-3 py-3 whitespace-nowrap">${stock.name}</td>
                    <td class="px-3 py-3 whitespace-nowrap ${changeClass}">${stock.change}</td>
                `;

    tableBody.appendChild(row);

    // 添加点击事件
    row.addEventListener('click', function () {
      // 移除其他行的active类
      document.querySelectorAll('#stockTableBody tr').forEach((r) => {
        r.classList.remove('bg-primary/5', 'font-medium');
      });
      // 给当前行添加active类
      this.classList.add('bg-primary/5', 'font-medium');
      // 更新股票详情
      updateStockDetail(stockId);
      // 启用操作按钮
      enableActionButtons();
    });
  });
}

// 初始化图表
async function initChart(stockTicker) {
  try {
    // 这里替换为实际的API端点
    const response = await fetch(`http://localhost:3003/assets/ticker/${stockTicker}/history`);
    const chartJson = await response.json();
    chartData = chartJson.data;
    console.log("请求的历史数据为",chartJson);
    
  } catch (error) {
    console.error(`获取 ${stockTicker} 图表数据时出错:`, error);
  }
  // 按日期排序（从旧到新）
  const sortedData = chartData.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // 提取标签和数据
  labels = sortedData.map(item => {
      // 可以只显示日期部分
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  // 提取收盘价作为数据点
  dataValues = chartData.map(item => parseFloat(item.close_price));


  const ctx = document.getElementById('stockChart').getContext('2d');
  // 如果已有图表实例，先销毁
  if (window.stockChartInstance) {
      window.stockChartInstance.destroy();
  }

  window.stockChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels || [],
          datasets: [{
          data: dataValues || [],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
                display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                  label: function(context) {
                      return `价格: $${context.parsed.y.toFixed(2)}`;
                  },
                  title: function(context) {
                      return `日期: ${context[0].label}`;
                  }
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                  display: false
              },
              ticks: {
                  autoSkip: true,
                  maxTicksLimit: 8
              }
            },
            y: {
              display: true,
              grid: {
                display: false
            },
              ticks: {
                  callback: function(value) {
                      return '$' + value.toFixed(2);
                  }
              }
            }
          }
      }
  });
  // 生成时间标签（最近11个小时）
  // const labels = Array.from({ length: 11 }, (_, i) => {
  //   const hour = 9 + i;
  //   return `${hour}:${
  //     hour < 10 ? '00' : hour < 13 ? (hour === 11 ? '30' : '00') : '00'
  //   }`;
  // });

  // // 如果已有图表实例，先销毁
  // if (window.stockChartInstance) {
  //   window.stockChartInstance.destroy();
  // }

  // // 确定图表颜色
  // let borderColor, bgColor;
  // if (stock.trend === 'up') {
  //   borderColor = '#4caf50';
  //   bgColor = 'rgba(76, 175, 80, 0.1)';
  // } else if (stock.trend === 'down') {
  //   borderColor = '#f44336';
  //   bgColor = 'rgba(244, 67, 54, 0.1)';
  // } else {
  //   borderColor = '#9e9e9e';
  //   bgColor = 'rgba(158, 158, 158, 0.1)';
  // }

  // // 创建新图表
  // window.stockChartInstance = new Chart(ctx, {
  //   type: 'line',
  //   data: {
  //     labels: labels,
  //     datasets: [
  //       {
  //         label: '股价',
  //         data: stock.kline,
  //         borderColor: borderColor,
  //         backgroundColor: bgColor,
  //         borderWidth: 2,
  //         fill: true,
  //         tension: 0.3,
  //         pointRadius: 0,
  //         pointHoverRadius: 5,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: {
  //       legend: {
  //         display: false,
  //       },
  //       tooltip: {
  //         mode: 'index',
  //         intersect: false,
  //         callbacks: {
  //           label: function (context) {
  //             return `${stock.currency} ${context.parsed.y.toFixed(2)}`;
  //           },
  //         },
  //       },
  //     },
  //     scales: {
  //       x: {
  //         grid: {
  //           display: false,
  //         },
  //       },
  //       y: {
  //         grid: {
  //           borderDash: [2, 4],
  //           color: 'rgba(0, 0, 0, 0.05)',
  //         },
  //         ticks: {
  //           callback: function (value) {
  //             return stock.currency + ' ' + value.toFixed(2);
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
}

// 更新股票详情
function updateStockDetail(stockId) {
  const stock = stockData[stockId];

  // 格式化时间
  const updateTime = new Date(stock.updatedAt).toLocaleString();

  // 更新详情区域
  document.getElementById(
    'stockDetailTitle'
  ).textContent = `${stock.name}（${stockId}）`;
  document.getElementById('stockPrice').textContent = `${
    stock.currency
  } ${stock.price.toFixed(2)}`;

  const changeEl = document.getElementById('stockChange');
  changeEl.textContent = stock.change;
  changeEl.className = `change text-lg font-medium px-2 py-1 rounded`;

  // 设置涨幅颜色
  if (stock.trend === 'up') {
    changeEl.classList.add('bg-success/10', 'text-success');
  } else if (stock.trend === 'down') {
    changeEl.classList.add('bg-danger/10', 'text-danger');
  } else {
    changeEl.classList.add('bg-gray-100', 'text-gray-600');
  }

  // 更新详细数据
  // document.getElementById('updateTime').textContent = updateTime;
  // document.getElementById('detailPrice').textContent = `${
  //   stock.currency
  // } ${stock.price.toFixed(2)}`;
  // document.getElementById('detailChange').textContent = stock.change;
  // document.getElementById('detailType').textContent = stock.assetType;
  // document.getElementById('detailCurrency').textContent = stock.currency;
  // 更新图表
  initChart(stock.ticker);
}

// 启用操作按钮
function enableActionButtons() {
  document.getElementById('buyStock').removeAttribute('disabled');
  document.getElementById('sellStock').removeAttribute('disabled');
  document.getElementById('addFavorite').removeAttribute('disabled');
}

// 绑定事件
function bindEvents() {
  // 排序下拉框事件
  document.getElementById('sortSelect').addEventListener('change', function () {
    const sortType = this.value;
    const tableBody = document.getElementById('stockTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // 根据不同类型排序
    rows.sort((a, b) => {
      const idA = a.getAttribute('data-id');
      const idB = b.getAttribute('data-id');

      if (sortType === 'change') {
        // 按涨幅排序
        const changeA = parseFloat(a.getAttribute('data-change-value'));
        const changeB = parseFloat(b.getAttribute('data-change-value'));
        return changeB - changeA; // 降序
      } else if (sortType === 'name') {
        // 按名称排序
        const nameA = a.getAttribute('data-name');
        const nameB = b.getAttribute('data-name');
        return nameA.localeCompare(nameB);
      } else {
        // 按ID排序（默认）
        return idA.localeCompare(idB);
      }
    });

    // 重新添加排序后的行
    rows.forEach((row) => tableBody.appendChild(row));
  });

  // 搜索框事件
  document.getElementById('tableSearch').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#stockTableBody tr');

    rows.forEach((row) => {
      const id = row.getAttribute('data-id').toLowerCase();
      const name = row.getAttribute('data-name').toLowerCase();

      if (id.includes(searchValue) || name.includes(searchValue)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });

  // 顶部搜索框事件
  document
    .getElementById('stockSearch')
    .addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const searchValue = this.value.toLowerCase().trim();
        if (!searchValue) return;

        // 查找匹配的股票
        const matchedStockId = Object.keys(stockData).find((id) => {
          return (
            id.toLowerCase().includes(searchValue) ||
            stockData[id].name.toLowerCase().includes(searchValue)
          );
        });

        // 如果找到匹配的股票，更新详情
        if (matchedStockId) {
          // 触发对应行的点击事件
          document.querySelector(`tr[data-id="${matchedStockId}"]`).click();
        } else {
          alert('未找到匹配的股票');
        }

        // 清空搜索框
        this.value = '';
      }
    });

  // 交易按钮事件
  document.getElementById('buyStock').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      '#stockTableBody tr.bg-primary\\/5'
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(
      `准备买入 ${stock.name}（${stockId}），价格：${
        stock.currency
      } ${stock.price.toFixed(2)}`
    );
  });

  document.getElementById('sellStock').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      '#stockTableBody tr.bg-primary\\/5'
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(
      `准备卖出 ${stock.name}（${stockId}），价格：${
        stock.currency
      } ${stock.price.toFixed(2)}`
    );
  });

  // 加入自选按钮事件
  document.getElementById('addFavorite').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      '#stockTableBody tr.bg-primary\\/5'
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stockName = activeRow.getAttribute('data-name');

    // 这里可以实现加入自选的逻辑
    alert(`${stockName}（${stockId}）已加入自选`);
  });
}
