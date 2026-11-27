# 空格流金 · Spacebar Golden Flow

在 DeepSeek Harness 窗口四周闪起金属质感的金色流光，并从上方落下金元宝雨。
连续快速敲击空格即可触发；敲得越多，元宝越多，动画不会被打断重播。

- 包名：`@local/spacebar-goldenflow`
- 当前版本：`1.4.0`
- 类型：纯客户端 UI 插件（Web）
- 挂载位置：`shell.overlay`（整个窗口最上层的点击穿透层）

> 源码目录目前仍叫 `spacebar-gold-glow/`，但安装后的包名与显示名已经是 `spacebar-goldenflow` / 「空格流金」。

## 效果

| 操作 | 效果 |
| --- | --- |
| 单独敲一下空格 | 正常输入，不触发特效 |
| 320ms 内连敲第 2 下 | 20 个金元宝 + 1.6 秒金色光晕 |
| 继续敲第 3 下 | 进入强光档：30 个元宝 + 2.1 秒光晕 |
| 之后每多敲 1 下 | 追加 10 个元宝，并重新计 2.1 秒；**已下落的元宝和金环不会重置** |
| 元宝数量上限 | 888 个；最后一波自动补足余数（8 个） |
| 停手之后 | 按最后一击的档位再持续 1.6 / 2.1 秒，然后 0.5 秒淡出 |

细节：

- 触发窗口为 320ms；超过这个间隔就算新的一轮。
- 长按产生的重复按键（`event.repeat`）、带 Ctrl/Alt/Shift/Meta 的空格、输入法组合中的空格都会被忽略。
- 只在真正触发连击的空格上调用 `preventDefault()`，因此不会影响正常输入。
- 光效层 `pointer-events: none`，完全点击穿透，不挡任何操作。
- 支持 `prefers-reduced-motion`：开启“减少动态效果”时会隐藏元宝、星芒、旋转光环等，只保留静态的金色边框光。

## 视觉构成

- **全屏闪光**：白金色的一次性 pop，强光档更亮。
- **边缘辉光**：多层 inset 阴影，从近白细线过渡到香槟金、琥珀色。
- **四角泛光**：白色核心的角落光晕。
- **金属边框**：拉丝金渐变底 + 四段白热弧线绕框旋转 + 斜向扫光。
- **星芒与金尘**：最多 24 颗四角星形闪光、最多 29 粒漂浮金尘。
- **金元宝雨**：30 条轨迹的 SVG 元宝，带翻滚、左右飘移、远近景深模糊和金色投影。

## 安装

1. 打开 DeepSeek Harness 的插件管理器。
2. 选择从**本地目录**安装，指向本目录。
3. 安装后插件会自动启用；如果页面还显示旧模块，按一次 `Ctrl+R` 刷新。

插件依赖 `@deepseek-ai/dsh-client-ui-layout` 提供的 `shell.overlay` 插槽，安装时会自动注入。

## 目录结构

```
spacebar-gold-glow/
├── package.json        # 包名、版本、dsh bundle/client 声明
├── cordis.patch.yml    # 往 profile 插入 spacebar-goldenflow 这一行
├── index.js            # Host 半侧：空实现（本插件只在客户端渲染）
├── client.js           # 全部逻辑、样式、SVG 与 React 组件
├── locale/
│   ├── zh.json         # 中文标题「空格流金」与描述
│   └── en.json         # 英文标题与描述
└── icon.svg            # 金色边框 + 空格键图标
```

## 自定义

主要参数都在 `client.js` 顶部：

```js
const TAP_WINDOW_MS = 320;              // 连击判定窗口
const HOLD_MS = { 1: 1600, 2: 2100 };   // 停手后各档位的持续时间
const FADE_MS = 500;                    // 淡出时长
const BASE_INGOTS = 20;                 // 起手元宝数
const WAVE_INGOTS = 10;                 // 每多敲一下追加的数量
const MAX_INGOTS = 888;                 // 元宝上限
```

其他常用改法：

- **改颜色**：搜索 `#ffd75f`（主金）、`#8a4e00`（深金）、`#fff6cf`（高光白）等色值。
- **改元宝轨迹**：调整 `INGOTS` 数组里的 `[left%, delay, fall, width, startTilt, endTilt, drift]`。
- **改星芒位置**：调整 `GLINTS` / `SPARKS` 数组。
- **改触发手感**：把 `TAP_WINDOW_MS` 调大（更容易连上）或调小（更严格）。

修改后先做静态检查：

```bash
node --check client.js
```

然后重新启用插件（关闭再打开）或刷新页面即可看到效果。

## 常见问题

**敲空格没反应？**

- 确认两次敲击的间隔在 320ms 内。
- 确认没有按住 Ctrl/Alt/Shift/Meta，也不是输入法正在组合。
- 确认插件处于启用状态；改过客户端代码后需要刷新或重新启用。

**元宝太多卡顿？**

把 `MAX_INGOTS` 或 `WAVE_INGOTS` 调小即可；动画只使用 `transform` 和 `opacity`，正常情况下 888 个也在可接受范围内。

**想要“只有三连击才下雨”？**

把 `startSession()` 里的 `waves: [wave]` 改成 `waves: []`；再在 `extendSession()` 里让 `taps === 3` 时追加 `count: BASE_INGOTS` 的第一波，之后每次追加 `count: WAVE_INGOTS` 的波。

**换了包名/图标后插件列表没更新？**

包名、`cordis.patch.yml` 的行 id 属于安装元数据，需要移除旧 bundle 再重新安装；只改 `client.js` 则重新启用或刷新即可。
