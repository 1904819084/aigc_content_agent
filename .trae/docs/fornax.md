# Fornax 接入指南（后端）

本项目通过 `@next-ai/fornax-sdk` 接入 Fornax，实现：
- Prompt Hub：在 Fornax 平台托管与发布 Prompt，在代码中按 key/version 拉取并插值
- LLM 调用：统一大模型调用入口（execute/streamExecute）
- Trace：在调用侧附加 tags（例如 taskId/stageName/promptKey 等），便于在平台上追踪链路

## 1. 本地配置

复制一份环境变量文件（不要提交真实密钥）：
- 参考 [backend/.env.example](file:///Users/bytedance/Documents/trae_projects/agent/backend/.env.example)

至少需要：
- `FORNAX_AK` / `FORNAX_SK`
- `FORNAX_PROMPT_SCRIPT_KEY` / `FORNAX_PROMPT_SCRIPT_VERSION`

可选（用于区分 BOE/ONLINE 与泳道，或取草稿态 Prompt）：
- `FORNAX_REGION`（默认 CN）
- `FORNAX_SERVICE_IS_BOE`（true/false）
- `FORNAX_SERVICE_ENV`（例如 boe_xxx / ppe_xxx）
- `FORNAX_ZTI_TOKEN`（个人草稿态需要）

## 2. Fornax 平台侧你需要做什么

### 2.1 准备空间与权限
- 确认你在 Fornax 平台有一个空间（Space）
- 在空间「空间配置」里获取 AK/SK（你已经有了）

### 2.2 Prompt（提示词）接入（Prompt Hub）
目标：拿到 `promptKey` 与 `version`，让后端可以通过 Prompt Hub 获取并插值。

建议流程：
- 在平台创建 Prompt（建议先做文本模型阶段的 Prompt）
- 写好 system/user 模板，并定义插值变量（例如 `{{productName}}`、`{{videoPrompt}}`）
- 提交（得到一个只读的提交版本号 version）
- 发布到 BOE 或 ONLINE（可选泳道 env）

代码侧推荐：
- 开发期固定指定 `version`（可复现、便于回放）
- 稳定后再考虑不填 version 改用“环境最新发布”或 `releaseLabel`

### 2.3 文本模型（LLM）接入
目标：让某个阶段 subagent（推荐从 `script_generating` 开始）走 Fornax 的文本模型调用。

平台侧通常需要：
- 确认空间已开通可用的文本模型能力（例如 GPT OpenAPI / 豆包等）
- 明确模型标识（model name / model id），用于代码侧调用

代码侧已预留：
- `backend/src/infra/fornax/llm.js` 的 `fornaxExecuteChat({ system, user, model, trace })`
- `backend/src/agents/subagents/scriptGeneratingAgent.js` 会在配置 promptKey/version 后优先走 Fornax，否则回退 mock

### 2.4 图片模型接入（image）
目标：把 `image_generating` 阶段从 placeholder URL 升级为真实图像生成。

平台侧通常需要：
- 选择/开通图像生成模型（对应 Fornax 的模型节点或 MaaS 能力）
- 明确输出形式：URL / base64 / 二进制

代码侧推荐落地方式：
- subagent 调模型拿到 URL/base64
- 统一通过现有 assets 能力落盘（/uploads）并回写成 AssetResource（前端可直接展示）

### 2.5 视频模型接入（video）
目标：把 `video_generating` 阶段从 mock previewUrl 升级为真实视频生成/合成。

平台侧通常需要：
- 选择/开通视频生成模型（或视频合成能力）
- 明确产物存储策略（建议落到本服务 `/uploads`，或对象存储后回写 URL）

代码侧推荐落地方式：
- 先生成分镜视频片段（每个 shot 一个 clip）
- editing 阶段再做合成（后续可接入 FFmpeg 或平台合成能力）

## 3. 安全注意事项
- 不要在任何代码/配置文件中硬编码 AK/SK
- 不要在聊天中继续发送 AK/SK；建议你立刻在平台把已暴露的密钥作废/轮转

