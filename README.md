# AIGC 电商内容生成 Agent 平台

基于 LangGraph 的端到端 AIGC 电商内容生产任务平台，支持 **短视频** 与 **图文** 两类任务的多阶段编排、崩溃续跑、QA 自动回溯。

- 后端：Node.js + GuluX (IoC) + LangGraph + MongoDB + Zod
- 前端：React + TypeScript + Vite + Ant Design + Zustand
- 工程：npm workspaces Monorepo + 共享契约包 `@aigc/shared`

---

## 一、项目结构

```
agent/
├─ shared/                  @aigc/shared —— 前后端唯一契约
│  └─ src/
│     ├─ enums.ts             TaskType / TaskStageName / TaskStatus
│     ├─ stageResults.ts      各阶段产物类型 + StageOutputMap
│     ├─ task.ts              Task / TaskStageOutput / TaskListQuery
│     ├─ taskDefinitions/     任务拓扑（stage 顺序 + 中文 label）
│     └─ index.ts             Barrel file（统一入口）
│
├─ backend/
│  └─ src/
│     ├─ agents/
│     │  ├─ Supervisor/         调度 Agent（fresh start / 崩溃续跑）
│     │  ├─ taskGraph/          LangGraph DAG 装配 + 节点模板 + checkpointer
│     │  ├─ nodes/              各 stage 节点壳文件
│     │  ├─ subagents/          业务 Agent（脚本/分镜/出图/出片/QA）
│     │  ├─ SubAgentFactory/    LLM Agent 通用工厂
│     │  ├─ fornax/             Fornax SDK / Prompt Hub 封装
│     │  └─ taskRuntime.ts      运行时单例容器（taskRepository + pickSupervisor）
│     ├─ services/              用例编排层
│     │  ├─ taskService             list / create / run
│     │  ├─ taskLifecycleService    任务实体生命周期
│     │  ├─ taskRecoveryService     启动时崩溃续跑
│     │  ├─ stageSchemaService      Zod 校验入口
│     │  ├─ taskDefinitionService   包装 @aigc/shared
│     │  └─ assetService
│     ├─ repositories/          Mongo 持久化
│     ├─ controllers/           HTTP 路由
│     ├─ middlewares/           Cors / 异常 / 404
│     ├─ app/bootstrap.ts       启动钩子（含 recovery）
│     └─ config/                环境配置
│
└─ frontend/
   └─ src/
      ├─ Router/router.tsx        Lazy 路由
      ├─ pages/
      │  ├─ TaskList/             任务列表页
      │  └─ TaskDetail/           任务详情页（含 StageFlowGraph）
      ├─ components/
      │  ├─ common/               AppShell / PageHero / StatusTag …
      │  └─ task/                 CreateTaskModal / StageFlowGraph / StageOutputSection / FinalPreview …
      ├─ store/                   Zustand 状态机
      ├─ hooks/useTaskWorkbench   组合 store + services + polling
      ├─ services/                REST 客户端
      └─ constants/ utils/        派生自 shared 的展示常量
```

---

## 二、快速开始

### 环境要求

- Node.js ≥ 18
- MongoDB（本地或远程，连接串见 `backend/src/config/`）

### 安装依赖

```bash
npm install
```

> npm workspaces 会一次性装好 `shared / backend / frontend` 的依赖。

### 启动开发环境

```bash
# 同时启动 backend + frontend（先构建 shared）
npm run dev

# 或单独启动
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:5173
```

### 构建 / 类型检查 / Lint

```bash
npm run build       # shared → backend → frontend 顺序构建
npm run typecheck   # 三个 workspace 全量 tsc --noEmit
npm run lint        # 仅前后端
npm run lint:fix
npm run format      # Prettier 全量格式化
```

---

## 三、核心架构

### 3.1 三层调用链

```
HTTP Route
   │
   ▼
services/taskService.ts          ← 用例编排（list / create / run）
   │
   ▼
agents/taskRuntime.ts            ← 单例容器 + pickSupervisor(task)
   │
   ▼
agents/Supervisor/supervisorAgent  ← fresh start vs 崩溃续跑
   │
   ▼
agents/taskGraph/createXxxTaskGraph  ← LangGraph DAG
   │
   ▼
agents/subagents/*               ← 业务 Agent
   │
   ▼
SubAgentFactory/createLLMStageAgent  ← LLM Agent 通用工厂
```

### 3.2 任务运行时序

1. `POST /tasks` → `taskService.createTask` → `taskLifecycleService` 派生空 stage 列表落库
2. `POST /tasks/:id/run` → 三态分发：
   - `pending` → fresh start
   - `failed` → reset stage outputs 后重跑
   - `running` → 走 checkpointer 续跑
3. `pickSupervisor(task).start(_id)` 拉起 LangGraph，**不阻塞 HTTP**
4. `thread_id = task._id`，进度自动写入 MongoDB checkpointer
5. 进程崩溃后下次启动，`taskRecoveryService` 扫库自动续跑

### 3.3 QA 自动回溯

`createQaConditionalRouter` 实现：

- QA pass → 走下游
- QA fail 且 attempts < 3 → 回到目标 stage 重跑（attempts 计在被回溯的 stage 上）
- attempts ≥ 3 → 熔断，任务标 failed

### 3.4 配置驱动

- **任务拓扑**：`shared/taskDefinitions/*` 定义 stage 顺序 + 中文 label，前后端共用
- **Stage 校验**：`stageSchemaService` 用 Zod 校验各 stage 产物，失败抛 `fornax_xxx_invalid_schema`
- **LLM Agent**：6 个 LLM 阶段统一走 `createLLMStageAgent`，省掉手写 try/catch + JSON 守卫

---

## 四、任务类型

| 任务类型      | 阶段拓扑                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------ |
| `short_video` | 脚本 → 分镜 → 图像 prompt → 出图 → 图像 QA → 视频 prompt → 出片 → 视频 QA → 剪辑 → 剪辑 QA |
| `image_text`  | 脚本 → 图像 prompt → 出图 → 图像 QA                                                        |

新增任务类型只需：

1. 在 `shared/taskDefinitions/` 加定义文件
2. 在 `backend/agents/taskGraph/` 加 `createXxxTaskGraph.ts`
3. 在 `taskRuntime` 注册对应 Supervisor

---

## 五、工程约定

- **架构分层**：`subagents/` → `nodes/` → `taskGraph/`，禁止跨层
- **契约单一**：所有跨边界类型都从 `@aigc/shared` 导入，禁止前后端各自维护
- **阶段输出校验**：所有 stage 必须在 `stageSchemaService.ts` 中定义 Zod schema
- **逻辑收敛**：优先复用 Factory（`createStageNode` / `createLLMStageAgent`），避免冗余壳文件
- **不做的事**：暂不实现 Orchestrator / 人工审核 / 手动取消 / 自动重试，除非有明确业务需求

### Git 提交

- `husky` + `lint-staged`：commit 前自动 `eslint --fix` + `prettier --write`
- `commitlint` 强制 Conventional Commits 规范

---

## 六、目录详解（关键文件）

### Backend

- `agents/Supervisor/supervisorAgent.ts`：通过 `graph.getState` 判断有无 checkpoint，决定 fresh start 还是续跑
- `agents/taskGraph/createStageNode.ts`：节点统一模板（写 running → 调 agent → 写 succeeded/failed），含 `createQaConditionalRouter`
- `agents/SubAgentFactory/createLLMStageAgent.ts`：`getInput → getVariables → LLM → extractValue → zod 校验` 一体化
- `services/taskService.ts`：HTTP 入口编排
- `services/taskLifecycleService.ts`：`createInitialTaskStages / createTaskEntity / resetTaskForRun / updateTaskStage / updateTaskStatus`
- `services/taskRecoveryService.ts`：进程启动钩子，扫描 running 任务自动续跑

### Frontend

- `Router/router.tsx`：`lazy(() => import('../pages/TaskList'))` + Suspense
- `store/taskWorkbenchStore.ts`：Zustand 工作台状态机
- `hooks/useTaskWorkbench.ts`：组合 store + REST + polling，业务页面只消费此 hook
- `components/task/StageFlowGraph`：基于 `@xyflow/react` 的阶段流向图
- `components/task/StageOutputSection`：阶段产物展示（当前依赖 JsonView，后续将引入 Renderer Registry）

### Shared

- `enums.ts`：`as const` 模式同时兼容前端 enum 风格访问与后端 string union
- `taskDefinitions/index.ts`：`getSharedTaskDefinition / getSharedTaskStageNames / findSharedTaskStageDefinition`

---

#
