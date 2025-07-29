// 股票数据 - 用于详情展示
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
  600036: {
    name: '招商银行',
    price: 35.67,
    change: '-1.12%',
    trend: 'down',
    volume: '456.78万',
    pe: '9.3',
    turnover: '1.1%',
    inflow: '¥ 1.56亿',
    high52: '¥ 42.50',
    pb: '1.4',
    volumeHand: '45.68万手',
    outflow: '¥ 1.89亿',
    low52: '¥ 32.10',
    kline: [
      36.05, 36.0, 35.95, 35.9, 35.85, 35.8, 35.75, 35.7, 35.68, 35.67, 35.67,
    ],
  },
  '000858': {
    name: '五 粮 液',
    price: 168.9,
    change: '+3.45%',
    trend: 'up',
    volume: '345.67万',
    pe: '25.6',
    turnover: '1.8%',
    inflow: '¥ 5.67亿',
    high52: '¥ 190.30',
    pb: '8.7',
    volumeHand: '34.57万手',
    outflow: '¥ 4.23亿',
    low52: '¥ 145.20',
    kline: [
      163.2, 164.5, 165.8, 166.3, 167.1, 167.5, 168.0, 168.3, 168.6, 168.8,
      168.9,
    ],
  },
  600031: {
    name: '三一重工',
    price: 18.76,
    change: '-2.31%',
    trend: 'down',
    volume: '987.65万',
    pe: '12.4',
    turnover: '3.2%',
    inflow: '¥ 1.89亿',
    high52: '¥ 25.30',
    pb: '1.6',
    volumeHand: '98.77万手',
    outflow: '¥ 2.67亿',
    low52: '¥ 16.50',
    kline: [
      19.2, 19.1, 19.0, 18.95, 18.9, 18.85, 18.8, 18.78, 18.77, 18.76, 18.76,
    ],
  },
  601899: {
    name: '紫金矿业',
    price: 11.23,
    change: '+0.56%',
    trend: 'up',
    volume: '1234.56万',
    pe: '18.7',
    turnover: '4.5%',
    inflow: '¥ 1.23亿',
    high52: '¥ 15.60',
    pb: '2.3',
    volumeHand: '123.46万手',
    outflow: '¥ 1.15亿',
    low52: '¥ 9.80',
    kline: [
      11.17, 11.18, 11.19, 11.2, 11.21, 11.22, 11.22, 11.23, 11.23, 11.23,
      11.23,
    ],
  },
  300750: {
    name: '宁德时代',
    price: 550.25,
    change: '+2.15%',
    trend: 'up',
    volume: '567.89万',
    pe: '65.4',
    turnover: '2.5%',
    inflow: '¥ 12.34亿',
    high52: '¥ 600.50',
    pb: '15.6',
    volumeHand: '56.79万手',
    outflow: '¥ 10.87亿',
    low52: '¥ 450.30',
    kline: [
      540.1, 542.3, 545.6, 547.8, 549.2, 550.1, 550.3, 550.2, 550.25, 550.25,
      550.25,
    ],
  },
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function () {
  // 初始化股票表格
  initStockTable();

  // 初始化图表
  initChart('600519');

  // 绑定事件
  bindEvents();
});

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

    row.innerHTML = `
      <td>${stockId}</td>
      <td>${stock.name}</td>
      <td><span class="stock-change ${stock.trend}">${stock.change}</span></td>
    `;

    tableBody.appendChild(row);

    // 添加点击事件
    row.addEventListener('click', function () {
      // 移除其他行的active类
      document.querySelectorAll('#stockTableBody tr').forEach((r) => {
        r.classList.remove('active');
      });
      // 给当前行添加active类
      this.classList.add('active');
      // 更新股票详情
      updateStockDetail(stockId);
    });
  });
}

// 初始化图表
function initChart(stockId) {
  const stock = stockData[stockId];
  const ctx = document.getElementById('stockChart').getContext('2d');

  // 生成时间标签（最近11个小时）
  const labels = Array.from({ length: 11 }, (_, i) => {
    const hour = 9 + i;
    return `${hour}:${
      hour < 10 ? '00' : hour < 13 ? (hour === 11 ? '30' : '00') : '00'
    }`;
  });

  // 如果已有图表实例，先销毁
  if (window.stockChartInstance) {
    window.stockChartInstance.destroy();
  }

  // 创建新图表
  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '股价',
          data: stock.kline,
          borderColor: stock.trend === 'up' ? '#4caf50' : '#f44336',
          backgroundColor:
            stock.trend === 'up'
              ? 'rgba(76, 175, 80, 0.1)'
              : 'rgba(244, 67, 54, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            borderDash: [2, 4],
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            callback: function (value) {
              return '¥' + value;
            },
          },
        },
      },
    },
  });
}

// 更新股票详情
function updateStockDetail(stockId) {
  const stock = stockData[stockId];

  // 更新详情区域
  document.getElementById(
    'stockDetailTitle'
  ).textContent = `${stock.name}（${stockId}）`;
  document.getElementById('stockPrice').textContent = `¥ ${stock.price}`;

  const changeEl = document.getElementById('stockChange');
  changeEl.textContent = stock.change;
  changeEl.className = `change ${stock.trend}`;

  document.getElementById(
    'stockVolume'
  ).textContent = `成交量：${stock.volume}`;
  document.getElementById('stockPe').textContent = stock.pe;
  document.getElementById('stockTurnover').textContent = stock.turnover;
  document.getElementById('stockInflow').textContent = stock.inflow;
  document.getElementById('stockHigh52').textContent = stock.high52;
  document.getElementById('stockPb').textContent = stock.pb;
  document.getElementById('stockVolumeHand').textContent = stock.volumeHand;
  document.getElementById('stockOutflow').textContent = stock.outflow;
  document.getElementById('stockLow52').textContent = stock.low52;

  // 更新图表
  initChart(stockId);
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
        }

        // 清空搜索框
        this.value = '';
      }
    });

  // 交易按钮事件
  document.getElementById('buyStock').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector('#stockTableBody tr.active');
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(`准备买入 ${stock.name}（${stockId}），价格：¥${stock.price}`);
  });

  document.getElementById('sellStock').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector('#stockTableBody tr.active');
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(`准备卖出 ${stock.name}（${stockId}），价格：¥${stock.price}`);
  });

  // 加入自选按钮事件
  document.getElementById('addFavorite').addEventListener('click', function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector('#stockTableBody tr.active');
    if (!activeRow) return;

    const stockId = activeRow.getAttribute('data-id');
    const stockName = activeRow.getAttribute('data-name');

    // 这里可以实现加入自选的逻辑
    alert(`${stockName}（${stockId}）已加入自选`);
  });
}
