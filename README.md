# 智造学堂

面向工匠工作室的培训管理前端原型，覆盖培训台账、课程资料、培训执行、考核录入、双向评价和管理看板等核心流程。

当前项目为前端演示版本，使用本地 mock 数据驱动页面交互，适合用于需求评审、页面走查和后续接口联调前的流程验证。

## 功能概览

- 学员端：查看我的培训、课程资料、知识库、考核结果，并对导师进行评价。
- 导师端：管理课件、查看学员评价、反馈培训执行情况。
- 台账后台：维护培训台账、培训计划、执行记录、考核数据、人员信息、导入导出数据。
- 管理者看板：查看培训总览、工作室对比和关键质量指标。
- 原型登录：内置演示账号，支持按角色快速进入不同业务视角。

## 技术栈

- Vue 3
- Vite
- Vue Router
- Pinia
- Element Plus
- Day.js
- Axios

## 本地运行

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173/
```

如果端口被占用，Vite 会自动切换到下一个可用端口，请以终端输出为准。

## 常用命令

```bash
# 启动开发环境
npm run dev

# 构建生产包
npm run build

# 本地预览构建结果
npm run preview
```

## 演示账号

登录页提供快捷填充按钮，也可以手动选择角色后登录。

| 角色 | 入口 | 说明 |
| --- | --- | --- |
| 学员 | `/student/training` | 查看培训、课件、知识库、考核和评价 |
| 导师 | `/tutor/courseware` | 管理课件、学员评价和反馈 |
| 台账管理员 | `/admin/ledger` | 管理培训台账、计划、执行、考核和数据流转 |
| 管理者 | `/dashboard/overview` | 查看经营看板和对比分析 |

原型阶段路由守卫会自动写入模拟 token，方便直接访问各页面。

## 目录结构

```text
.
├── public/                 # 静态资源
├── src/
│   ├── api/mockData.js      # 原型 mock 数据
│   ├── layouts/             # 不同角色的页面框架
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态
│   ├── views/               # 业务页面
│   │   ├── admin/           # 台账后台
│   │   ├── dashboard/       # 管理看板
│   │   ├── student/         # 学员端
│   │   └── tutor/           # 导师端
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

## 数据说明

- 当前数据来自 `src/api/mockData.js`，包含工作室、导师、学员、培训计划、课件、考核和评价等模拟数据。
- 登录、权限和页面数据均为原型逻辑，尚未接入真实后端。
- mock 数据中出现的姓名和手机号仅用于页面展示与流程验证，生产环境应替换为真实接口返回数据。

## 后续接入建议

- 将 `mockData.js` 中的列表、详情、导入导出、评价和考核逻辑拆分为接口服务。
- 将路由守卫中的模拟 token 替换为真实登录态校验。
- 为台账导入、考核录入、评价提交等关键流程补充接口错误态和空状态。
- 在接入后端后补充端到端用例，覆盖四类角色的主路径。


Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
