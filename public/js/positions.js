let accountId = 17; // 假设账户ID为17
let username="5force"; // 假设用户名为5force
// 全局持仓数据变量
let positionData = [];

// 历史交易记录
let historyData = [];

// 当前交易信息
let currentTransaction = null;
let currentView = "all"; // all, profit, loss
let sortState = {}; // 存储各列的排序状态

// 从后端获取持仓数据并转换格式
async function fetchPositionData() {
  try {
    console.log("开始请求持仓数据接口...");
    const response = await fetch('http://localhost:3003/holdings');

    if (!response.ok) {
      throw new Error(`持仓接口请求失败，状态码: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("后端返回持仓原始数据:", rawData);

    // 数据格式转换
    const formattedData = rawData.map((item, index) => {
      const asset = item.asset || {};
      const quantity = parseInt(item.quantity) || 0;
      const costBasis = parseFloat(item.average_cost_basis) || 0;
      const currentPrice = parseFloat(asset.current_price) || 0;

      return {
        id: item.id, // 添加 id 字段
        code: asset.ticker_symbol || `未知代码${index}`,
        name: asset.name || `未知名称${index}`,
        amount: quantity,
        costPrice: costBasis,
        currentPrice: currentPrice,
        profit: (currentPrice * quantity) - (costBasis * quantity),
        profitRate: (((currentPrice - costBasis) / costBasis) * 100).toFixed(2) + '%'
      };
    });

    console.log("转换后持仓数据:", formattedData);
    return formattedData;

  } catch (error) {
    console.error("获取持仓数据出错:", error);
    alert(`加载持仓失败: ${error.message}`);
    return [];
  }
}

// 从后端获取历史交易数据
async function fetchHistoryData() {
  try {
    console.log("开始请求历史交易数据接口...");
    const response = await fetch('http://localhost:3003/transactions');

    if (!response.ok) {
      throw new Error(`历史接口请求失败，状态码: ${response.status}`);
    }

    const rawHistoryData = await response.json();
    console.log("后端返回历史交易原始数据:", rawHistoryData);

    // 数据格式转换（过滤存款记录，只保留买卖交易）
    const formattedHistoryData = rawHistoryData
     .filter(item => item.transaction_type === "buy" || item.transaction_type === "sell")
     .map(item => {
        const asset = item.asset || {};
        const transactionDate = item.transaction_date || new Date().toISOString();

        return {
          type: item.transaction_type,
          name: asset.name || "未知股票",
          code: asset.ticker_symbol || "未知代码",
          // 格式化日期为本地时间
          date: new Date(transactionDate).toLocaleString(),
          amount: item.transaction_type === "buy" 
            ? parseInt(item.quantity) 
            : -parseInt(item.quantity)
        };
      })
      // 按交易时间倒序排列（最新的在前）
     .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("转换后历史交易数据:", formattedHistoryData);
    return formattedHistoryData;

  } catch (error) {
    console.error("获取历史交易数据出错:", error);
    alert(`加载历史交易失败: ${error.message}`);
    return [];
  }
}

// 计算总资产
function calculateTotalAssets() {
  return positionData.reduce((total, stock) => {
    return total + stock.currentPrice * stock.amount;
  }, 0);
}

// 计算当日盈亏
function calculateDailyProfit() {
  return positionData.reduce((total, stock) => {
    return total + stock.profit;
  }, 0);
}

// 计算持仓股票数
function calculateStockCount() {
  return positionData.length;
}

// 获取上证指数数据（核心新增函数）
async function fetchShanghaiIndex() {
  try {
    console.log("开始请求上证指数数据...");
    // 1. 模拟接口返回（实际项目中替换为真实API）
    // 示例真实API参考：新浪财经、东方财富等免费接口
    const mockData = {
      index: 3286.54 + (Math.random() * 2 - 1) * 5, // 模拟±5点波动
      change: (Math.random() * 2 - 1) * 5, // 涨跌点数
      percent: (Math.random() * 2 - 1) * 0.15 // 涨跌幅百分比（±0.15%）
    };
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockData;
  } catch (error) {
    console.error("获取上证指数失败:", error);
    // 失败时返回默认值
    return { index: 3286.54, change: -0.45, percent: -0.0137 };
  }
}

// 更新卡片数据
// 更新所有统计卡片（总资产、盈亏、持仓数、上证指数）
async function updateStatisticsPanel() {
  // 1. 计算持仓相关数据（总资产、盈亏、股票数）
  const totalAssets = positionData.reduce((sum, stock) => {
    return sum + (stock.currentPrice * stock.amount);
  }, 0);
  
  const totalProfit = positionData.reduce((sum, stock) => {
    return sum + stock.profit;
  }, 0);
  
  const stockCount = positionData.filter(stock => stock.amount > 0).length;

  // 2. 获取上证指数数据（调用新增的函数）
  const shIndexData = await fetchShanghaiIndex();

  // 3. 更新DOM元素（对应HTML中的4个卡片）
  // 总资产卡片
  const totalAssetsEl = document.querySelector('.dashboard-cards .card:nth-child(1) .value');
  if (totalAssetsEl) {
    totalAssetsEl.textContent = `¥ ${totalAssets.toLocaleString('zh-CN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

const profitEl = document.querySelector('.dashboard-cards .card:nth-child(2) .value');
const profitRateEl = document.querySelector('.dashboard-cards .card:nth-child(2) .change');
if (profitEl && profitRateEl) {
  const totalCost = totalAssets - totalProfit; 
  const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  
  // 清除之前的箭头方向类
  profitRateEl.classList.remove('up', 'down', 'flat');
  
  // 根据盈利情况设置箭头方向和样式
  if (profitRate > 0) {
    profitRateEl.classList.add('up'); // 盈利：向上箭头
    profitRateEl.style.color = '#4caf50';
  } else if (profitRate < 0) {
    profitRateEl.classList.add('down'); // 亏损：向下箭头
    profitRateEl.style.color = '#f44336';
  } else {
    profitRateEl.classList.add('flat'); // 持平：水平箭头（可选）
    profitRateEl.style.color = '#666666';
  }
  
  // 更新文本内容
  profitEl.textContent = `¥ ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}`;
  profitEl.style.color = profitRateEl.style.color; // 与百分比颜色保持一致
  profitRateEl.textContent = `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`;
}

  // 持仓股票数卡片
  const stockCountEl = document.querySelector('.dashboard-cards .card:nth-child(3) .value');
  if (stockCountEl) {
    stockCountEl.textContent = `${stockCount} 只`;
  }

  // 上证指数卡片（核心修改）
  const shIndexEl = document.querySelector('.dashboard-cards .card:nth-child(4) .value');
  const shChangeEl = document.querySelector('.dashboard-cards .card:nth-child(4) .change');
  if (shIndexEl && shChangeEl) {
    shIndexEl.textContent = shIndexData.index.toFixed(2); // 指数当前值
    shChangeEl.textContent = `${shIndexData.change >= 0 ? '+' : ''}${shIndexData.change.toFixed(2)} (${shIndexData.percent.toFixed(2)}%)`;
    shChangeEl.style.color = shIndexData.change >= 0 ? '#4caf50' : '#f44336'; // 上涨红、下跌绿
  }
}

// 初始化页面
async function initApp() {
  positionData = await fetchPositionData();
  historyData = await fetchHistoryData();
  
  initPositionTable();
  initHistoryList();
  bindEvents();
  await updateStatisticsPanel(); // 新增：等待指数数据加载后更新
}

// 初始化持仓表格
function initPositionTable(filter = "all") {
  const tableBody = document.getElementById("portfolioTableBody");
  if (!tableBody) {
    console.error("未找到持仓表格容器（ID: portfolioTableBody）");
    return;
  }

  tableBody.innerHTML = "";
  let filteredData = [...positionData];

  // 筛选逻辑
  if (filter === "profit") filteredData = filteredData.filter(stock => stock.profit >= 0);
  else if (filter === "loss") filteredData = filteredData.filter(stock => stock.profit < 0);

  if (filteredData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">暂无符合条件的数据</td></tr>';
    return;
  }

  applySorting(filteredData);

  // 渲染表格行
  filteredData.forEach(stock => {
    const row = document.createElement("tr");
    const isProfit = stock.profit >= 0;
    row.innerHTML = `
      <td>${stock.code}</td>
      <td>${stock.name}</td>
      <td>${stock.amount}</td>
      <td>¥${stock.costPrice.toFixed(2)}</td>
      <td>¥${stock.currentPrice.toFixed(2)}</td>
      <td>
        <div class="stock-profit ${isProfit ? "up" : "down"}">
          <span>¥${isProfit ? "+" : ""}${stock.profit.toFixed(2)}</span> 
          (${stock.profitRate})
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <input type="number" class="quantity-input" value="100" min="100" step="100">
          <button class="buy-button" data-code="${stock.code}">买入</button>
          <button class="sell-button" data-code="${stock.code}" data-id="${stock.id}">卖出</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 应用排序
function applySorting(data) {
  const sortKeys = Object.keys(sortState).filter(key => sortState[key] !== 0);
  if (sortKeys.length === 0) return;

  sortKeys.forEach(key => {
    const direction = sortState[key] > 0 ? 1 : -1;
    data.sort((a, b) => {
      switch (key) {
        case "code": return direction * a.code.localeCompare(b.code);
        case "name": return direction * a.name.localeCompare(b.name);
        case "amount": return direction * (a.amount - b.amount);
        case "cost": return direction * (a.costPrice - b.costPrice);
        case "price": return direction * (a.currentPrice - b.currentPrice);
        case "profit": return direction * (a.profit - b.profit);
        default: return 0;
      }
    });
  });
}

// 初始化历史交易记录
function initHistoryList() {
  const historyList = document.getElementById("historyList");
  if (!historyList) {
    console.error("未找到历史交易列表容器（ID: historyList）");
    return;
  }

  historyList.innerHTML = "";
  if (historyData.length === 0) {
    historyList.innerHTML = '<div class="empty-history">暂无交易记录</div>';
    return;
  }

  historyData.forEach(record => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-details">
        <span class="history-stock">${record.type === "buy" ? "买入" : "卖出"} ${record.name} (${record.code})</span>
        <span class="history-date">${record.date}</span>
      </div>
      <span class="history-amount ${record.type}">${record.amount > 0 ? "+" : ""}${record.amount}股</span>
    `;
    historyList.appendChild(item);
  });
}

// 绑定所有事件
function bindEvents() {
  // 历史交易弹窗相关元素
  const historyTrigger = document.getElementById("historyTrigger");
  const historyModal = document.getElementById("historyModal");
  const closeHistoryModal = document.getElementById("closeHistoryModal");

  // 检查历史交易元素是否存在
  if (!historyTrigger) {
    console.error("未找到查看历史按钮（ID: historyTrigger）");
  } else if (!historyModal) {
    console.error("未找到历史交易弹窗（ID: historyModal）");
  } else {
    // 点击查看历史按钮，显示弹窗
    historyTrigger.addEventListener("click", function() {
      console.log("触发查看历史交易");
      historyModal.classList.add("active");
      document.body.style.overflow = "hidden"; // 禁止背景滚动
    });

    // 关闭历史弹窗的函数
    function closeHistory() {
      historyModal.classList.remove("active");
      document.body.style.overflow = ""; // 恢复滚动
    }

    // 点击关闭按钮
    if (closeHistoryModal) {
      closeHistoryModal.addEventListener("click", closeHistory);
    }

    // 点击弹窗外部关闭
    historyModal.addEventListener("click", function(e) {
      if (e.target === historyModal) closeHistory();
    });

    // ESC键关闭
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && historyModal.classList.contains("active")) {
        closeHistory();
      }
    });
  }

  // 交易弹窗相关事件
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
            transactionAmount.textContent = "¥" + amount.toFixed(2);
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
          if (currentTransaction.type === "sell") {
            try {
              const sellUrl = `http://localhost:3003/holdings/${currentTransaction.id}/sell`;
              const requestBody = {
                "quantity": quantity,
                "price": currentTransaction.price
              };
              const response = await fetch(sellUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                throw new Error(`库存不足，交易失败`);
              }

              alert("已卖出 " + 
                    currentTransaction.name + "（" + currentTransaction.code + "）" + 
                    quantity + "股");
            } catch (error) {
              console.error("卖出请求出错:", error);
              alert(`卖出失败: ${error.message}`);
            }
          } else {
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
                "transactionDate": transactionDate,
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
          positionData = await fetchPositionData(); // 更新持仓数据
          initPositionTable(currentView);
          await updateStatisticsPanel(); // 新增：交易后更新统计数据
        }
      });
    }
  }

  // 买入/卖出按钮事件
  const portfolioTableBody = document.getElementById("portfolioTableBody");
  if (portfolioTableBody) {
    portfolioTableBody.addEventListener("click", function(e) {
      const buyButton = e.target.closest(".buy-button");
      const sellButton = e.target.closest(".sell-button");
      if (buyButton || sellButton) {
        const isBuy = !!buyButton;
        const code = buyButton ? buyButton.dataset.code : sellButton.dataset.code;
        const id = sellButton ? sellButton.dataset.id : null;
        const stock = positionData.find(function(item) {
          return item.code === code;
        }) || { code: code, name: "未知股票", currentPrice: 0 };

        currentTransaction = {
          type: isBuy ? "buy" : "sell",
          id: id,
          code: stock.code,
          name: stock.name,
          price: stock.currentPrice
        };

        // 更新交易弹窗内容
        const transactionTitle = document.getElementById("transactionTitle");
        if (transactionTitle) {
          transactionTitle.textContent = (isBuy ? "买入" : "卖出") + "确认";
        }

        const transactionStock = document.getElementById("transactionStock");
        if (transactionStock) {
          transactionStock.textContent = stock.name;
        }

        const transactionCode = document.getElementById("transactionCode");
        if (transactionCode) {
          transactionCode.textContent = stock.code;
        }

        const transactionPrice = document.getElementById("transactionPrice");
        if (transactionPrice) {
          transactionPrice.textContent = "¥" + stock.currentPrice.toFixed(2);
        }

        if (transactionQuantity) {
          transactionQuantity.value = 100;
        }

        if (transactionAmount) {
          transactionAmount.textContent = "¥" + (stock.currentPrice * 100).toFixed(2);
        }

        if (transactionModal) {
          transactionModal.classList.add("active");
        }

        document.body.style.overflow = "hidden";
      }
    });
  }

  // 视图切换按钮
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      viewButtons.forEach(function(btn) {
        btn.classList.remove("active");
      });
      this.classList.add("active");
      currentView = this.dataset.view || "all";
      initPositionTable(currentView);
    });
  });

  // 表头排序
  const sortableHeaders = document.querySelectorAll(".sortable");
  sortableHeaders.forEach(function(header) {
    header.addEventListener("click", function() {
      const sortKey = this.dataset.sort;
      if (sortKey) {
        sortState[sortKey] = sortState[sortKey] === 1 ? -1 : 
                           (sortState[sortKey] === -1 ? 0 : 1);
        updateSortIndicators();
        initPositionTable(currentView);
      }
    });
  });

  // 搜索功能
  const searchInput = document.getElementById("stockSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      const searchTerm = this.value.toLowerCase().trim();
      const rows = document.querySelectorAll("#portfolioTableBody tr");
      rows.forEach(function(row) {
        const code = row.cells[0] ? row.cells[0].textContent.toLowerCase() : "";
        const name = row.cells[1] ? row.cells[1].textContent.toLowerCase() : "";
        row.style.display = (searchTerm === "" || code.includes(searchTerm) || name.includes(searchTerm)) ? "" : "none";
      });
    });
  }
}

// 更新排序指示器
function updateSortIndicators() {
  document.querySelectorAll(".sort-indicator").forEach(function(indicator) {
    indicator.classList.remove("active", "asc", "desc");
  });

  Object.keys(sortState).forEach(function(key) {
    if (sortState[key] !== 0) {
      const header = document.querySelector(".sortable[data-sort='" + key + "']");
      const indicator = header ? header.querySelector(".sort-indicator") : null;
      if (indicator) {
        indicator.classList.add("active");
        indicator.classList.add(sortState[key] > 0 ? "asc" : "desc");
      }
    }
  });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM加载完成，启动应用");
  initApp();
});