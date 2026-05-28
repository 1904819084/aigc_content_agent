# Task Platform 架构升级改造计划

## 1. 背景

当前任务系统已经从单一短视频链路扩展到支持 `short_video` 与 `image_text` 两种任务类型，核心能力已经具备：

- 后端支持按 `taskType` 初始化不同阶段集合。
- 后端支持按 `taskType` 选择不同 LangGraph DAG。
- 前端支持任务类型创建、列表展示、详情展示与流程图差异化渲染。

现阶段的问题不在于“功能不可用”，而在于架构仍然以 **字符串阶段名 + 分散配置 + 弱类型 stage output** 为主。当前只有两条链路时还可维护，但如果继续增加：

- 新的任务类型
- 新的 QA 阶段
- 回退 / 重试 / 人工审核
- 更丰富的阶段结果展示

则后端编排、前端流程图、阶段标签、阶段输出渲染会持续重复修改，维护成本和漂移风险会快速上升。

本计划目标是在不推翻现有实现的前提下，把当前系统升级为可持续扩展的“任务编排平台”。

---

## 2. 当前代码的主要痛点

### 2.1 阶段定义分散，多处重复维护

同一份业务定义目前散落在多个文件：

- 后端阶段集合：`backend/src/domain/task/taskPipeline.ts`
- 后端 DAG：
  - `backend/src/agents/taskGraph/createShortVideoTaskGraph.ts`
  - `backend/src/agents/taskGraph/createImageTextTaskGraph.ts`
- 前端流程图布局与依赖：`frontend/src/utils/stageFlow.ts`
- 前端阶段文案：`frontend/src/constants/task.ts`
- 前端按任务类型覆盖文案：`frontend/src/utils/task.ts`

问题：
- 新增一个阶段，需要同时修改多处。
- DAG 与 UI 依赖图可能漂移。
- label、layout、依赖、agent 绑定关系不在一个地方。

### 2.2 Stage 输出契约弱类型

当前 `Task.outputs` 结构允许每个阶段写入 `unknown` 类型输出：

- `backend/src/types.ts`
- `backend/src/utils/createStageOutput.ts`
- `backend/src/utils/getStageResult.ts`

问题：
- 编译器无法校验“某阶段输出是否满足下游输入”。
- `getStageResult<T>()` 依赖调用点自己断言。
- 前端 `StageOutputSection` 只能把大部分结果当 JSON 展示。

### 2.3 Agent 的结果解析逻辑重复且风格不一致

各 subagent 中重复存在：
- 读取上游阶段结果
- 调 prompt
- parse JSON
- 手写 schema 判断
- 组装 `{ input, output }`

代表文件：
- `backend/src/agents/subagents/storyboardGeneratingAgent.ts`
- `backend/src/agents/subagents/videoPromptGeneratingAgent.ts`
- `backend/src/agents/subagents/imagePromptGeneratingAgent.ts`
- `backend/src/agents/subagents/imageTextImagePromptGeneratingAgent.ts`
- `backend/src/agents/subagents/qaReviewingAgent.ts`

问题：
- 结果校验标准不统一。
- 有的阶段严格失败，有的阶段可能写入 `null` 输出。
- schema 只存在 agent 私有函数中，系统无法复用。

### 2.4 Node 文件大量是壳文件

很多 node 文件仅做了一层转发：

- `backend/src/agents/nodes/videoPromptGeneratingNode.ts`
- `backend/src/agents/nodes/storyboardGeneratingNode.ts`
- `backend/src/agents/nodes/imageTextScriptGeneratingNode.ts`
- `backend/src/agents/nodes/imageTextImagePromptGeneratingNode.ts`

问题：
- 阶段越多，样板文件越多。
- DAG 结构与 node 定义拆散后，可读性下降。

### 2.5 TaskRunner 还只是 Graph 包装器

当前 `backend/src/agents/taskRunner.ts` 负责：
- invoke graph
- 成功则整体 completed
- 失败则整体 failed

问题：
- 缺少 retry / resume / cancel 等演进能力。
- 任务生命周期与 graph 执行强耦合。
- 难以表达“人工审核”“局部回滚”“外部异步任务”等状态。

### 2.6 前端阶段结果展示仍以 JSON 为主

当前 `frontend/src/components/task/StageOutputSection/index.tsx` 已经具备基础调试价值，但仍是：
- 输入 JSON
- 输出 JSON
- `image_generating` 特判图片预览

问题：
- stage-specific 展示逻辑开始出现，但组织方式不可扩展。
- 后续要预览视频、脚本、QA 评分时会越来越多特判。

---

## 3. 改造目标

### 3.1 总目标

构建一套 **声明式任务定义 + 强类型阶段输出 + 可扩展执行器 + 可扩展前端 renderer** 的任务平台架构。

### 3.2 具体目标

1. 阶段定义收敛为单一事实源。
2. 后端 DAG 与前端流程图从统一定义派生。
3. 阶段输入输出具备静态类型与运行时 schema 校验。
4. 阶段执行逻辑从样板 node 中解耦。
5. 阶段结果展示可按 stage 类型扩展。
6. 为未来新增任务类型、重试、恢复、人工介入预留扩展位。

### 3.3 非目标

本轮不做：
- 分布式调度系统替换
- 任务队列系统替换
- 完整权限系统 / 多租户设计
- 跨端共享 package 的强制落地

---

## 4. 总体设计原则

### 原则 1：任务定义集中化
所有与“某任务类型有哪些阶段、依赖如何、展示文案是什么、绑定哪个执行器”相关的信息，都应该尽量收敛到统一定义。

### 原则 2：阶段契约显式化
每个阶段的输入输出契约必须同时具备：
- TypeScript 静态类型
- 运行时 schema 校验

### 原则 3：默认配置驱动，特殊情况再逃逸
通用阶段尽量通过 registry 配置生成；只有确实存在特殊执行语义时，才保留自定义 node / executor。

### 原则 4：编排、存储、展示分层
后端执行器不直接承担所有职责；前端结果卡片也不直接硬编码所有 stage 逻辑。

---

## 5. 目标架构

## 5.1 后端：TaskDefinition Registry

新增一层任务定义模型，例如：

```ts
type StageDefinition<K extends TaskStageName = TaskStageName> = {
  name: K;
  label: string;
  dependsOn: TaskStageName[];
  agent: StageAgent<K>;
  outputSchema: StageOutputSchema<K>;
  qaTarget?: QaReviewTargetStage;
};

type TaskDefinition = {
  taskType: TaskType;
  stages: StageDefinition[];
};
```

建议目录：

- `backend/src/domain/task/taskDefinitions/`
  - `index.ts`
  - `shortVideoTaskDefinition.ts`
  - `imageTextTaskDefinition.ts`

该层负责描述：
- 每个 taskType 有哪些阶段
- 阶段顺序与依赖
- 阶段对应 agent
- 阶段输出 schema
- 阶段 label

### 该层将替代/驱动：
- `backend/src/domain/task/taskPipeline.ts`
- `backend/src/agents/taskGraph/createShortVideoTaskGraph.ts`
- `backend/src/agents/taskGraph/createImageTextTaskGraph.ts`

---

## 5.2 后端：StageOutputMap

新增统一的阶段输出映射：

```ts
type StageOutputMap = {
  script_generating: ScriptResult;
  storyboard_generating: StoryboardShotResult[];
  image_prompt_generating: ImagePromptGeneratingResult[];
  image_generating: ImageGeneratingResult[];
  image_qa_reviewing: QaReviewResult;
  video_prompt_generating: VideoPromptGeneratingResult[];
  video_generating: VideoGeneratingResult[];
  video_qa_reviewing: QaReviewResult;
  editing: EditingResult;
  editing_qa_reviewing: QaReviewResult;
};
```

并将以下能力改为泛型：
- `TaskStageOutput`
- `createStageOutput`
- `getStageResult`
- `markStageCompleted`

目标效果：
- `getStageResult(task, 'storyboard_generating')` 自动返回 `StoryboardShotResult[]`
- 下游 agent 读取上游产物时不需要到处手写断言

---

## 5.3 后端：统一的 LLM Stage Agent 工厂

把大部分 agent 的共性抽成工厂：

```ts
createLlmStageAgent({
  promptKey,
  getVariables,
  parseResult,
  errorCode,
})
```

这样每个 agent 文件只保留：
- promptKey
- 输入映射
- 结果 schema 或 parse adapter

目标：
- 减少重复样板代码
- 统一错误处理
- 统一结果解析逻辑

建议目录：
- `backend/src/agents/factories/createLlmStageAgent.ts`

---

## 5.4 后端：Graph Builder 配置化

引入通用 graph builder，根据 `TaskDefinition` 自动：
- addNode
- addEdge
- compile

例如：

```ts
createTaskGraph(taskRepository, taskDefinition)
```

这样后端 graph 文件可收敛为：
- `backend/src/agents/taskGraph/createTaskGraph.ts`

原来的：
- `createShortVideoTaskGraph.ts`
- `createImageTextTaskGraph.ts`

可保留为薄封装，或最终删除。

---

## 5.5 后端：TaskRunner 升级为 Orchestrator

中期将执行层拆为：

### 1）TaskOrchestrator
职责：
- 选择任务定义
- 启动 graph / stage
- 决定完成 / 失败 / 重试 / 人工介入

### 2）StageExecutor
职责：
- 执行单阶段
- 标记 running / completed / failed
- 校验输出

### 3）TaskStateStore
职责：
- 持久化读写（当前可继续复用 `MongoTaskRepository`）

第一阶段不必完全拆开，但建议先把 `TaskRunner` 的生命周期协调职责提出来。

---

## 5.6 前端：TaskDefinition 风格的流程图配置层

前端引入一层与后端结构相似的 stage definition：

建议目录：
- `frontend/src/domain/task/taskDefinitions/`
  - `index.ts`
  - `shortVideoTaskDefinition.ts`
  - `imageTextTaskDefinition.ts`

该层负责：
- label
- stage layout
- dependencies
- 结果 renderer 类型

这样以下能力统一来源：
- `frontend/src/utils/stageFlow.ts`
- `frontend/src/constants/task.ts` 中按任务类型的 label 覆盖
- `frontend/src/utils/task.ts` 中的 `getTaskStageLabel`

---

## 5.7 前端：Stage Output Renderer Registry

把 `StageOutputSection` 升级为按阶段类型注册 renderer：

```ts
const STAGE_OUTPUT_RENDERERS: Partial<Record<TaskStageName, StageOutputRenderer>> = {
  script_generating: ScriptStageRenderer,
  image_generating: ImageGeneratingRenderer,
  video_generating: VideoGeneratingRenderer,
  image_qa_reviewing: QaReviewRenderer,
  video_qa_reviewing: QaReviewRenderer,
  editing_qa_reviewing: QaReviewRenderer,
};
```

通用层负责：
- 卡片骨架
- 空态
- 输入输出切换

具体 renderer 负责：
- 脚本结构化展示
- 图片预览
- 视频预览
- QA 分数、建议、失败原因展示

建议目录：
- `frontend/src/components/task/StageOutputSection/renderers/`

---

## 6. 详细改造项

## 6.1 P0：统一阶段定义来源

### 涉及文件
- `backend/src/domain/task/taskPipeline.ts`
- `backend/src/agents/taskGraph/createShortVideoTaskGraph.ts`
- `backend/src/agents/taskGraph/createImageTextTaskGraph.ts`
- `frontend/src/utils/stageFlow.ts`
- `frontend/src/constants/task.ts`
- `frontend/src/utils/task.ts`

### 改造方式
- 新增 `TaskDefinition` / `StageDefinition`
- 后端 `createInitialTaskStages` 从 definition 生成
- 后端 DAG 从 definition 生成
- 前端流程图依赖与布局从 definition 生成
- 前端 label 从 definition 生成

### 收益
- 新增任务类型只改 definition
- 降低图与执行链路漂移风险

---

## 6.2 P0：引入 StageOutputMap 与类型收敛

### 涉及文件
- `backend/src/types.ts`
- `backend/src/utils/createStageOutput.ts`
- `backend/src/utils/getStageResult.ts`
- `backend/src/data/mongoTaskRepository.ts`

### 改造方式
- 新增 `StageOutputMap`
- `TaskStageOutput` 泛型化
- `getStageResult` 返回精确类型
- `markStageCompleted` 接收与阶段对应的 output 类型

### 收益
- 明确上下游阶段契约
- 降低调用点误用概率

---

## 6.3 P0：引入统一的 stage output schema

### 涉及文件
- 各 `subagents/*Agent.ts`
- 新增 `backend/src/domain/task/stageSchemas.ts`

### 改造方式
- 为每个阶段定义 schema
- 各 agent 不再手写零散校验逻辑
- 将 parse 结果统一通过 schema 验证

### 收益
- 统一错误风格
- 更容易调试 prompt 输出问题
- 前端也可基于 schema 推断展示能力

---

## 6.4 P1：Node 层配置驱动化

### 涉及文件
- `backend/src/agents/nodes/*`
- `backend/src/agents/taskGraph/createStageNode.ts`

### 改造方式
- 删除大量只做转发的 node 壳文件
- 使用 definition 中的 `agent` 直接生成 node
- 特殊阶段保留自定义 executor 扩展点

### 收益
- 减少文件数
- 降低样板成本
- 使 graph 可读性回到“定义”层

---

## 6.5 P1：TaskRunner 拆分编排职责

### 涉及文件
- `backend/src/agents/taskRunner.ts`
- `backend/src/services/taskService.ts`

### 改造方式
- 先引入 `TaskOrchestrator` 概念
- `TaskService` 只选 definition 与触发 orchestrator
- `TaskRunner` 内部逐步让位给 orchestration API

### 收益
- 为 retry / cancel / resume 预留边界

---

## 6.6 P1：QA 规则 registry 化

### 涉及文件
- `backend/src/agents/subagents/qaReviewingAgent.ts`
- `backend/src/agents/nodes/imageQaReviewingNode.ts`
- `backend/src/agents/nodes/videoQaReviewingNode.ts`
- `backend/src/agents/nodes/editingQaReviewingNode.ts`

### 改造方式
- 提炼 `QaStageDefinition`
- 明确 `targetStage -> input extractor -> prompt variables -> result schema`
- `createQaReviewingAgent(target)` 只做组合，不做核心业务判断

### 收益
- 易于增加新的 QA 类型
- 避免单个 QA agent 文件继续膨胀

---

## 6.7 P1：前端 StageOutputSection renderer 化

### 涉及文件
- `frontend/src/components/task/StageOutputSection/index.tsx`
- 新增 `frontend/src/components/task/StageOutputSection/renderers/*`

### 改造方式
- 现有 `StageOutputSection` 降为容器组件
- 不同 stage 使用不同 renderer
- 图片、视频、脚本、QA 分开展示

### 收益
- 产品体验显著提升
- 避免 JSON-only 展示持续扩散

---

## 6.8 P2：阶段输出版本化

### 涉及文件
- `backend/src/types.ts`
- `backend/src/utils/createStageOutput.ts`
- 前端 stage output reader

### 改造方式
- `version: 'v1'` 升级为更明确的 schema version 机制
- 必要时按 stage 区分版本

### 收益
- 保证未来 output shape 演进时，历史任务仍能展示

---

## 7. 推荐实施顺序

## 阶段一：收敛定义与类型（建议优先做）

### 目标
先解决“重复维护”和“弱类型”两个最大问题。

### 内容
1. 引入后端 `TaskDefinition`
2. 用 definition 重写 `createInitialTaskStages`
3. 用 definition 生成 DAG
4. 引入 `StageOutputMap`
5. typed `getStageResult`
6. 统一 stage output schema

### 完成标准
- 新增/调整一个阶段，不需要同时改 5 个位置。
- 上下游阶段的 input/output 契约在 TS 层可追踪。

---

## 阶段二：执行器与 UI 展示升级

### 内容
1. Node 配置驱动化
2. TaskRunner 向 Orchestrator 演进
3. QA registry 化
4. 前端 StageOutputSection renderer 化

### 完成标准
- 新增一个通用阶段无需新建 node 壳文件。
- 不同 stage 能有结构化展示，而不是统一 JSON。

---

## 阶段三：长期演进能力建设

### 内容
1. 输出版本化
2. 可恢复 / 可重试 / 可取消能力
3. 前后端 definition 进一步同源

### 完成标准
- output schema 可以演进。
- 平台具备继续扩任务类型的长期稳定性。

---

## 8. 风险与注意事项

### 风险 1：一次性抽象过重
如果同时重构 definition、graph、agent、前端 renderer，可能引入较大联调成本。

**建议：**
先做 P0，再进入 P1。

### 风险 2：前后端共享定义过早
如果过早强推 shared package，可能先把构建、路径、依赖复杂度提上来。

**建议：**
先保持“结构同构”，后续再决定是否共享实现。

### 风险 3：历史任务 output 不兼容
阶段输出一旦 schema 收紧，旧任务数据可能无法直接展示。

**建议：**
在引入 schema 时同步考虑版本字段与向后兼容 reader。

---

## 9. 建议新增/调整的目录结构

### 后端建议

```text
backend/src/
  domain/task/
    taskDefinitions/
      index.ts
      shortVideoTaskDefinition.ts
      imageTextTaskDefinition.ts
    stageSchemas.ts
    stageOutputMap.ts
  agents/
    factories/
      createLlmStageAgent.ts
    orchestrator/
      taskOrchestrator.ts
```

### 前端建议

```text
frontend/src/
  domain/task/
    taskDefinitions/
      index.ts
      shortVideoTaskDefinition.ts
      imageTextTaskDefinition.ts
  components/task/StageOutputSection/
    index.tsx
    renderers/
      ScriptStageRenderer.tsx
      ImageGeneratingRenderer.tsx
      VideoGeneratingRenderer.tsx
      QaReviewRenderer.tsx
```

---

## 10. 最推荐优先 review 的 5 个改造点

如果本轮只 review 最有价值的部分，建议优先看这 5 项：

1. `TaskDefinitionRegistry`
2. `StageOutputMap + typed getStageResult`
3. 统一 stage output schema
4. 配置驱动 node / graph
5. `StageOutputSection` renderer registry

这 5 项做完后，当前系统会从“能跑两条链路的实现”升级成“可以继续扩的平台骨架”。

---

## 11. 建议的下一步

建议按以下顺序推进：

1. 先确认是否认可 `TaskDefinitionRegistry` 作为核心改造方向。
2. 若认可，先做 P0：
   - 定义收敛
   - StageOutputMap
   - schema 校验
3. 待 P0 稳定后，再进入：
   - TaskRunner / Orchestrator
   - 前端 renderer 化

如果本计划通过 review，下一份文档建议补一版更细的“文件级改造清单”，明确：
- 哪些文件保留
- 哪些文件迁移
- 哪些文件删除
- 哪些文件新增
