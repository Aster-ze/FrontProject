// 指数图表初始化
document.addEventListener('DOMContentLoaded', function() {
    // 标普500图表
    const spxCtx = document.getElementById('spxChart').getContext('2d');
    new Chart(spxCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: [4520, 4530, 4510, 4550, 4560, 4540, 4570, 4580, 4575, 4590, 4585, 4595, 4600, 4590, 4585, 4595, 4600, 4610, 4605, 4587],
                borderColor: '#00B578',
                backgroundColor: 'rgba(0, 181, 120, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 }
            }
        }
    });
    
    // 纳斯达克100图表
    const ndxCtx = document.getElementById('ndxChart').getContext('2d');
    new Chart(ndxCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: [15600, 15650, 15580, 15630, 15680, 15650, 15700, 15720, 15740, 15730, 15750, 15770, 15760, 15780, 15790, 15800, 15795, 15785, 15775, 15763],
                borderColor: '#00B578',
                backgroundColor: 'rgba(0, 181, 120, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 }
            }
        }
    });
    
    // 道琼斯工业平均图表
    const djiCtx = document.getElementById('djiChart').getContext('2d');
    new Chart(djiCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: [35200, 35250, 35180, 35230, 35280, 35250, 35300, 35320, 35340, 35330, 35350, 35370, 35400, 35420, 35410, 35430, 35450, 35440, 35430, 35429],
                borderColor: '#00B578',
                backgroundColor: 'rgba(0, 181, 120, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 }
            }
        }
    });
    
    // 罗素2000图表
    const rutCtx = document.getElementById('rutChart').getContext('2d');
    new Chart(rutCtx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: [2370, 2365, 2375, 2380, 2378, 2372, 2368, 2370, 2365, 2360, 2358, 2355, 2357, 2359, 2356, 2353, 2354, 2355, 2358, 2356],
                borderColor: '#F55145',
                backgroundColor: 'rgba(245, 81, 69, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { tension: 0.4 }
            }
        }
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('shadow-md');
    } else {
        header.classList.remove('shadow-md');
    }
});
