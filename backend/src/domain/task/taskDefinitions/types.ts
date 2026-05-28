import type { StageAgent } from '../../../agents/taskGraph/createStageNode';
import type { TaskStageName, TaskType } from '../../../types';

/**
 * 单个阶段的声明：把「阶段名 + 业务文案 + 业务 agent」绑成一个不可分割的事实源，
 * 由 taskDefinition 收敛，避免分散在 taskPipeline / nodes / graph 中各自维护。
 *
 * agent 仅出现在「常规生成型」阶段；QA 阶段是 LangGraph 中带条件路由的特殊节点，
 * 不通过 definition 直接绑定（拓扑结构仍由 taskGraph 文件声明），但 QA 阶段名 + label
 * 仍然要在 definition 中登记，保证 stages 列表 / 前端 label 单点维护。
 */
export type StageDefinition<S extends TaskStageName = TaskStageName> = {
  name: S;
  label: string;
  agent?: StageAgent<S>;
};

export type TaskDefinition = {
  taskType: TaskType;
  stages: StageDefinition[];
};
