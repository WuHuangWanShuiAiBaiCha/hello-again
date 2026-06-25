# 给队友的交付说明

这份是给队友直接看的版本。

你们不用研究我现在网站内部怎么写，只需要按下面的方式把页面交给我就行。

## 你们需要做什么

每个人只做自己负责按钮下面的页面。

比如：

- 做 `iPhone` 的同学，只做 `iPhone`
- 做 `iPad` 的同学，只做 `iPad`
- 做 `Apple Watch` 的同学，只做 `Apple Watch`
- 做 `AirPods` 的同学，只做 `AirPods`

不要改我现在主网站里的代码。

## 你们最后交给我的东西

请把你负责的页面做成一个**完整文件夹**交给我。

文件夹里至少要有这些：

```text
你的产品名/
  index.html
  styles/
    main.css
  scripts/
    app.js
  assets/
    images/
    videos/
  README.md
```

比如你做的是 `iPhone`，最后交给我的是：

```text
iphone/
  index.html
  styles/
    main.css
  scripts/
    app.js
  assets/
    images/
    videos/
  README.md
```

## 最重要的要求

### 1. 必须是完整网页

不要只发给我：

- 一段 HTML
- 一段 CSS
- 一段 JS

我要的是一个能打开的完整网页文件夹。

### 2. 所有资源必须用相对路径

正确例子：

- `./assets/images/hero.png`
- `./styles/main.css`
- `./scripts/app.js`

不要写你自己电脑里的路径，比如：

- `/Users/你的名字/Desktop/...`
- `C:\\...`

### 3. 不要依赖我主项目里的文件

你自己的页面要自己带自己的：

- HTML
- CSS
- JS
- 图片
- 视频

不要默认去引用我项目里的：

- `styles/base.css`
- `styles/components.css`
- `scripts/app.js`

简单说就是：

> 你的页面单独拿出来也应该能打开。

### 4. CSS 不要写太全局

不要上来就写这种：

```css
video {}
button {}
section {}
div {}
```

这样容易把别人的页面也影响了。

尽量写成这种：

```css
.iphone-page .hero {}
.iphone-page .video {}
.iphone-page .button {}
```

### 5. 如果用了第三方库，要写清楚

如果你用了：

- GSAP
- Swiper
- Lenis
- 任何别的库

请在 `README.md` 里写清楚：

- 用了什么
- 是 CDN 还是本地文件
- 哪个文件里初始化

## README 要写什么

你交给我的文件夹里，请放一个 `README.md`，内容至少写这几项：

```text
产品：
入口文件：
依赖：
资源目录：
已完成功能：
未完成功能：
注意事项：
```

你可以直接按这个模板写：

```text
产品：iPhone
入口文件：index.html
依赖：GSAP（CDN）
资源目录：assets/images, assets/videos
已完成功能：首屏动画、第二屏滚动效果、按钮 hover
未完成功能：移动端适配
注意事项：建议用本地服务器打开，file:// 下视频自动播放可能受限
```

## 你们不要做的事

请不要直接改我现在项目里的这些文件：

- `index.html`
- `scripts/` 里的现有文件
- `styles/` 里的现有文件

也不要把你们的代码直接塞进我现在的网站里。

你们只需要把自己的页面做完，整理成一个完整文件夹发给我。

## 你们交给我之前，自己先检查一下

发给我之前，自己先确认这几件事：

1. 双击 `index.html` 或者本地起个静态服务后，页面能打开
2. 图片和视频不会丢
3. 样式没有乱掉
4. 你的 JS 报错不多
5. `README.md` 写了

## 一句话总结

你们每个人只需要：

> 做好自己负责按钮下面的完整网页，然后把整个文件夹发给我，不要直接改我的主网站代码。

