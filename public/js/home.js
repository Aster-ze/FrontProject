// 全局变量
let stockData = {};
let accountId = 17; // 假设账户ID为17
let username="5force"; // 假设用户名为5force
let currentTransaction = null; // 添加当前交易信息变量
let currentView = "all"; // all, profit, loss
let sortState = {}; // 存储各列的排序状态

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
    console.log("请求的列表总股票为", limitedData);

    // 存储所有股票数据的Promise
    const stockPromises = limitedData.map(async (item) => {
      // 获取历史数据
      const historyData = await fetchStockHistory(item.ticker_symbol);
      console.log("请求的股票历史数据为", historyData);
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
function initStockTable(filter = "all") {
  const tableBody = document.getElementById('stockTableBody');
  tableBody.innerHTML = '';

  // 根据筛选条件过滤数据
  let filteredData = Object.keys(stockData).map((key) => stockData[key]);

  if (filter === "profit") {
    filteredData = filteredData.filter((stock) => stock.trend === "up");
  } else if (filter === "loss") {
    filteredData = filteredData.filter((stock) => stock.trend === "down");
  }

  // 应用排序
  applySorting(filteredData);

  // 遍历股票数据，生成表格行
  filteredData.forEach((stock) => {
    const row = document.createElement('tr');
    row.dataset.id = stock.ticker;
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
                    <td class="px-3 py-3 whitespace-nowrap">${stock.ticker}</td>
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
      updateStockDetail(stock.ticker);
      // 启用操作按钮
      enableActionButtons();
    });
  });

  // 如果有数据，默认选中第一个
  if (filteredData.length > 0) {
    const firstStockId = filteredData[0].ticker;
    document.querySelector(`tr[data-id="${firstStockId}"]`).click();
  }
}

// 应用排序到数据
function applySorting(data) {
  // 获取所有排序状态，按优先级排序
  const sortKeys = Object.keys(sortState)
    .filter((key) => sortState[key] !== 0)
    .sort((a, b) => Math.abs(sortState[b]) - Math.abs(sortState[a])); // 按优先级排序

  // 依次应用每个排序规则
  sortKeys.forEach((key) => {
    const direction = sortState[key] > 0 ? 1 : -1; // 确保方向正确
    data.sort((a, b) => {
      let valA, valB;

      switch (key) {
        case "id":
          valA = a.ticker;
          valB = b.ticker;
          return direction * valA.localeCompare(valB);
        case "name":
          valA = a.name;
          valB = b.name;
          return direction * valA.localeCompare(valB);
        case "change":
          valA = parseFloat(a.change);
          valB = parseFloat(b.change);
          return direction * (valA - valB);
        default:
          return 0;
      }
    });
  });
}

// 初始化图表
async function initChart(stockId) {
  let chartData = [];
  try {
    // 这里替换为实际的API端点
    const response = await fetch(`http://localhost:3003/assets/ticker/${stockId}/history`);
    const chartJson = await response.json();
    chartData = chartJson.data;
    console.log("请求的历史数据为", chartJson);

  } catch (error) {
    console.error(`获取 ${stockId} 图表数据时出错:`, error);
  }
  // 按日期排序（从旧到新）
  const sortedData = chartData.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // 提取标签和数据
  const labels = sortedData.map(item => {
    // 可以只显示日期部分
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  // 提取收盘价作为数据点
  const dataValues = chartData.map(item => parseFloat(item.close_price));


  const ctx = document.getElementById('stockChart').getContext('2d');
  // 如果已有图表实例，先销毁
  if (window.stockChartInstance) {
    window.stockChartInstance.destroy();
  }

  // 确定图表颜色
  let borderColor, bgColor;
  const stock = stockData[stockId];
  if (stock.trend === "up") {
    borderColor = "#4caf50";
    bgColor = "rgba(76, 175, 80, 0.1)";
  } else if (stock.trend === "down") {
    borderColor = "#f44336";
    bgColor = "rgba(244, 67, 54, 0.1)";
  } else {
    borderColor = "#9e9e9e";
    bgColor = "rgba(158, 158, 158, 0.1)";
  }

  window.stockChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels || [],
      datasets: [{
        data: dataValues || [],
        borderColor: borderColor,
        backgroundColor: bgColor,
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
            label: function (context) {
              return `价格: $${context.parsed.y.toFixed(2)}`;
            },
            title: function (context) {
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
            callback: function (value) {
              return '$' + value.toFixed(2);
            }
          }
        }
      }
    }
  });
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
  
  // 根据当前语言设置货币符号
  const currencySymbol = window.languageManager && window.languageManager.getCurrentLanguage() === 'en' ? '$' : '¥';
  document.getElementById('stockPrice').textContent = `${
    currencySymbol
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

  // 更新图表
  initChart(stockId);
  
  // 更新金额显示
  updateAmountDisplays(stock);
}

// 更新金额显示
function updateAmountDisplays(stock) {
  // 获取当前语言
  const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
  
  // 更新资金流入显示
  const inflowElement = document.getElementById('stockInflow');
  if (inflowElement) {
    if (currentLang === 'en') {
      inflowElement.textContent = '$567.00M';
    } else {
      inflowElement.textContent = '¥ 5.67亿';
    }
  }
  
  // 更新资金流出显示
  const outflowElement = document.getElementById('stockOutflow');
  if (outflowElement) {
    if (currentLang === 'en') {
      outflowElement.textContent = '$321.00M';
    } else {
      outflowElement.textContent = '¥ 3.21亿';
    }
  }
  
  // 更新成交量显示
  const volumeElement = document.getElementById('stockVolume');
  if (volumeElement) {
    if (currentLang === 'en') {
      volumeElement.textContent = 'Volume: 123.45M';
    } else {
      volumeElement.textContent = '成交量：123.45万';
    }
  }
  
  // 更新52周最高显示
  const high52Element = document.getElementById('stockHigh52');
  if (high52Element) {
    const currencySymbol = currentLang === 'en' ? '$' : '¥';
    if (currentLang === 'en') {
      high52Element.textContent = '$2100.00';
    } else {
      high52Element.textContent = '¥ 2100.00';
    }
  }
  
  // 更新52周最低显示
  const low52Element = document.getElementById('stockLow52');
  if (low52Element) {
    const currencySymbol = currentLang === 'en' ? '$' : '¥';
    if (currentLang === 'en') {
      low52Element.textContent = '$1500.00';
    } else {
      low52Element.textContent = '¥ 1500.00';
    }
  }
  
  // 更新成交量(手)显示
  const volumeHandElement = document.getElementById('stockVolumeHand');
  if (volumeHandElement) {
    if (currentLang === 'en') {
      volumeHandElement.textContent = '23.00K lots';
    } else {
      volumeHandElement.textContent = '2.3万手';
    }
  }
}

// 更新搜索框占位符
function updateSearchPlaceholders() {
  const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
  
  // 更新顶部搜索框
  const stockSearch = document.getElementById('stockSearch');
  if (stockSearch) {
    if (currentLang === 'en') {
      stockSearch.placeholder = 'Search stocks...';
    } else {
      stockSearch.placeholder = '搜索股票...';
    }
  }
  
  // 更新表格搜索框
  const tableSearch = document.getElementById('tableSearch');
  if (tableSearch) {
    if (currentLang === 'en') {
      tableSearch.placeholder = 'Search stocks';
    } else {
      tableSearch.placeholder = '搜索股票';
    }
  }
}

// 启用操作按钮
function enableActionButtons() {
  document.getElementById('buyStock').removeAttribute('disabled');
}

// 绑定事件
function bindEvents() {
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

    // 设置当前交易信息
    currentTransaction = {
      type: "buy",
      code: stock.ticker,
      name: stock.name,
      price: stock.price,
      id: stock.id
    };

    // 更新交易弹窗内容
    const transactionTitle = document.getElementById("transactionTitle");
    if (transactionTitle) {
      transactionTitle.textContent = "买入确认";
    }

    const transactionStock = document.getElementById("transactionStock");
    if (transactionStock) {
      transactionStock.textContent = stock.name;
    }

    const transactionCode = document.getElementById("transactionCode");
    if (transactionCode) {
      transactionCode.textContent = stock.ticker;
    }

    const transactionPrice = document.getElementById("transactionPrice");
    if (transactionPrice) {
      const currencySymbol = window.languageManager && window.languageManager.getCurrentLanguage() === 'en' ? '$' : '¥';
      transactionPrice.textContent = currencySymbol + stock.price.toFixed(2);
    }

    const transactionQuantity = document.getElementById("transactionQuantity");
    if (transactionQuantity) {
      transactionQuantity.value = 100;
    }

    const transactionAmount = document.getElementById("transactionAmount");
    if (transactionAmount) {
      const currencySymbol = window.languageManager && window.languageManager.getCurrentLanguage() === 'en' ? '$' : '¥';
      transactionAmount.textContent = currencySymbol + (stock.price * 100).toFixed(2);
    }

    // 显示交易弹窗
    const transactionModal = document.getElementById("transactionModal");
    if (transactionModal) {
      transactionModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });

  // 视图切换功能
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 更新激活状态
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // 获取视图类型并更新表格
      currentView = this.dataset.view;
      initStockTable(currentView);
    });
  });

  // 表头排序功能
  const sortableHeaders = document.querySelectorAll(".sortable");
  sortableHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const sortKey = this.dataset.sort;

      // 切换排序状态: 0(无)->1(升序)->-1(降序)->0(无)
      if (!sortState[sortKey]) {
        sortState[sortKey] = 1;
      } else if (sortState[sortKey] === 1) {
        sortState[sortKey] = -1;
      } else {
        sortState[sortKey] = 0;
      }

      // 更新表头UI
      updateSortIndicators();

      // 重新渲染表格
      initStockTable(currentView);
    });
  });

  // 更新排序指示器UI
  function updateSortIndicators() {
    // 清除所有激活状态
    document.querySelectorAll(".sort-indicator").forEach((indicator) => {
      indicator.classList.remove("active", "asc", "desc");
    });

    // 为每个有排序状态的列更新指示器
    Object.keys(sortState).forEach((key) => {
      if (sortState[key] !== 0) {
        const header = document.querySelector(`.sortable[data-sort="${key}"]`);
        if (header) {
          const indicator = header.querySelector(".sort-indicator");
          indicator.classList.add("active");
          if (sortState[key] > 0) {
            indicator.classList.add("asc");
          } else {
            indicator.classList.add("desc");
          }
        }
      }
    });
  }

  // 绑定交易弹窗相关事件
  bindTransactionEvents();
  
  // 监听语言切换完成事件
  window.addEventListener('languageChangedComplete', function(e) {
    // 更新当前选中股票的详情显示
    const activeRow = document.querySelector('#stockTableBody tr.bg-primary\\/5');
    if (activeRow) {
      const stockId = activeRow.getAttribute('data-id');
      if (stockId && stockData[stockId]) {
        updateStockDetail(stockId);
      }
    }
    
    // 更新搜索框占位符
    updateSearchPlaceholders();
  });
}

// 绑定交易弹窗相关事件
function bindTransactionEvents() {
  const transactionModal = document.getElementById("transactionModal");
  const closeTransactionModal = document.getElementById("closeTransactionModal");
  const cancelTransaction = document.getElementById("cancelTransaction");
  const confirmTransaction = document.getElementById("confirmTransaction");
  const transactionQuantity = document.getElementById("transactionQuantity");
  const transactionAmount = document.getElementById("transactionAmount");

  if (transactionModal) {
    function closeTransaction() {
      transactionModal.classList.remove("active");
      document.body.style.overflow = "";
      currentTransaction = null;
    }

    if (closeTransactionModal) {
      closeTransactionModal.addEventListener("click", closeTransaction);
    }

    if (cancelTransaction) {
      cancelTransaction.addEventListener("click", closeTransaction);
    }

    transactionModal.addEventListener("click", function(e) {
      if (e.target === transactionModal) closeTransaction();
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && transactionModal.classList.contains("active")) {
        closeTransaction();
      }
    });

    // 交易数量输入事件
    if (transactionQuantity) {
      transactionQuantity.addEventListener("input", function() {
        if (currentTransaction) {
          const amount = currentTransaction.price * parseInt(this.value || 0);
          if (transactionAmount) {
            const currencySymbol = window.languageManager && window.languageManager.getCurrentLanguage() === 'en' ? '$' : '¥';
            transactionAmount.textContent = currencySymbol + amount.toFixed(2);
          }
        }
      });
    }

    // 确认交易
    if (confirmTransaction) {
      confirmTransaction.addEventListener("click", async function() {
        if (currentTransaction) {
          const quantity = parseInt(transactionQuantity.value || 0);
          if (quantity <= 0) {
            alert("请输入有效的交易数量");
            return;
          }
          
          if (currentTransaction.type === "buy") {
            try {
              const buyUrl = 'http://localhost:3003/holdings/add-to-portfolio';
              const today = new Date();
              const transactionDate = today.toISOString().split('T')[0];
              const requestBody = {
                "username": username,
                "ticker": currentTransaction.code,
                "accountId": accountId,
                "quantity": quantity,
                "price": currentTransaction.price,
                "transactionDate": today,
                "updateMarketPrice": false,
                "description": "Initial purchase"
              };
              const response = await fetch(buyUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                throw new Error(`买入请求失败，状态码: ${response.status}`);
              }

              alert("已买入 " + 
                    currentTransaction.name + "（" + currentTransaction.code + "）" + 
                    quantity + "股");
            } catch (error) {
              console.error("买入请求出错:", error);
              alert(`买入失败: ${error.message}`);
            }
          }
          closeTransaction();
        }
      });
    }
  }
}

// 页面加载完成后执行
window.addEventListener('load', async () => {
  await fetchStockData();
  bindEvents();
  
  // 初始化搜索框占位符
  updateSearchPlaceholders();
});