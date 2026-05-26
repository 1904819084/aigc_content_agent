# Tasks

- [ ] Task 1: 后端类型与领域层引入 `taskType`
  - [ ] SubTask 1.1: 在 `backend/src/types.ts` 增加 `TaskType = 'short_video' | 'image_text'`，扩展 `TaskBrief` / `Task` 增加 `taskType`，`TaskStageName` 增加 `image_text_script_generating` / `image_text_image_prompt_generating` / `image_text_image_generating` / `image_text_image_qa_reviewing`。
  - [ ] SubTask 1.2: 在 `backend/src/domain/task/taskPipeline.ts` 拆分阶段集合：`SHORT_VIDEO_STAGE_NAMES` 保留现有内容，新增 `IMAGE_TEXT_STAGE_NAMES`，将 `createInitialTaskStages(taskType)` 改造为按 taskType 返回，缺省回退 `short_video`。
  - [ ] SubTask 1.3: 在 `backend/src/domain/task/taskFactory.ts` 中把 `taskType` 写入实体；`resetTaskForRun` 同步保留 `taskType`，使用 `createInitialTaskStages(task.taskType)`。
  - [ ] SubTask 1.4: 在 `backend/src/utils/taskValidator.ts` 增加 `taskType` 校验与 `normalizeTaskBrief` 透传，缺省视为 `short_video`。

- [ ] Task 2: 后端 Agent / Graph 拆分
  - [ ] SubTask 2.1: 新增 `backend/src/agents/subagents/imageTextScriptGeneratingAgent.ts`，使用图文专用 promptKey（先用占位常量 `demo.image_text_script_generate_agent.prompt`），输出结构裁剪为图文用（保留 `title/hook/positioning/sections/cta`，与 `ScriptResult` 对齐），不污染现有 `scriptGeneratingAgent`。
  - [ ] SubTask 2.2: 新增对应 nodes：`imageTextScriptGeneratingNode.ts`、`imageTextImagePromptGeneratingNode.ts`、`imageTextImageGeneratingNode.ts`、`imageTextImageQaReviewingNode.ts`（后三个直接复用既有 subagent，第二个 node 内部仍读 `image_text_script_generating` 的产物作为 storyboard 输入；如果复用 `imagePromptGeneratingAgent` 不合适，则在 SubTask 内说明并改为内联适配）。
  - [ ] SubTask 2.3: 把现有 `createTaskGraph.ts` 重命名/拆为 `createShortVideoTaskGraph.ts`，新增 `createImageTextTaskGraph.ts`，两者共享 `taskGraphState.ts`。
  - [ ] SubTask 2.4: `services/taskService.ts` 在构造期持有两个 graph 与对应 runner（或共享一个 runner，按 taskType 选 graph），`runTask` 时按 `task.taskType` 选择 graph。

- [ ] Task 3: 前端类型 / 常量 / 流程图配置
  - [ ] SubTask 3.1: `frontend/src/types.ts` / `frontend/src/constants/task.ts` 同步新增 `TaskType` 枚举与图文阶段枚举、文案 (`图文剧本生成` / `图文生图 Prompt 生成` / `图文生图` / `图文生图质检`)。
  - [ ] SubTask 3.2: `frontend/src/utils/stageFlow.ts` 拆分为 `getStageLayout(taskType, stageName)` 与 `getStageDependencies(taskType)`，分别实现两套布局；`getStageCanvasSize(task)` 内部按 `task.taskType` 使用对应布局。
  - [ ] SubTask 3.3: `frontend/src/components/task/StageFlowGraph/index.tsx` 调用上述函数时透传 `task.taskType`。

- [ ] Task 4: 前端创建任务表单与列表展示
  - [ ] SubTask 4.1: `CreateTaskModal/index.tsx` 在表单中新增 `Radio.Group`（短视频 / 图文），默认短视频；`onChange` 把 `taskType` 写回 brief。
  - [ ] SubTask 4.2: `useTaskWorkbench.ts` / `taskWorkbenchStore.ts` / `taskService.ts` 在 brief / draftTask 中默认补 `taskType: 'short_video'`，提交时透传。
  - [ ] SubTask 4.3: `TaskListTable/index.tsx` 列表中增加任务类型列；`TaskDetailPage.tsx` 概览处显示任务类型标签。

- [ ] Task 5: Mongo 数据迁移
  - [ ] SubTask 5.1: 新增脚本 `backend/scripts/migrateTaskTypeToShortVideo.ts`，把所有 `taskType` 缺失的旧任务文档置为 `short_video`，运行后回滚验证查询数为 0。

- [ ] Task 6: 验证与联调
  - [ ] SubTask 6.1: `frontend npm run typecheck`、`backend npm run typecheck` 通过。
  - [ ] SubTask 6.2: 在 dev 环境通过 UI 创建一条图文任务，确认 stages 仅 4 个、流程图渲染线性 4 节点、运行结束 task 状态为 completed。
  - [ ] SubTask 6.3: 在 dev 环境通过 UI 创建一条短视频任务，回归现有 10 个阶段链路与既有 UI 不变。

# Task Dependencies
- Task 2 依赖 Task 1（类型先就位）
- Task 3 依赖 Task 1（前端要拿到新阶段枚举）
- Task 4 依赖 Task 3（要用到 `TaskType` 枚举）与 Task 1（请求体类型）
- Task 5 与 Task 1 / Task 2 / Task 3 / Task 4 解耦，可并行
- Task 6 必须在 Task 1-5 全部完成后执行
