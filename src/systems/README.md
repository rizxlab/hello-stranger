# Systems

纯游戏规则与流程目录。系统模块不渲染 UI，也不直接读取 Vue 组件状态。

当前模块：

- `SceneSystem.ts`：管理视觉场景、人物热点、场景目标和场景切换；互动完成状态使用场景与角色的组合键隔离
- `StorySystem.ts`：加载章节、校验引用、管理当前节点、执行跳转并判断选项条件
- `DialogueSystem.ts`：管理节点内的当前对话、逐句推进和完成状态
- `ChoiceSystem.ts`：管理当前可用选项、锁定单次选择并返回学习反馈
- `RewardSystem.ts`：将能力、词汇、关系和标记奖励应用到玩家数据接口
- `DeveloperAccessSystem.ts`：管理仅在当前内存会话有效的隐藏开发者入口
- `ConversationSequenceSystem.ts`：管理课程式短会话的中文介绍、连续对话、选择反馈和子情景切换

`src/composables/useStorySession.ts` 与 `useConversationSession.ts` 只负责协调对应系统与页面状态；具体规则仍留在系统中。

初始 Demo 暂不实现 SaveSystem。
