// 持仓数据
const positionData = [
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
  {
    code: '600036',
    name: '招商银行',
    amount: 300,
    costPrice: 36.5,
    currentPrice: 35.67,
    profit: -249.0,
    profitRate: '-2.27%',
  },
  {
    code: '000858',
    name: '五 粮 液',
    amount: 200,
    costPrice: 160.0,
    currentPrice: 168.9,
    profit: 1780.0,
    profitRate: '+5.56%',
  },
  {
    code: '601899',
    name: '紫金矿业',
    amount: 1000,
    costPrice: 11.0,
    currentPrice: 11.23,
    profit: 230.0,
    profitRate: '+2.09%',
  },
];

// 历史交易记录
const historyData = [
  {
    type: 'sell',
    name: '平安银行',
    code: '000001',
    date: '2023-06-14 14:20',
    amount: -200,
  },
  {
    type: 'buy',
    name: '宁德时代',
    code: '300750',
    date: '2023-06-12 10:15',
    amount: 200,
  },
  {
    type: 'buy',
    name: '贵州茅台',
    code: '600519',
    date: '2023-06-10 09:30',
    amount: 100,
  },
  {
    type: 'sell',
    name: '三一重工',
    code: '600031',
    date: '2023-06-08 15:00',
    amount: -500,
  },
  {
    type: 'buy',
    name: '招商银行',
    code: '600036',
    date: '2023-06-05 11:20',
    amount: 300,
  },
];

// 当前交易信息
let currentTransaction = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function () {
  // 初始化持仓表格
  initPositionTable();

  // 初始化历史交易记录
  initHistoryList();

  // 绑定事件
  bindEvents();
});

// 初始化持仓表格
function initPositionTable() {
  const tableBody = document.getElementById('portfolioTableBody');
  tableBody.innerHTML = '';

  // 遍历持仓数据，生成表格行
  positionData.forEach((stock) => {
    const row = document.createElement('tr');
    const isProfit = stock.profit >= 0;

    row.innerHTML = `
      <td>${stock.code}</td>
      <td>${stock.name}</td>
      <td>${stock.amount}</td>
      <td>¥${stock.costPrice.toFixed(2)}</td>
      <td>¥${stock.currentPrice.toFixed(2)}</td>
      <td>
        <div>
          <span class="stock-profit ${isProfit ? 'up' : ''}">
            ¥${Math.abs(stock.profit).toFixed(2)} (${stock.profitRate})
          </span>
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

// 初始化历史交易记录
function initHistoryList() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';

  // 遍历历史交易数据，生成记录项
  historyData.forEach((record) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    item.innerHTML = `
      <div class="history-details">
        <span class="history-stock">${
          record.type === 'buy' ? '买入' : '卖出'
        } ${record.name} (${record.code})</span>
        <span class="history-date">${record.date}</span>
      </div>
      <span class="history-amount ${record.type}">${
      record.amount > 0 ? '+' : ''
    }${record.amount}股</span>
    `;

    historyList.appendChild(item);
  });
}

// 绑定事件
function bindEvents() {
  // 获取DOM元素
  const historyTrigger = document.getElementById('historyTrigger');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryModal = document.getElementById('closeHistoryModal');
  const transactionModal = document.getElementById('transactionModal');
  const closeTransactionModal = document.getElementById(
    'closeTransactionModal'
  );
  const cancelTransaction = document.getElementById('cancelTransaction');
  const confirmTransaction = document.getElementById('confirmTransaction');
  const transactionQuantity = document.getElementById('transactionQuantity');
  const transactionAmount = document.getElementById('transactionAmount');

  // 历史交易记录弹窗
  historyTrigger.addEventListener('click', function () {
    historyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeHistoryModalFunc() {
    historyModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeHistoryModal.addEventListener('click', closeHistoryModalFunc);
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) closeHistoryModalFunc();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyModal.classList.contains('active'))
      closeHistoryModalFunc();
  });

  // 交易弹窗相关事件
  function closeTransactionModalFunc() {
    transactionModal.classList.remove('active');
    document.body.style.overflow = '';
    currentTransaction = null;
  }

  closeTransactionModal.addEventListener('click', closeTransactionModalFunc);
  cancelTransaction.addEventListener('click', closeTransactionModalFunc);
  transactionModal.addEventListener('click', (e) => {
    if (e.target === transactionModal) closeTransactionModalFunc();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && transactionModal.classList.contains('active'))
      closeTransactionModalFunc();
  });

  // 数量变化时更新交易金额
  transactionQuantity.addEventListener('input', function () {
    if (currentTransaction) {
      const amount = currentTransaction.price * parseInt(this.value || 0);
      transactionAmount.textContent = `¥${amount.toFixed(2)}`;
    }
  });

  // 确认交易
  confirmTransaction.addEventListener('click', function () {
    if (currentTransaction) {
      const quantity = parseInt(transactionQuantity.value || 0);
      if (quantity <= 0) {
        alert('请输入有效的交易数量');
        return;
      }

      // 这里可以添加实际交易逻辑
      alert(
        `已${currentTransaction.type === 'buy' ? '买入' : '卖出'} ${
          currentTransaction.name
        }（${currentTransaction.code}）${quantity}股`
      );

      // 关闭弹窗
      closeTransactionModalFunc();

      // 刷新持仓数据（实际应用中应该从服务器重新获取）
      initPositionTable();
    }
  });

  // 买入/卖出按钮事件委托
  document
    .getElementById('portfolioTableBody')
    .addEventListener('click', function (e) {
      const buyButton = e.target.closest('.buy-button');
      const sellButton = e.target.closest('.sell-button');

      if (buyButton || sellButton) {
        const isBuy = !!buyButton;
        const code = buyButton
          ? buyButton.dataset.code
          : sellButton.dataset.code;
        const stock = positionData.find((item) => item.code === code) || {
          code,
          name: '未知股票',
          currentPrice: 0,
        };

        // 设置当前交易信息
        currentTransaction = {
          type: isBuy ? 'buy' : 'sell',
          code: stock.code,
          name: stock.name,
          price: stock.currentPrice,
        };

        // 更新交易弹窗内容
        document.getElementById('transactionTitle').textContent = `${
          isBuy ? '买入' : '卖出'
        }确认`;
        document.getElementById('transactionStock').textContent = stock.name;
        document.getElementById('transactionCode').textContent = stock.code;
        document.getElementById(
          'transactionPrice'
        ).textContent = `¥${stock.currentPrice.toFixed(2)}`;
        transactionQuantity.value = 100;
        transactionAmount.textContent = `¥${(stock.currentPrice * 100).toFixed(
          2
        )}`;

        // 显示交易弹窗
        transactionModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

  // 筛选功能
  const codeFilter = document.getElementById('codeFilter');
  const nameFilter = document.getElementById('nameFilter');
  const amountSort = document.getElementById('amountSort');
  const profitFilter = document.getElementById('profitFilter');
  const profitSort = document.getElementById('profitSort');
  const applyFilter = document.getElementById('applyFilter');
  const resetFilter = document.getElementById('resetFilter');
  const tableBody = document.getElementById('portfolioTableBody');

  // 保存原始数据
  const originalRows = Array.from(tableBody.querySelectorAll('tr'));

  // 应用筛选
  function applyFilters() {
    const codeValue = codeFilter.value.toLowerCase().trim();
    const nameValue = nameFilter.value.toLowerCase().trim();
    const amountSortValue = amountSort.value;
    const profitFilterValue = profitFilter.value;
    const profitSortValue = profitSort.value;

    // 复制原始行并进行筛选
    let filteredRows = [...originalRows];

    // 代码筛选
    if (codeValue) {
      filteredRows = filteredRows.filter((row) =>
        row.cells[0].textContent.toLowerCase().includes(codeValue)
      );
    }

    // 名称筛选
    if (nameValue) {
      filteredRows = filteredRows.filter((row) =>
        row.cells[1].textContent.toLowerCase().includes(nameValue)
      );
    }

    // 盈亏筛选
    if (profitFilterValue === 'profit') {
      filteredRows = filteredRows.filter((row) => {
        const profitEl = row.querySelector('.stock-profit');
        return profitEl.classList.contains('up');
      });
    } else if (profitFilterValue === 'loss') {
      filteredRows = filteredRows.filter((row) => {
        const profitEl = row.querySelector('.stock-profit');
        return !profitEl.classList.contains('up');
      });
    }

    // 盈亏排序
    if (profitSortValue === 'asc') {
      filteredRows.sort((a, b) => {
        const aProfit = parseFloat(
          a.cells[5].textContent.match(/-?\d+\.\d+/)[0]
        );
        const bProfit = parseFloat(
          b.cells[5].textContent.match(/-?\d+\.\d+/)[0]
        );
        return aProfit - bProfit;
      });
    } else if (profitSortValue === 'desc') {
      filteredRows.sort((a, b) => {
        const aProfit = parseFloat(
          a.cells[5].textContent.match(/-?\d+\.\d+/)[0]
        );
        const bProfit = parseFloat(
          b.cells[5].textContent.match(/-?\d+\.\d+/)[0]
        );
        return bProfit - aProfit;
      });
    }

    // 数量排序（当盈亏未排序时）
    else if (amountSortValue === 'asc') {
      filteredRows.sort((a, b) => {
        const aAmount = parseInt(a.cells[2].textContent);
        const bAmount = parseInt(b.cells[2].textContent);
        return aAmount - bAmount;
      });
    } else if (amountSortValue === 'desc') {
      filteredRows.sort((a, b) => {
        const aAmount = parseInt(a.cells[2].textContent);
        const bAmount = parseInt(b.cells[2].textContent);
        return bAmount - aAmount;
      });
    }

    // 更新表格显示
    tableBody.innerHTML = '';
    filteredRows.forEach((row) => tableBody.appendChild(row));
  }

  // 重置筛选
  function resetFilters() {
    codeFilter.value = '';
    nameFilter.value = '';
    amountSort.value = 'default';
    profitFilter.value = 'all';
    profitSort.value = 'default';

    // 恢复原始数据
    tableBody.innerHTML = '';
    originalRows.forEach((row) => tableBody.appendChild(row));
  }

  // 绑定筛选事件
  applyFilter.addEventListener('click', applyFilters);
  resetFilter.addEventListener('click', resetFilters);

  // 排序下拉框变化时自动应用筛选
  [amountSort, profitSort, profitFilter].forEach((select) => {
    select.addEventListener('change', applyFilters);
  });

  // 支持回车键搜索
  [codeFilter, nameFilter].forEach((input) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') applyFilters();
    });
  });
}
