import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { env } from '../../config/env';
import { getMongoClient } from '../../data/mongo';

// 复用业务 MongoDB 连接，把 LangGraph 的 superstep checkpoint 持久化到同一个库，
// 故障重启可基于 thread_id（= 任务 _id）从最近一次 checkpoint 恢复执行。
let checkpointerPromise: Promise<MongoDBSaver> | null = null;

export async function getTaskGraphCheckpointer(): Promise<MongoDBSaver> {
  if (!checkpointerPromise) {
    checkpointerPromise = (async () => {
      const client = await getMongoClient();
      return new MongoDBSaver({
        // 业务库 mongodb 版本与 checkpoint 包内置版本类型不兼容（运行时无差），
        // 直接断言绕过 TS 类型差异。
        client: client as unknown as ConstructorParameters<typeof MongoDBSaver>[0]['client'],
        dbName: env.mongoDbName,
        checkpointCollectionName: 'task_graph_checkpoints',
        checkpointWritesCollectionName: 'task_graph_checkpoint_writes',
      });
    })();
  }
  return checkpointerPromise;
}
