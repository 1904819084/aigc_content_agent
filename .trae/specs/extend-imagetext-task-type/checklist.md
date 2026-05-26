# Checklist

- [ ] `TaskBrief` / `Task` 已声明 `taskType: 'short_video' | 'image_text'`，类型默认值与 normalize 已处理缺省回退
- [ ] `TaskStageName` 已收录四个 `image_text_*` 阶段且 typecheck 通过
- [ ] `taskPipeline.ts` 暴露 `SHORT_VIDEO_STAGE_NAMES` 与 `IMAGE_TEXT_STAGE_NAMES`，`createInitialTaskStages(taskType)` 行为正确
- [ ] 后端新增 `imageTextScriptGeneratingAgent`，promptKey、产物结构与 `ScriptResult` 形状对齐，未污染原 `scriptGeneratingAgent`
- [ ] 新增 4 个 image-text node 文件且都通过 `createRunStageNode` 工厂创建
- [ ] 拆分得到 `createShortVideoTaskGraph` 与 `createImageTextTaskGraph`，两者各自只使用属于自身的 nodes / dependencies
- [ ] `taskService.runTask` 按 `task.taskType` 路由到对应 graph
- [ ] `taskValidator` 支持 `taskType` 字段并把无效值视为非法 brief
- [ ] 前端 `TaskType` 枚举、阶段枚举、文案、`createDefaultTaskBrief` 默认值 `taskType='short_video'` 全部就位
- [ ] `stageFlow.ts` 中布局 / 依赖按 taskType 维度拆分，`StageFlowGraph` 实际渲染会接收 `task` 并按其 taskType 渲染
- [ ] `CreateTaskModal` 提供 `Radio.Group` 任务类型切换，提交后端的 brief 中带 `taskType`
- [ ] `TaskListTable` / `TaskDetailPage` 显示任务类型标签
- [ ] Mongo 迁移脚本可以幂等执行，旧任务全部补齐 `taskType='short_video'`
- [ ] 前端 typecheck、后端 typecheck 全部通过
- [ ] dev 环境创建一条图文任务，stages 长度为 4，流程图 4 个线性节点，运行成功
- [ ] dev 环境创建一条短视频任务，stages 与流程图回归不变
