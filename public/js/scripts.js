// 定义各个指数的配置
const indices = [
    { id: 'spx', name: '标普 500', symbol: '.SPX', chartId: 'spxChart', ticker: 'AAPL' },
    { id: 'ndx', name: '纳斯达克 100', symbol: '.NDX', chartId: 'ndxChart', ticker: 'AMZN' },
    { id: 'dji', name: '道琼斯工业平均', symbol: '.DJI', chartId: 'djiChart', ticker: 'NVDA'  },
    { id: 'rut', name: '罗素 2000', symbol: '.RUT', chartId: 'rutChart' , ticker: 'NKE' }
];
  
// 更新指数基本信息的接口
async function updateIndexBasicData(index) {
    try {
        const response = await fetch(`http://localhost:3003/market-data/quote/${index.ticker}`);
        const data = await response.json();
        console.log("请求的数据为",data);
        // 找到对应的卡片元素
        const cardElement = document.querySelector(`#${index.chartId}`).closest('.bg-white');
        
        // 更新标题 (h3)
        const titleElement = cardElement.querySelector('h3');
        if (titleElement) {
            titleElement.textContent = data.name || index.name;
        }
        
        // 更新符号 (p.neutral)
        const symbolElement = cardElement.querySelector('p.text-neutral');
        if (symbolElement) {
        symbolElement.textContent = data.ticker || index.symbol;
        }
        
        // 更新价格 (font-semibold)
        const priceElement = cardElement.querySelector('p.font-semibold');
        if (priceElement) {
        priceElement.textContent = data.currentPrice || '0.00';
        }
        
        // 更新变化值 (text-success 或 text-danger)
        const changeElement = cardElement.querySelector('p.text-success, p.text-danger');
        if (data.percentChange !== undefined) {
        // 根据变化值正负设置样式
        if (parseFloat(data.percentChange) >= 0) {
            changeElement.className = 'text-success text-xs font-medium';
            changeElement.textContent = `+${data.percentChange}% `;
        } else {
            changeElement.className = 'text-danger text-xs font-medium';
            changeElement.textContent = `${data.percentChange}% `;
        }
    }
        
    } catch (error) {
        console.error(`获取 ${index.name} 基本信息时出错:`, error);
    }
}

// 更新指数图表数据的接口
async function updateIndexChartData(index) {
try {
    // 这里替换为实际的API端点
    const response = await fetch(`http://localhost:3003/assets/ticker/${index.ticker}/history`);
    const chartJson = await response.json();
    console.log("请求的历史数据为",chartJson);

    // 更新图表
    updateChart(index.chartId, chartJson.data);
    
} catch (error) {
    console.error(`获取 ${index.name} 图表数据时出错:`, error);
}
}

// 更新单个图表
function updateChart(chartId, chartData) {
    console.log("请求的图表数据为",chartData);
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


    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
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
            }
            },
            scales: {
            x: {
                display: false
            },
            y: {
                display: false
            }
            }
        }
    });
}

// 为所有指数更新基本信息
async function updateAllBasicData() {
    // 并行请求所有指数的基本信息
    const promises = indices.map(index => updateIndexBasicData(index));
    await Promise.all(promises);
}

// 为所有指数更新图表数据
async function updateAllChartData() {
    // 并行请求所有指数的图表数据
    const promises = indices.map(index => updateIndexChartData(index));
    await Promise.all(promises);
}

// 初始化所有数据
async function initAllData() {
// 可以选择并行或串行加载数据
    await Promise.all([
        updateAllBasicData(),
        updateAllChartData()
    ]);
}

// 页面加载完成后初始化数据
document.addEventListener('DOMContentLoaded', function() {
    initAllData();
});

// // 获取 Canvas 上下文
// const spxCtx = document.getElementById('spxChart').getContext('2d');

// // 初始化图表（使用默认数据）
// const spxChart = new Chart(spxCtx, {
//     type: 'line',
//     data: {
//         labels: Array(20).fill(''),
//         datasets: [{
//             data: [4520, 4530, 4510, 4550, 4560, 4540, 4570, 4580, 4575, 4590, 4585, 4595, 4600, 4590, 4585, 4595, 4600, 4610, 4605, 4587],
//             borderColor: '#00B578',
//             backgroundColor: 'rgba(0, 181, 120, 0.1)',
//             borderWidth: 2,
//             pointRadius: 0,
//             fill: true,
//             tension: 0.4
//         }]
//     },
//     options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: { legend: { display: false } },
//         scales: {
//             x: { display: false },
//             y: { display: false }
//         },
//         elements: {
//             line: { tension: 0.4 }
//         }
//     }
// });

// // 发送 POST 请求获取数据并更新图表
// async function updateChartData() {
//     try {
//         // 准备请求参数（根据后端要求调整）
//         const ticker = 'AAPL';

//         const apiUrl = `http://localhost:3003/market-data/quote/${ticker}`;
//         // 发送 GET 请求
//         const response = await fetch(apiUrl);
        
//         if (!response.ok) {
//             throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
//         }
    

//         // 解析响应数据
//         const chartData = await response.json();
//         console.log('获取的图表数据:', chartData);

//         // 更新图表数据
//         spxChart.data.datasets[0].data = chartData.values;
//         spxChart.update();

//         console.log('图表数据已更新');
//     } catch (error) {
//         console.error('获取图表数据失败:', error);
//     }
// }

// // 页面加载后立即更新数据
// document.addEventListener('DOMContentLoaded', updateChartData);


// document.addEventListener('DOMContentLoaded', function() {
    
//     // 纳斯达克100图表
//     const ndxCtx = document.getElementById('ndxChart').getContext('2d');
//     new Chart(ndxCtx, {
//         type: 'line',
//         data: {
//             labels: Array(20).fill(''),
//             datasets: [{
//                 data: [15600, 15650, 15580, 15630, 15680, 15650, 15700, 15720, 15740, 15730, 15750, 15770, 15760, 15780, 15790, 15800, 15795, 15785, 15775, 15763],
//                 borderColor: '#00B578',
//                 backgroundColor: 'rgba(0, 181, 120, 0.1)',
//                 borderWidth: 2,
//                 pointRadius: 0,
//                 fill: true,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: { legend: { display: false } },
//             scales: {
//                 x: { display: false },
//                 y: { display: false }
//             },
//             elements: {
//                 line: { tension: 0.4 }
//             }
//         }
//     });
    
//     // 道琼斯工业平均图表
//     const djiCtx = document.getElementById('djiChart').getContext('2d');
//     new Chart(djiCtx, {
//         type: 'line',
//         data: {
//             labels: Array(20).fill(''),
//             datasets: [{
//                 data: [35200, 35250, 35180, 35230, 35280, 35250, 35300, 35320, 35340, 35330, 35350, 35370, 35400, 35420, 35410, 35430, 35450, 35440, 35430, 35429],
//                 borderColor: '#00B578',
//                 backgroundColor: 'rgba(0, 181, 120, 0.1)',
//                 borderWidth: 2,
//                 pointRadius: 0,
//                 fill: true,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: { legend: { display: false } },
//             scales: {
//                 x: { display: false },
//                 y: { display: false }
//             },
//             elements: {
//                 line: { tension: 0.4 }
//             }
//         }
//     });
    
//     // 罗素2000图表
//     const rutCtx = document.getElementById('rutChart').getContext('2d');
//     new Chart(rutCtx, {
//         type: 'line',
//         data: {
//             labels: Array(20).fill(''),
//             datasets: [{
//                 data: [2370, 2365, 2375, 2380, 2378, 2372, 2368, 2370, 2365, 2360, 2358, 2355, 2357, 2359, 2356, 2353, 2354, 2355, 2358, 2356],
//                 borderColor: '#F55145',
//                 backgroundColor: 'rgba(245, 81, 69, 0.1)',
//                 borderWidth: 2,
//                 pointRadius: 0,
//                 fill: true,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: { legend: { display: false } },
//             scales: {
//                 x: { display: false },
//                 y: { display: false }
//             },
//             elements: {
//                 line: { tension: 0.4 }
//             }
//         }
//     });
// });

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('shadow-md');
    } else {
        header.classList.remove('shadow-md');
    }
});

