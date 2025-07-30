let currentView = "all"; // all, profit, loss
let sortState = {}; // 存储各列的排序状态

// 股票数据 - 用于详情展示
const stockData = {};

// 初始化页面
document.addEventListener("DOMContentLoaded", function () {
  // 从API获取股票数据
  fetchStockData();

  // 绑定事件
  bindEvents();
});

// 从API获取股票数据
async function fetchStockData() {
  try {
    const response = await fetch("http://localhost:3003/assets");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 限制只显示10条数据
    const limitedData = data.slice(0, 10);

    // 存储所有股票数据的Promise
    const stockPromises = limitedData.map(async (item) => {
      // 获取历史数据
      const historyData = await fetchStockHistory(item.ticker_symbol);

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
        change: percentChange.toFixed(2) + "%",
        trend: trend,
        assetType: item.asset_type,
        updatedAt: item.lastUpdated,
        currency: item.currency,
        // 生成模拟的K线数据
        kline: generateMockKline(parseFloat(item.current_price)),
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
    console.error("获取股票数据失败:", error);
    const tableBody = document.getElementById("stockTableBody");
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
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

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
    console.error("获取历史数据出错:", error);
    return [];
  }
}

// 计算价格变化和涨幅
function calculatePriceChange(currentPrice, historyData) {
  // 如果没有历史数据，默认持平
  if (!historyData || historyData.length === 0) {
    return { percentChange: 0, trend: "flat" };
  }

  // 获取上一次的收盘价
  const lastClosePrice = parseFloat(historyData[1].close_price);

  // 计算价格变化百分比
  const percentChange =
    ((currentPrice - lastClosePrice) / lastClosePrice) * 100;

  // 确定趋势
  let trend;
  if (percentChange > 0) {
    trend = "up";
  } else if (percentChange < 0) {
    trend = "down";
  } else {
    trend = "flat";
  }

  return { percentChange, trend };
}

// 生成模拟的K线数据
function generateMockKline(basePrice) {
  const kline = [];
  let price = basePrice * (0.98 + Math.random() * 0.04); // 随机起始价格

  // 生成11个时间点的数据
  for (let i = 0; i < 11; i++) {
    // 小幅度波动
    const change = (Math.random() - 0.45) * 0.01 * price;
    price += change;
    kline.push(price.toFixed(2) * 1);
  }

  return kline;
}

// 初始化股票表格
function initStockTable(filter = "all") {
  const tableBody = document.getElementById("stockTableBody");
  tableBody.innerHTML = "";

  // 根据筛选条件过滤数据
  let filteredData = Object.keys(stockData).map(key => stockData[key]);
  
  if (filter === "profit") {
    filteredData = filteredData.filter(stock => stock.trend === "up");
  } else if (filter === "loss") {
    filteredData = filteredData.filter(stock => stock.trend === "down");
  }

  // 应用排序
  applySorting(filteredData);

  // 遍历股票数据，生成表格行
  filteredData.forEach((stock) => {
    const row = document.createElement("tr");
    row.dataset.id = stock.ticker;
    row.dataset.name = stock.name;
    row.dataset.change = stock.trend;
    row.dataset.changeValue = stock.change;

    // 设置行样式
    row.className = "hover:bg-gray-50 cursor-pointer transition-colors";

    // 涨幅颜色样式
    let changeClass = "";
    if (stock.trend === "up") changeClass = "text-success";
    else if (stock.trend === "down") changeClass = "text-danger";

    row.innerHTML = `
                    <td class="px-3 py-3 whitespace-nowrap">${stock.ticker}</td>
                    <td class="px-3 py-3 whitespace-nowrap">${stock.name}</td>
                    <td class="px-3 py-3 whitespace-nowrap ${changeClass}">${stock.change}</td>
                `;

    tableBody.appendChild(row);

    // 添加点击事件
    row.addEventListener("click", function () {
      // 移除其他行的active类
      document.querySelectorAll("#stockTableBody tr").forEach((r) => {
        r.classList.remove("bg-primary/5", "font-medium");
      });
      // 给当前行添加active类
      this.classList.add("bg-primary/5", "font-medium");
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
function initChart(stockId) {
  const stock = stockData[stockId];
  const ctx = document.getElementById("stockChart").getContext("2d");

  // 生成时间标签（最近11个小时）
  const labels = Array.from({ length: 11 }, (_, i) => {
    const hour = 9 + i;
    return `${hour}:${
      hour < 10 ? "00" : hour < 13 ? (hour === 11 ? "30" : "00") : "00"
    }`;
  });

  // 如果已有图表实例，先销毁
  if (window.stockChartInstance) {
    window.stockChartInstance.destroy();
  }

  // 确定图表颜色
  let borderColor, bgColor;
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

  // 创建新图表
  window.stockChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "股价",
          data: stock.kline,
          borderColor: borderColor,
          backgroundColor: bgColor,
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
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${stock.currency} ${context.parsed.y.toFixed(2)}`;
            },
          },
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
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            callback: function (value) {
              return stock.currency + " " + value.toFixed(2);
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

  // 格式化时间
  const updateTime = new Date(stock.updatedAt).toLocaleString();

  // 更新详情区域 - 添加元素存在性检查
  const detailTitleEl = document.getElementById("stockDetailTitle");
  if (detailTitleEl) {
    detailTitleEl.textContent = `${stock.name}（${stockId}）`;
  }
  
  const stockPriceEl = document.getElementById("stockPrice");
  if (stockPriceEl) {
    stockPriceEl.textContent = `${stock.currency} ${stock.price.toFixed(2)}`;
  }

  const changeEl = document.getElementById("stockChange");
  if (changeEl) {
    changeEl.textContent = stock.change;
    changeEl.className = `change text-lg font-medium px-2 py-1 rounded`;

    // 设置涨幅颜色
    if (stock.trend === "up") {
      changeEl.classList.add("bg-success/10", "text-success");
    } else if (stock.trend === "down") {
      changeEl.classList.add("bg-danger/10", "text-danger");
    } else {
      changeEl.classList.add("bg-gray-100", "text-gray-600");
    }
  }

  // 更新详细数据 - 为每个元素添加存在性检查
  const updateTimeEl = document.getElementById("updateTime");
  if (updateTimeEl) {
    updateTimeEl.textContent = updateTime;
  }
  
  const detailPriceEl = document.getElementById("detailPrice");
  if (detailPriceEl) {
    detailPriceEl.textContent = `${stock.currency} ${stock.price.toFixed(2)}`;
  }
  
  const detailChangeEl = document.getElementById("detailChange");
  if (detailChangeEl) {
    detailChangeEl.textContent = stock.change;
  }
  
  const detailTypeEl = document.getElementById("detailType");
  if (detailTypeEl) {
    detailTypeEl.textContent = stock.assetType;
  }
  
  const detailCurrencyEl = document.getElementById("detailCurrency");
  if (detailCurrencyEl) {
    detailCurrencyEl.textContent = stock.currency;
  }

  // 更新图表
  initChart(stockId);
}

// 启用操作按钮
function enableActionButtons() {
  document.getElementById("buyStock").removeAttribute("disabled");
  document.getElementById("sellStock").removeAttribute("disabled");
  document.getElementById("addFavorite").removeAttribute("disabled");
}

// 绑定事件
function bindEvents() {
  // 搜索框事件
  document.getElementById("tableSearch").addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#stockTableBody tr");

    rows.forEach((row) => {
      const id = row.getAttribute("data-id").toLowerCase();
      const name = row.getAttribute("data-name").toLowerCase();

      if (id.includes(searchValue) || name.includes(searchValue)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // 顶部搜索框事件
  document
    .getElementById("stockSearch")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
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
          alert("未找到匹配的股票");
        }

        // 清空搜索框
        this.value = "";
      }
    });

  // 交易按钮事件
  document.getElementById("buyStock").addEventListener("click", function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      "#stockTableBody tr.bg-primary\\/5"
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute("data-id");
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(
      `准备买入 ${stock.name}（${stockId}），价格：${
        stock.currency
      } ${stock.price.toFixed(2)}`
    );
  });

  document.getElementById("sellStock").addEventListener("click", function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      "#stockTableBody tr.bg-primary\\/5"
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute("data-id");
    const stock = stockData[stockId];

    // 这里可以跳转到交易页面或显示交易弹窗
    alert(
      `准备卖出 ${stock.name}（${stockId}），价格：${
        stock.currency
      } ${stock.price.toFixed(2)}`
    );
  });

  // 加入自选按钮事件
  document.getElementById("addFavorite").addEventListener("click", function () {
    // 获取当前选中的股票ID
    const activeRow = document.querySelector(
      "#stockTableBody tr.bg-primary\\/5"
    );
    if (!activeRow) return;

    const stockId = activeRow.getAttribute("data-id");
    const stockName = activeRow.getAttribute("data-name");

    // 这里可以实现加入自选的逻辑
    alert(`${stockName}（${stockId}）已加入自选`);
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
}
