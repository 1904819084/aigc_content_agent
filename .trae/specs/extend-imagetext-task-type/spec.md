# 扩展支持图文任务类型 Spec

## Why
当前系统只支持 “电商带货短视频” 任务，但产品诉求要进一步覆盖 “电商带货图文”。两类任务在剧本生成、生图 Prompt 生成、生图、图片质检等阶段强相关，可以复用已有 Agent；分镜→视频→混剪→成片质检属于短视频专属链路。需要在数据模型、任务编排、前后端创建表单与展示中引入 “任务类型 (taskType)” 维度，避免硬编码到单一管线。

## What Changes
- 在 `TaskBrief` / `Task` 中新增 `taskType: 'short_video' | 'image_text'`；旧文档视为 `short_video`，由 normalize / 迁移脚本兜底（**BREAKING**）。
- 短视频与图文复用同一套 `TaskStageName` 阶段命名（图文链路使用 `script_generating → image_prompt_generating → image_generating → image_qa_reviewing` 这 4 个阶段，全部已存在），无需新阶段名，最大化复用现有 agent / node。
- 后端拆分 graph：现有 `createTaskGraph` 重命名为 `createShortVideoTaskGraph`，新增 `createImageTextTaskGraph`，构成 4 节点线性 DAG。
- `taskService` 同时持有两个 graph 与对应 runner，`runTask` 时按 `task.taskType` 选择对应 graph。
- `taskPipeline.ts` 把阶段集合拆为 `SHORT_VIDEO_STAGE_NAMES` 与 `IMAGE_TEXT_STAGE_NAMES`，`createInitialTaskStages(taskType)` 按 type 返回。
- `taskValidator` 校验 `taskType`。
- 前端 `CreateTaskModal` 新增 `Radio.Group` 任务类型，默认短视频；表单 / hook / store / service 透传 `taskType`。
- 前端常量、`stageFlow.ts` 增加按 `taskType` 选择布局与依赖的能力；`StageFlowGraph` 渲染时根据 `task.taskType` 取对应布局。
- 任务列表 / 任务详情显示任务类型标签。
- 新增 Mongo 迁移脚本，给历史任务补 `taskType: 'short_video'`。

## Impact
- Affected specs: 任务创建、任务编排、任务详情展示、任务流程图。
- Affected code:
  - 后端：`backend/src/types.ts`、`backend/src/domain/task/taskPipeline.ts`、`backend/src/domain/task/taskFactory.ts`、`backend/src/agents/taskGraph/createTaskGraph.ts`（拆分）、`backend/src/agents/taskGraph/createImageTextTaskGraph.ts`（新增）、`backend/src/services/taskService.ts`、`backend/src/utils/taskValidator.ts`。
  - 前端：`frontend/src/types.ts`、`frontend/src/constants/task.ts`、`frontend/src/utils/stageFlow.ts`、`frontend/src/utils/task.ts`、`frontend/src/components/task/CreateTaskModal/index.tsx`、`frontend/src/components/task/TaskListTable/index.tsx`、`frontend/src/pages/task-detail/TaskDetailPage.tsx`、`frontend/src/components/task/StageFlowGraph/index.tsx`。
  - 数据：Mongo `tasks` 集合补齐 `taskType`。
  - 脚本：`backend/scripts/migrateTaskTypeToShortVideo.ts`（新增）。

## ADDED Requirements

### Requirement: 任务类型选择
The system SHALL allow user to choose between "短视频" and "图文" when creating a task.

#### Scenario: 创建图文任务
- **WHEN** 用户在创建任务弹窗选择 “图文” 并提交
- **THEN** 系统创建一条 `taskType='image_text'` 的任务，stages 仅包含 `script_generating / image_prompt_generating / image_generating / image_qa_reviewing` 4 个阶段

#### Scenario: 创建短视频任务（默认）
- **WHEN** 用户不切换任务类型并提交
- **THEN** 系统创建一条 `taskType='short_video'` 的任务，stages 与现有短视频链路一致

### Requirement: 图文任务编排
The system SHALL run image-text tasks through a dedicated linear DAG: `script_generating → image_prompt_generating → image_generating → image_qa_reviewing`，复用现有 agents / nodes。

#### Scenario: 图文任务执行
- **WHEN** taskService 启动一个 `taskType='image_text'` 的任务
- **THEN** TaskRunner 调用 `imageTextTaskGraph` 而非 `shortVideoTaskGraph`，依次执行 4 个阶段并落库

### Requirement: 图文任务详情展示
The system SHALL render the image-text task’s stage flow graph using the image-text stage list / dependencies。

#### Scenario: 详情页展示
- **WHEN** 用户打开一条 `taskType='image_text'` 的任务详情
- **THEN** 流程图节点为 4 个阶段，连线呈线性，无短视频相关节点

## MODIFIED Requirements

### Requirement: 任务初始化阶段集合
The `createInitialTaskStages` function SHALL accept a `taskType` argument and return the corresponding stage list. 缺省回退 `short_video` 以保证旧调用方不报错。

### Requirement: 任务图编排入口
`taskService.runTask` SHALL select the LangGraph by `task.taskType`. `image_text` 用 `imageTextTaskGraph`；其余用 `shortVideoTaskGraph`。

### Requirement: 创建任务表单
`CreateTaskModal` SHALL display a `Radio.Group` for task type with two options (短视频 / 图文)，默认短视频；提交 brief 中 MUST 携带 `taskType`。

## REMOVED Requirements
（无）

## 不在本次范围
- 图文任务的导出 / 分发功能。
- 质检失败回退重试。
- 多语言适配。
