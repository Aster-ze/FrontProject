const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由
const stockRoutes = require('./routes/stockRoutes');
const positionRoutes = require('./routes/positionRoutes');

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 路由
app.use('/api/stocks', stockRoutes);
app.use('/api/positions', positionRoutes);

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/positions', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/positions.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

module.exports = app;
