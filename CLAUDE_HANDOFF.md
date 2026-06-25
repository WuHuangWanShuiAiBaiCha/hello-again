# Hello again / Hello Janee — Session Handoff 备忘

> 本文件用于在切换 Codex 账号时做 session 交接，汇总当前项目状态、用户要求与未完成任务。

---

## 1. 项目标识

- **项目路径**: `/Users/jiangyiwenzhe/Desktop/hello again`
- **用户称呼**: Hello again（也被用户称为 “Hello Janee”）
- **项目类型**: 纯静态 HTML / CSS / JS 的 Apple 历史产品展示站点
- **当前入口**: `mac/index.html`（Mac 系列横向滚动页面）

---

## 2. 本次会话目标

用户对 Mac 系列页面提出两项改动：

1. **第四页（MacBook Air / series-page-four）**
   - 将 `product-sequence`（滚动驱动的图片序列动画 + reveal 小视频）移动到 `archive-inline-shell`（MacBook Air 文字信息）**上方**。
   - 目标顺序：`sequence-intro` → `series-dock` → `product-sequence` → `archive-inline-shell`。

2. **第五页（MacBook Pro 13-inch M1 / series-page-five）**
   - 用 Wayback Machine 2020 年 11 月快照 `https://www.apple.com/macbook-pro-13/` 的**完整原始 HTML** 替换当前单薄的 fragment。
   - 用户明确拒绝任何“自创/改写”版本，要求把爬虫抓下来的原始 HTML 原样接进去。

---

## 3. 已完成

- 第四页 DOM 重排已完成于以下文件：
  - `/Users/jiangyiwenzhe/Desktop/hello again/mac/index.html`
  - `/Users/jiangyiwenzhe/Desktop/hello again/mac/sequence.html`
  - `/Users/jiangyiwenzhe/Desktop/hello again/mac/aqua.html`
  - `/Users/jiangyiwenzhe/Desktop/hello again/mac/series-five.html`
- Wayback 快照已下载到本地：
  - `/tmp/macbook-pro-13-wayback.html`（约 297 KB，2640 行）
  - `<main id="main">` 起止：约第 345 行 ～ 第 2186 行。

---

## 4. 未完成 / 当前阻塞

- **第五页 fragment 还未写入完整 `<main>` 内容**。
- 当前 fragment 文件：
  - `/Users/jiangyiwenzhe/Desktop/hello again/assets/archive/fragments/macbook-pro-13-m1-inline.html`
- `mac/index.html` 的第五页 archive 内容是**内联**的（不是 `data-archive-fragment` 加载），所以更新 fragment 后还要同步更新 `mac/index.html` 中的内联部分，或者改为引用 fragment。
- 资源路径需要统一重写：
  - `/web/20201116121558im_/https://www.apple.com/...` → `https://web.archive.org/web/20201116121558im_/https://www.apple.com/...`
  - `/web/20201116121558/https://www.apple.com/...` → `https://web.archive.org/web/20201116121558/https://www.apple.com/...`
  - `data-inline-media-basepath="/105/media/..."` 建议改为绝对 Wayback URL。
- 需要附带原始 Apple CSS（`main.built.css`、`overview.built.css`、字体）才能保证样式，建议用 Wayback 绝对链接：
  - `https://web.archive.org/web/20201116121558cs_/https://www.apple.com/wss/fonts?families=SF+Pro,v3|SF+Pro+Icons,v3`
  - `https://web.archive.org/web/20201116121558cs_/https://www.apple.com/v/macbook-pro-13/e/built/styles/main.built.css`
  - `https://web.archive.org/web/20201116121558cs_/https://www.apple.com/v/macbook-pro-13/e/built/styles/overview.built.css`
- 由于 `scripts/mac-series-page.js` 用 `innerHTML` 加载 fragment，插入的 `<script>` 不会执行；若需要原页面动画/视频工作，需要额外处理（例如改为 iframe、执行 fragment 内脚本，或接受静态展示）。
- 工具层面遇到 `kimi-k2.7-code is temporarily unavailable` 分类器错误，导致 Bash/Agent/Python 的文件写入/处理被拦截；当前只能用 `Read` / `Write` / `Edit` 修改文件。

---

## 5. 关键文件与代码位置

| 文件 | 说明 |
|------|------|
| `/Users/jiangyiwenzhe/Desktop/hello again/mac/index.html` | Mac 系列主入口，5 个 `series-panel`，第五页 archive 内容内联 |
| `/Users/jiangyiwenzhe/Desktop/hello again/mac/sequence.html` | 独立入口，第四页已重排，第五页通过 fragment 加载 |
| `/Users/jiangyiwenzhe/Desktop/hello again/mac/aqua.html` | 独立入口，第四页已重排，第五页通过 fragment 加载 |
| `/Users/jiangyiwenzhe/Desktop/hello again/mac/series-five.html` | 独立入口，直接定位到第五页，fragment 加载 |
| `/Users/jiangyiwenzhe/Desktop/hello again/assets/archive/fragments/macbook-pro-13-m1-inline.html` | 第五页 fragment，当前只含占位，需要替换为完整 Wayback `<main>` |
| `/Users/jiangyiwenzhe/Desktop/hello again/scripts/image-sequence.js` | 驱动 151 帧 canvas 序列动画（`frameCount: 151`） |
| `/Users/jiangyiwenzhe/Desktop/hello again/scripts/mac-series-page.js` | `loadDeferredArchivesForPanel()` 通过 `fetch()` + `innerHTML` 懒加载 archive fragment |
| `/Users/jiangyiwenzhe/Desktop/hello again/styles/series.css` | 系列页样式，之前追加了 `.archive-page--mbp` 自定义样式；接入原始 Apple CSS 后可能需要调整 |
| `/tmp/macbook-pro-13-wayback.html` | 已下载的 Wayback 完整快照 |

---

## 6. 技术要点

- 横向滚动容器 `.series-track` 通过 `scrollLeft` 切换 panel。
- `product-sequence` 是滚动驱动体验，包含：
  - `product-sequence__stage`（高度约 220vh）
  - `product-sequence__tail`（高度 140vh/64vh）
- 图片序列由 `scripts/image-sequence.js` 根据 `refs.sequenceSection` 等选择器计算滚动进度；第四页 DOM 顺序改变不影响脚本，只要选择器命中。
- Fragment 加载逻辑：
  ```js
  // scripts/mac-series-page.js:198-203
  const response = await fetch(fragmentPath);
  shell.innerHTML = await response.text();
  shell.dataset.archiveLoaded = "true";
  ```
  因此 fragment 内的 `<script>` 标签不会自动执行。

---

## 7. 用户偏好与约束

- **所有回复必须使用中文**。
- 用户明确要求**使用原始爬取的 Wayback HTML**，不要自创/改写内容。
- 对第四页顺序：sequence-intro → series-dock → product-sequence → archive-inline-shell。
- 用户已经因“自创版本”表达过不满，接手后不要再走自定义改写路线。

---

## 8. 下一步建议

1. 继续完成 `/tmp/macbook-pro-13-wayback.html` 中 `<main>` 内容的提取。
2. 将提取内容写入 `assets/archive/fragments/macbook-pro-13-m1-inline.html`，并附带原始 Apple CSS 链接。
3. 同步更新 `mac/index.html` 中第五页的内联 archive 内容（或改为 `data-archive-fragment` 引用，保持一致性需与用户确认）。
4. 重写所有资源路径为 `https://web.archive.org/web/20201116121558...` 绝对地址。
5. 浏览器打开 `mac/series-five.html` 与 `mac/index.html` 验证第五页渲染正常、无 404。
6. 若样式/动画仍不正常，再考虑 iframe 方案或修改 `mac-series-page.js` 执行 fragment 脚本。

---

## 9. 历史摘要

- 会话最初要求：修改第四页顺序 + 第五页替换为 Wayback 原页面。
- 曾错误地生成了一个“自创”的 MacBook Pro M1 摘要版本，被用户严厉纠正。
- 已重新定位策略：直接搬运 Wayback 快照的完整 `<main>` HTML。
- 当前因工具分类器限制，文件写入/脚本处理受阻，任务暂停，等待交接后继续。

---

*生成时间：2026-06-25*
