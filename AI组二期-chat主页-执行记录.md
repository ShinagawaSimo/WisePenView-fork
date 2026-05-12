# AI组二期 - P2-4 WisePen Chat 主页 - 执行记录

## 1. 文档定位

- 本文档记录 Chat 主页（`P2-4`）的开发执行状态。
- 覆盖范围：路由、布局、会话管理、Skill 集成、文档引用、附件上传的 Chat 页面前端实现。
- 不覆盖 Skill 管理后端、HippoRAG 检索、图片多模态等非 Chat 主页范围的能力。

## 2. 设计决策

| 决策           | 结论                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| 页面定位       | 独立路由 `/chat`，与笔记编辑场景的 `ChatPanel`（右侧栏）**并存**                                                |
| 布局           | 左栏（会话列表 + SkillDrawer）+ 右聊天区，无右侧上下文面板                                                      |
| Skill 触发方式 | 三合一：①左侧 SkillDrawer 点选 ②工具栏按钮→SkillPicker 弹层 ③`@skill:名称` 命令（后端解析，前端自动补全待实现） |
| 文档检索       | 混合模式：AI 后端自动检索 + 用户手动引用（DocRefPicker）                                                        |
| Skill 面板交互 | VS Code 式底部折叠面板，默认折叠，点击展开                                                                      |

### 2.1 设计文档

- 设计方案：`docs/superpowers/specs/2026-05-12-wisepen-chat-homepage-design.md`
- 实施计划：`docs/superpowers/plans/2026-05-12-wisepen-chat-homepage.md`

## 3. 已完成实现

### 3.1 页面路由与布局

- `src/bootstrap/router.tsx` — 新增 `/chat` 和 `/chat/:sessionId` 路由，使用 `ChatLayout`
- `src/layouts/ChatLayout.tsx` — 左侧栏 + 聊天主区域布局，管理会话列表 CRUD
- `src/layouts/ChatLayout.module.less` — 布局样式

### 3.2 会话管理

- 新建会话、切换会话、删除会话、重命名会话
- 会话列表由 `ChatLayout` 管理，通过 `IChatService`（已有）与后端交互
- 路由同步：URL `/chat/:sessionId` 与当前会话 ID 保持同步

### 3.3 聊天核心

- `src/views/chat/index.tsx` — ChatPage 主页面
  - SSE 流式聊天（复用 `useChatSession`）
  - 历史消息分页加载（复用 `IChatService.listHistoryMessages`）
  - 模型列表与切换（复用 `ModelSelector`）
  - 空态自动创建会话
  - 消息渲染复用 `MessageList`、`ThinkingBlock`、`ToolCallBlock`

### 3.4 Chat 页面组件

| 组件          | 路径                                     | 说明                                                                            |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| ChatSidebar   | `src/components/ChatPage/ChatSidebar/`   | 左侧栏：NewChatButton + SessionList + SessionItem                               |
| SkillDrawer   | `src/components/ChatPage/SkillDrawer/`   | VS Code 式折叠 Skill 面板                                                       |
| ChatMain      | `src/components/ChatPage/ChatMain/`      | 顶栏（ChatTopBar + ModelSelector） + 欢迎卡片（WelcomeCards）                   |
| ChatInputArea | `src/components/ChatPage/ChatInputArea/` | 工具栏（ActionToolbar） + 上下文标签（ContextTags） + SkillPicker 弹层 + 输入框 |
| MessageList   | `src/components/ChatPage/MessageList/`   | 复用 ChatPanel MessageList 的薄封装                                             |

### 3.5 Skill 服务层

- `src/domains/Skill/` — SkillService 领域层（7 文件）
  - `apis/SkillApi.ts` + `SkillApi.type.ts` — HTTP 接口封装
  - `service/SkillServices.impl.ts` — 真实实现（工厂函数）
  - `mock/SkillServices.mock.ts` — Mock 实现（4 个示例 Skill）
  - `mapper/SkillServices.map.ts` — snake_case → camelCase 映射
  - `index.ts` — barrel 导出
- 已注册到 `_registry` DI 系统，可通过 `useSkillService()` 获取

### 3.6 类型扩展

- `src/session/chat/index.type.ts` — `ChatRequestBody` 新增：
  - `attachment_refs?: ChatAttachmentRef[]`
  - `resource_refs?: ChatResourceRef[]`

### 3.7 状态管理

- `src/store/useChatPageStore.ts` — Chat 页面 Zustand Store
  - `activeSkill` — 当前激活的 Skill
  - `activeDocRefs` — 已引用的文档列表
  - `activeAttachments` — 已添加的附件列表
  - `skillDrawerOpen` — Skill 面板展开/折叠
- 已注册到 `clearAllZustandStores`，登出时自动清理

### 3.8 依赖新增

- `@ant-design/icons` 已添加到 `package.json`

## 4. 待实现 / 后续迭代

### 4.1 高优先级

| 项目                                             | 状态                       | 说明                                                                                                                   |
| ------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **DocRefPicker 对接**                            | 组件骨架就位，回调空实现   | P0-2 已有的文档选择弹层需接入 `ChatInputArea` 的 `onDocRefClick` 回调，将选中文档写入 `useChatPageStore.activeDocRefs` |
| **附件上传对接**                                 | 组件骨架就位，回调空实现   | P0-1 已有的附件上传流程需接入 `ChatInputArea` 的 `onAttachmentClick` 回调                                              |
| **`resource_refs` / `attachment_refs` 发送链路** | 类型已定义，未拼装         | `useChatSession` 的 `buildRequestBody` 中需从 `useChatPageStore` 读取并拼装到请求体                                    |
| **states 传递 Skill 信息**                       | 前端类型已就绪，后端需配合 | `ChatRequestBody.states` 中需携带 `active_skill` / `skill_version`，后端 `ChatTurnCoordinator` 据此加载 Skill          |
| **SkillService 真实 API**                        | 依赖 P1-3 后端             | `wisepen-skill-service` 需部署并暴露 `/skill/listSkills` 和 `/skill/getSkillDetail` 接口                               |
| **Mock 模式端到端验证**                          | 未跑                       | `pnpm mock` → 访问 `/chat` → 完整操作流程验证                                                                          |

### 4.2 中优先级

| 项目                          | 状态                         | 说明                                                                             |
| ----------------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| **@skill:xxx 自动补全**       | `SkillMention` 组件为 stub   | 需实现 textarea 中 `@skill` 前缀检测 + 下拉补全菜单                              |
| **WelcomeCards 快捷卡片回调** | UI 已就位，点击回调空实现    | 搜索文档→打开 DocRefPicker / 使用 Skill→打开 SkillPicker / 上传文件→触发附件上传 |
| **ChatMain 消息列表区域**     | `ChatPageMessageList` 已封装 | 需验证在 Chat 页中消息渲染效果与 ChatPanel 一致                                  |
| **会话列表刷新**              | 仅页面加载时拉取             | 新建/删除会话后需自动刷新列表（当前已通过局部状态更新处理）                      |

### 4.3 低优先级

| 项目                    | 说明                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| 左侧栏响应式/移动端适配 | 窄屏时折叠或隐藏左侧栏                                                 |
| 会话列表搜索/筛选       | 会话多时需搜索功能                                                     |
| 深色模式适配            | 当前 Less 使用 `var(--ant-color-*)` 变量，理论上支持主题切换，但未实测 |
| Skill 管理入口          | SkillDrawer 底部"管理 Skill →"链接需指向 Skill 管理页面（P1-3 交付后） |
| 加载更多历史消息        | `ChatPage` 中 `onLoadMoreHistory` 回调已定义但未实现向上滚动加载       |

## 5. 文件清单

### 5.1 新建文件（30 个）

```
WisePenView/src/
├── components/ChatPage/
│   ├── ChatSidebar/
│   │   ├── index.tsx
│   │   ├── style.module.less
│   │   ├── NewChatButton.tsx
│   │   ├── SessionItem.tsx
│   │   └── SessionList.tsx
│   ├── ChatMain/
│   │   ├── index.tsx
│   │   ├── style.module.less
│   │   ├── ChatTopBar.tsx
│   │   └── WelcomeCards.tsx
│   ├── ChatInputArea/
│   │   ├── index.tsx
│   │   ├── style.module.less
│   │   ├── ActionToolbar.tsx
│   │   ├── ContextTags.tsx
│   │   ├── SkillPicker.tsx
│   │   └── SkillMention.tsx
│   ├── SkillDrawer/
│   │   ├── index.tsx
│   │   ├── style.module.less
│   │   └── SkillItem.tsx
│   └── MessageList/
│       ├── index.tsx
│       └── style.module.less
├── domains/Skill/
│   ├── index.ts
│   ├── apis/
│   │   ├── SkillApi.ts
│   │   └── SkillApi.type.ts
│   ├── service/
│   │   ├── index.type.ts
│   │   └── SkillServices.impl.ts
│   ├── mock/
│   │   └── SkillServices.mock.ts
│   └── mapper/
│       └── SkillServices.map.ts
├── layouts/
│   ├── ChatLayout.tsx
│   └── ChatLayout.module.less
├── views/chat/
│   └── index.tsx
└── store/
    └── useChatPageStore.ts
```

### 5.2 修改文件（11 个）

```
WisePenView/src/
├── bootstrap/router.tsx
├── session/chat/index.type.ts
├── domains/
│   ├── index.ts
│   └── _registry/
│       ├── index.ts
│       ├── registry.types.ts
│       ├── registry.impl.ts
│       ├── registry.mock.ts
│       └── hooks.ts
├── store/
│   ├── index.ts
│   ├── zustand.ts
│   └── clearAllStores.ts
└── package.json (+ @ant-design/icons)
```

## 6. 执行记录

- 2026-05-12
  - 动作：审查 AI组二期开发计划.md，提出 Chat 主页优先级上调建议
  - 结果：Chat 主页从 P2-4 提升至实际并行推进
- 2026-05-12
  - 动作：完成 Chat 主页设计方案讨论与文档撰写
  - 涉及文件：`docs/superpowers/specs/2026-05-12-wisepen-chat-homepage-design.md`
  - 结果：确定双栏布局、Skill 三种触发方式、混合 RAG 模式
- 2026-05-12
  - 动作：完成实施计划撰写
  - 涉及文件：`docs/superpowers/plans/2026-05-12-wisepen-chat-homepage.md`
  - 结果：11 个任务拆解，覆盖类型→服务→状态→组件→组装全链路
- 2026-05-12
  - 动作：执行全部 11 个任务，完成 Chat 主页前端实现
  - 涉及文件：30 新建 + 11 修改 = 41 个文件，1717 行新增
  - 结果：`pnpm build` 通过，`/chat` 路由可用（mock 模式）
  - 遗留问题：
    - DocRefPicker / 附件上传 / SkillService 真实 API 对接待后端就绪
    - @skill:xxx 自动补全待实现
    - 未进行完整的 mock 模式端到端测试
- 2026-05-12
  - 动作：Chat 页面 UI 调整——路由迁移、侧边栏折叠、字号增大、配色对齐 WisePen 主题
  - 涉及文件：
    - `src/bootstrap/router.tsx` — 路由从 `/chat` 迁移到 `/app/chat`
    - `src/layouts/ChatLayout.tsx` — 新增侧边栏折叠/展开按钮，路由路径更新
    - `src/layouts/ChatLayout.module.less` — 新增折叠态样式，sidebar 宽度 240px
    - `src/views/chat/index.tsx` — 路由路径更新
    - `src/components/ChatPage/ChatSidebar/style.module.less` — 字号增大（11→13/14px）
    - `src/components/ChatPage/SkillDrawer/style.module.less` — 字号增大（11→13/14px）
    - `src/components/ChatPage/ChatMain/style.module.less` — 字号增大，卡片 hover 改为 WisePen accent 色 `#5790c8`
    - `src/components/ChatPage/ChatInputArea/style.module.less` — 字号增大，标签色从橙/绿改为 WisePen 蓝灰调
  - 结果：`pnpm build` 通过，访问路径 `/app/chat`、`/app/chat/:sessionId`
- 2026-05-12
  - 动作：在 SystemLayout 左侧导航栏（HeaderNav）中添加"AI 对话"菜单项
  - 涉及文件：`src/components/Sidebar/HeaderNav/index.tsx`
  - 结果：左侧导航栏新增 🤖 AI 对话入口，点击跳转 `/app/chat`，激活时高亮
- 2026-05-12
  - 动作：将 Chat 页面嵌入 SystemLayout 内容区，不再使用独立 ChatLayout
  - 涉及文件：
    - `src/bootstrap/router.tsx` — `/app/chat` 改为 SystemLayout 子路由
    - `src/views/chat/index.tsx` — ChatPage 自带内部分栏（会话侧边栏 + 聊天区），集成会话 CRUD
    - `src/views/chat/style.module.less` — 新增，内部分栏布局样式
    - `src/layouts/ChatLayout.tsx`、`ChatLayout.module.less` — 删除，不再需要
  - 结果：`pnpm build` 通过，Chat 页面与 drive/note 等页面保持一致的 SystemLayout 体验
- 2026-05-12
  - 动作：移除 ChatPage 内部重复的会话侧边栏和 SkillDrawer，统一使用 SystemLayout 左侧栏会话列表
  - 涉及文件：
    - `src/views/chat/index.tsx` — 删除内部分栏布局、会话 CRUD、SkillDrawer，简化为纯聊天区
    - `src/views/chat/style.module.less` — 简化为单栏 flex 布局
    - `src/components/ChatPage/ChatMain/ChatTopBar.tsx` — 新增"新建对话"按钮（模型选择器下方）
    - `src/components/ChatPage/ChatMain/index.tsx` — 透传 `onNewChat` 回调
  - 结果：Chat 页面不再有第二栏，会话由 SystemLayout 左侧栏统一管理；SkillDrawer 暂时弃用
