# AIDESIGNTEE 后台管理系统

## 项目简介

AIDESIGNTEE后台管理系统是一个现代化的企业级管理平台，用于管理AIDESIGNTEE T恤定制电商平台的各项业务。系统采用模块化设计，提供完整的数据分析、订单管理、用户管理、设计管理等功能。

## 功能模块

### 1. 数据统计与分析
- 销售数据概览
- 用户数据分析
- 设计数据分析

### 2. 用户管理
- 用户列表管理
- 设计师管理
- 用户反馈处理

### 3. 订单管理
- 订单列表与处理
- 发货管理
- 支付管理

### 4. 设计管理
- 设计作品管理
- 设计质量控制
- 设计推广

### 5. 商品管理
- T恤管理
- 库存管理
- 价格管理

### 6. 网站管理
- 内容管理
- 系统设置
- 权限管理

### 7. 营销管理
- 活动管理
- 会员管理
- 营销数据分析

### 8. 财务管理
- 收入统计
- 支出管理
- 财务报表

## 技术栈

- 前端框架：React + TypeScript
- UI组件：shadcn/ui
- 样式解决方案：Tailwind CSS
- 构建工具：Vite
- 后端服务：Supabase
- 状态管理：@tanstack/react-query
- 图表库：Recharts

## 开发环境配置

### 系统要求
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone <项目地址>
cd aidesigntee-admin
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
  ├── components/        # UI组件
  ├── pages/            # 页面组件
  ├── hooks/            # 自定义Hook
  ├── lib/              # 工具函数
  ├── integrations/     # 第三方集成
  └── types/            # TypeScript类型定义
```

## 数据库表结构

主要数据表：
- admin_users: 管理员用户表
- orders: 订单表
- products: 商品表
- design_drafts: 设计草稿表
- categories: 分类表
- profiles: 用户档案表

## 部署说明

1. 确保环境变量配置正确
2. 执行生产环境构建
3. 部署到您选择的托管平台

## 开发规范

- 遵循TypeScript类型定义
- 使用ESLint进行代码检查
- 遵循组件化开发原则
- 保持代码简洁可维护

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建Pull Request

## 版本历史

- v0.1.0 - 初始版本
  - 基础框架搭建
  - 核心功能实现

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目维护者：[您的名字]
- 邮箱：[您的邮箱]

## 致谢

感谢所有为这个项目做出贡献的开发者。