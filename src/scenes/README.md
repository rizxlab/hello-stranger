# Scenes

本目录只保存剧情数据契约和按章节拆分的 JSON 内容。Vue 组件不得直接保存剧情文字，系统模块也不得针对某一章节硬编码规则。

## 推荐结构

```text
scenes/
├── types.ts
├── story.schema.json
├── story-catalog.schema.json
├── shorts/
│   ├── short-scene.schema.json
│   ├── short-series.schema.json
│   ├── entries/
│   └── series/
│       └── dk-conversations/
│           ├── series.json
│           ├── lessons/
│           │   └── lesson15/
│           │       ├── lesson.json
│           │       └── scenarios/
│           └── conversations/
│               └── conversation-id/
│                   ├── conversation.json
│                   └── scenarios/
└── stories/
    ├── hello-stranger/
    │   ├── story.json
    │   └── chapters/
    │       ├── chapter01.json
    │       └── chapter02.json
    └── another-story/
        ├── story.json
        └── chapters/
```

`story.json` 会自动注册为一级故事目录，`chapters/*.json` 会自动注册为二级章节目录。新增内容不需要修改目录页面或首页播放器。

## 故事目录结构

每个 `story.json` 遵循 `StoryDefinition`：

- `id`：稳定的故事 ID
- `title`：故事名称
- `description`：可选的目录简介
- `cover`：可选的封面资源键
- `order`：故事列表排序

## 章节结构

每个章节文件遵循 `StoryChapter`：

- `schemaVersion`：当前固定为 `1`
- `id`：稳定的章节 ID，例如 `chapter01`
- `storyId`：所属故事 ID
- `title`：章节显示名称
- `chapterNumber`：章节顺序
- `summary`：可选的章节目录简介
- `startSceneId`：进入章节时展示的视觉场景
- `startNodeId`：进入章节时加载的节点
- `scenes`：背景、目标、角色热点与下一场景组成的可探索场景列表
- `characters`：本章角色表；对话仅引用角色 ID，避免重复角色资料
- `nodes`：可跳转的剧情节点列表

编辑器可以使用 `story.schema.json` 检查 JSON 字段。TypeScript 代码统一从 `types.ts` 导入类型。

## 节点规则

玩家先进入 `scenes` 中的视觉场景，点击角色热点后，系统会根据热点的 `interaction` 打开目标对话。完成场景中的必需角色互动后，可前往 `nextSceneId`。

角色热点使用 `placement` 声明位置。`default` 必填，`portrait` 与 `landscape` 可选，因此更换背景构图时只需调整数据，不必修改组件。热点完成状态按“场景 ID + 角色 ID”记录，同一角色可以安全地出现在多个场景。

每个节点包含地点、背景资源键和一组对话。对话结束后，节点只能采用一种推进方式：

1. 提供 `choices`，由玩家选择目标节点；或
2. 提供 `nextNodeId`，由 DialogueSystem 直接推进；或
3. 两者都不提供，表示章节结束。

同一节点不能同时设置 `choices` 和 `nextNodeId`。

## 角色与旁白

`speakerId` 引用顶层 `characters` 中的角色 ID。旁白使用 `null`。头像和背景字段保存资源键，不保存 `../../assets/...` 一类相对路径。

## 条件与奖励

条件和奖励使用带 `type` 的声明式对象。后续系统根据类型统一处理：

- 条件：能力值、已学词汇、角色关系、剧情标记
- 奖励：能力值变化、词汇解锁、角色关系变化、剧情标记

章节内容不能直接调用 PlayerStore，也不能在 JSON 中放置可执行代码。

## 英语反馈

每个选择必须提供：

- `naturalness`：1 到 5 星
- `assessment`：对玩家表达的中性评价
- `naturalExpression`：可选的更自然表达
- `explanation`：简短中文说明

反馈强调表达自然程度，不使用简单的“正确/错误”判断。

## 短情景

每个 `shorts/entries/*.json` 同时包含高密度目录卡片所需的标题、时长和标签，以及一个完整 `StoryChapter`。它与长剧情共用 Scene、Dialogue、Choice、Reward 系统和播放器，不维护第二套演绎逻辑。

普通连续栏目可以在 `shorts/series/<series-id>/series.json` 保存栏目资料，并把短情景 JSON 放入同目录的 `entries/`。

DK英语会话使用课程结构：`lessons/<lesson-id>/lesson.json` 保存课程资料，`scenarios/*.json` 保存可顺序播放和跳转的子情景。每个子情景包含置顶的中文 `setting`、参与者和声明式 `turns`；`turns` 可以是连续台词或玩家选择。该模式由独立会话系统播放，不使用场景人物热点；对话方的英语台词默认不附中文翻译。历史对话只在中部区域滚动，当前选项与反馈作为底部独立互动区呈现。

常见的单独会话位于 `series/<series-id>/conversations/<conversation-id>/`，使用 `kind: "standalone"`。它与 DK 课程共用连续会话系统，但目录不会显示课程编号。选中表达后的学习反馈通过中央模态弹窗呈现，不属于底部选项框。

选项可以通过 `nextTurnId` 跳到不同回应；终止台词使用 `endScenario: true`。因此新增会话分支只修改数据，不在 Vue 页面中判断具体选项。
