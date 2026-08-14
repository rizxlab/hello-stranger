# Hello Stranger

以日常英语交流为核心的移动端优先 PWA 互动剧情游戏。

## 技术选型

- Vue 3：页面与通用 UI
- Vite：开发与生产构建
- TypeScript：为剧情节点、奖励、条件和玩家数据提供可检查的契约，降低长期扩展时的数据错误
- Vue Router：页面路由
- Pinia：后续统一承载玩家状态
- vite-plugin-pwa：生成 manifest、service worker 与离线预缓存

## 当前阶段

已完成可扩展的视觉剧情 Demo：

- 独立开屏页面
- 开屏与首页共享 Hello Stranger 品牌视觉，首页提供剧情入口
- 独立 `/play/:storyId/:chapterId` 与 `/play/short/:shortId` 路由共享沉浸式视觉播放器
- 剧情演绎时隐藏底部导航，场景全屏显示并通过右上角返回章节目录
- 故事目录 → 章节目录 → 首页演绎的二级导航
- 高密度短情景目录，可直接进入更短的独立练习
- 短情景支持栏目化目录；DK英语会话和常见情景会话共用连续对话模式
- 故事元数据和章节 JSON 自动注册
- Scene、Story、Dialogue、Choice、Reward 五个独立系统
- 内存 PlayerStore，以及能力和词汇奖励展示
- 设置页与三击版本号解锁的只读开发者检查页
- PWA manifest、service worker 和离线预缓存

当前包含 `Hello Stranger` 第一章“起飞之前”；短情景下包含 DK英语会话课程 `15 Talking About Family`，以及常见情景会话中的“确认登机口”和“地铁站问路”。

当前不使用 localStorage。刷新页面后玩家数据重置，也不维护跨版本存档兼容。

## 目录职责

```text
src/
├── assets/       # 图片、音频、图标与全局样式
├── components/   # 可复用且不承载游戏规则的 UI
├── composables/   # 跨系统的页面会话编排
├── views/        # 路由页面，只负责页面编排
├── scenes/       # 数据化剧情内容
├── systems/      # 剧情推进、奖励和条件等领域规则
├── stores/       # Pinia 玩家与运行时状态
├── services/     # 未来的云端、AI 或其他外部能力适配
├── utils/        # 无状态通用函数
├── router/       # 页面路由
└── config/       # 导航、资源映射等全局配置
```

`public/` 保存安装 PWA 时必须通过稳定 URL 访问的公共文件；源码中使用的游戏资源仍统一放在 `src/assets/`，后续由 `src/config/` 中的资源映射访问。

场景背景可同时配置横屏与 `-portrait` 竖屏资源。剧情播放器会根据设备方向自动选择，避免直接裁切横屏构图。

## 本地运行

```bash
pnpm install
pnpm dev
```

生产验证：

```bash
pnpm type-check
pnpm test
pnpm build
pnpm preview
```

## 内容结构

```text
src/scenes/stories/
└── hello-stranger/
    ├── story.json
    └── chapters/
        ├── chapter01.json
        └── chapter02.json
```

新增故事时创建新的故事目录；新增章节时只需增加章节 JSON。目录页和首页播放器不需要针对具体内容修改。

短情景栏目位于 `src/scenes/shorts/series/`。DK课程放在 `lessons/`，常见单独会话放在 `conversations/`；两者的子情景均会自动注册并使用同一播放器。各故事的图片映射放在自己的 `resources.ts`，替换场景或角色资源时不必改全局注册表。

## 后续方向

1. 继续规划 Hello Stranger 的后续章节
2. 按章节新增剧情 JSON、场景图和角色资源
3. 按需要增加开发者检查工具与词汇页面
4. 在确有需要时再单独设计存档
