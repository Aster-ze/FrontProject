// 持仓数据
const positionData = [
  {
    code: "600519",
    name: "贵州茅台",
    amount: 100,
    costPrice: 1750.0,
    currentPrice: 1800.0,
    profit: 5000.0,
    profitRate: "+2.86%",
  },
  {
    code: "000001",
    name: "平安银行",
    amount: 500,
    costPrice: 41.5,
    currentPrice: 42.35,
    profit: 425.0,
    profitRate: "+2.05%",
  },
  {
    code: "600036",
    name: "招商银行",
    amount: 300,
    costPrice: 36.5,
    currentPrice: 35.67,
    profit: -249.0,
    profitRate: "-2.27%",
  },
  {
    code: "000858",
    name: "五 粮 液",
    amount: 200,
    costPrice: 160.0,
    currentPrice: 168.9,
    profit: 1780.0,
    profitRate: "+5.56%",
  },
  {
    code: "601899",
    name: "紫金矿业",
    amount: 1000,
    costPrice: 11.0,
    currentPrice: 11.23,
    profit: 230.0,
    profitRate: "+2.09%",
  },
];

// 历史交易记录
const historyData = [
  {
    type: "sell",
    name: "平安银行",
    code: "000001",
    date: "2023-06-14 14:20",
    amount: -200,
  },
  {
    type: "buy",
    name: "宁德时代",
    code: "300750",
    date: "2023-06-12 10:15",
    amount: 200,
  },
  {
    type: "buy",
    name: "贵州茅台",
    code: "600519",
    date: "2023-06-10 09:30",
    amount: 100,
  },
  {
    type: "sell",
    name: "三一重工",
    code: "600031",
    date: "2023-06-08 15:00",
    amount: -500,
  },
  {
    type: "buy",
    name: "招商银行",
    code: "600036",
    date: "2023-06-05 11:20",
    amount: 300,
  },
];

// 当前交易信息
let currentTransaction = null;
let currentView = "all"; // all, profit, loss
let sortState = {}; // 存储各列的排序状态

// 初始化页面
document.addEventListener("DOMContentLoaded", function () {
  // 初始化持仓表格
  initPositionTable();

  // 初始化历史交易记录
  initHistoryList();

  // 绑定事件
  bindEvents();
});

// 初始化持仓表格
function initPositionTable(filter = "all") {
  const tableBody = document.getElementById("portfolioTableBody");
  tableBody.innerHTML = "";

  // 根据筛选条件过滤数据
  let filteredData = [...positionData];
  if (filter === "profit") {
    filteredData = filteredData.filter((stock) => stock.profit >= 0);
  } else if (filter === "loss") {
    filteredData = filteredData.filter((stock) => stock.profit < 0);
  }

  // 应用排序
  applySorting(filteredData);

  // 遍历持仓数据，生成表格行
  filteredData.forEach((stock) => {
    const row = document.createElement("tr");
    const isProfit = stock.profit >= 0;

    // 判断盈亏数字是否为负数，用于设置红色样式
    const isNegativeProfit = stock.profit < 0;

    row.innerHTML = `
      <td>${stock.code}</td>
      <td>${stock.name}</td>
      <td>${stock.amount}</td>
      <td>¥${stock.costPrice.toFixed(2)}</td>
      <td>¥${stock.currentPrice.toFixed(2)}</td>
      <td>
        <div class="stock-profit ${isProfit ? "up" : "down"}">
          <span class="profit-value ${isNegativeProfit ? "negative" : ""}">¥${
      isNegativeProfit ? "" : "+"
    }${stock.profit.toFixed(2)}</span> (${stock.profitRate})
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <input type="number" class="quantity-input" value="100" min="100" step="100">
          <button class="buy-button" data-code="${stock.code}">买入</button>
          <button class="sell-button" data-code="${stock.code}">卖出</button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
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
        case "code":
          valA = a.code;
          valB = b.code;
          return direction * valA.localeCompare(valB);
        case "name":
          valA = a.name;
          valB = b.name;
          return direction * valA.localeCompare(valB);
        case "amount":
          valA = a.amount;
          valB = b.amount;
          return direction * (valA - valB);
        case "cost":
          valA = a.costPrice;
          valB = b.costPrice;
          return direction * (valA - valB);
        case "price":
          valA = a.currentPrice;
          valB = b.currentPrice;
          return direction * (valA - valB);
        case "profit":
          valA = a.profit;
          valB = b.profit;
          // 盈亏列按数值大小排序，确保正数在前（升序时）或负数在前（降序时）
          return direction * (valA - valB);
        default:
          return 0;
      }
    });
  });
}

// 初始化历史交易记录
function initHistoryList() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  // 遍历历史交易数据，生成记录项
  historyData.forEach((record) => {
    const item = document.createElement("div");
    item.className = "history-item";

    item.innerHTML = `
      <div class="history-details">
        <span class="history-stock">${
          record.type === "buy" ? "买入" : "卖出"
        } ${record.name} (${record.code})</span>
        <span class="history-date">${record.date}</span>
      </div>
      <span class="history-amount ${record.type}">${
      record.amount > 0 ? "+" : ""
    }${record.amount}股</span>
    `;

    historyList.appendChild(item);
  });
}

// 绑定事件
function bindEvents() {
  // 获取DOM元素
  const historyTrigger = document.getElementById("historyTrigger");
  const historyModal = document.getElementById("historyModal");
  const closeHistoryModal = document.getElementById("closeHistoryModal");
  const transactionModal = document.getElementById("transactionModal");
  const closeTransactionModal = document.getElementById(
    "closeTransactionModal"
  );
  const cancelTransaction = document.getElementById("cancelTransaction");
  const confirmTransaction = document.getElementById("confirmTransaction");
  const transactionQuantity = document.getElementById("transactionQuantity");
  const transactionAmount = document.getElementById("transactionAmount");
  const searchInput = document.getElementById("stockSearch");
  const viewButtons = document.querySelectorAll(".view-btn");
  const sortableHeaders = document.querySelectorAll(".sortable");

  // 历史交易记录弹窗
  historyTrigger.addEventListener("click", function () {
    historyModal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeHistoryModalFunc() {
    historyModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeHistoryModal.addEventListener("click", closeHistoryModalFunc);
  historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) closeHistoryModalFunc();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && historyModal.classList.contains("active"))
      closeHistoryModalFunc();
  });

  // 交易弹窗相关事件
  function closeTransactionModalFunc() {
    transactionModal.classList.remove("active");
    document.body.style.overflow = "";
    currentTransaction = null;
  }

  closeTransactionModal.addEventListener("click", closeTransactionModalFunc);
  cancelTransaction.addEventListener("click", closeTransactionModalFunc);
  transactionModal.addEventListener("click", (e) => {
    if (e.target === transactionModal) closeTransactionModalFunc();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && transactionModal.classList.contains("active"))
      closeTransactionModalFunc();
  });

  // 数量变化时更新交易金额
  transactionQuantity.addEventListener("input", function () {
    if (currentTransaction) {
      const amount = currentTransaction.price * parseInt(this.value || 0);
      transactionAmount.textContent = `¥${amount.toFixed(2)}`;
    }
  });

  // 确认交易
  confirmTransaction.addEventListener("click", function () {
    if (currentTransaction) {
      const quantity = parseInt(transactionQuantity.value || 0);
      if (quantity <= 0) {
        alert("请输入有效的交易数量");
        return;
      }

      // 这里可以添加实际交易逻辑
      alert(
        `已${currentTransaction.type === "buy" ? "买入" : "卖出"} ${
          currentTransaction.name
        }（${currentTransaction.code}）${quantity}股`
      );

      // 关闭弹窗
      closeTransactionModalFunc();

      // 刷新持仓数据（实际应用中应该从服务器重新获取）
      initPositionTable(currentView);
    }
  });

  // 买入/卖出按钮事件委托
  document
    .getElementById("portfolioTableBody")
    .addEventListener("click", function (e) {
      const buyButton = e.target.closest(".buy-button");
      const sellButton = e.target.closest(".sell-button");

      if (buyButton || sellButton) {
        const isBuy = !!buyButton;
        const code = buyButton
          ? buyButton.dataset.code
          : sellButton.dataset.code;
        const stock = positionData.find((item) => item.code === code) || {
          code,
          name: "未知股票",
          currentPrice: 0,
        };

        // 设置当前交易信息
        currentTransaction = {
          type: isBuy ? "buy" : "sell",
          code: stock.code,
          name: stock.name,
          price: stock.currentPrice,
        };

        // 更新交易弹窗内容
        document.getElementById("transactionTitle").textContent = `${
          isBuy ? "买入" : "卖出"
        }确认`;
        document.getElementById("transactionStock").textContent = stock.name;
        document.getElementById("transactionCode").textContent = stock.code;
        document.getElementById(
          "transactionPrice"
        ).textContent = `¥${stock.currentPrice.toFixed(2)}`;
        transactionQuantity.value = 100;
        transactionAmount.textContent = `¥${(stock.currentPrice * 100).toFixed(
          2
        )}`;

        // 显示交易弹窗
        transactionModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });

  // 搜索功能
  searchInput.addEventListener("input", function () {
    filterTableBySearch(this.value);
  });

  // 视图切换功能
  viewButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 更新激活状态
      viewButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // 获取视图类型并更新表格
      currentView = this.dataset.view;
      initPositionTable(currentView);
    });
  });

  // 支持回车键搜索
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      filterTableBySearch(e.target.value);
    }
  });

  // 表头排序功能
  let sortPriority = 0; // 用于记录排序优先级

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
      initPositionTable(currentView);
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

  // 根据搜索词过滤表格
  function filterTableBySearch(searchTerm) {
    const tableBody = document.getElementById("portfolioTableBody");
    const rows = tableBody.querySelectorAll("tr");

    searchTerm = searchTerm.toLowerCase().trim();

    rows.forEach((row) => {
      const code = row.cells[0].textContent.toLowerCase();
      const name = row.cells[1].textContent.toLowerCase();

      if (
        searchTerm === "" ||
        code.includes(searchTerm) ||
        name.includes(searchTerm)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }
}
