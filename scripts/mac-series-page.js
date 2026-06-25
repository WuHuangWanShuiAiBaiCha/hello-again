(function () {
  function boot() {
    const refs = window.HelloAgain.createRefs();
    const initialPanel = Math.min(
      Math.max(
        Number(refs.seriesShell?.dataset.initialPanel) || window.HelloAgain.config.panels.mac,
        window.HelloAgain.config.panels.mac
      ),
      window.HelloAgain.config.panelLast
    );
    const motion = window.HelloAgain.createMotionController
      ? window.HelloAgain.createMotionController(refs)
      : null;
    const scenes = window.HelloAgain.createSceneController(refs);
    const seriesShell = window.HelloAgain.createSeriesShellController(refs);
    const imageSequence = window.HelloAgain.createImageSequenceController
      ? window.HelloAgain.createImageSequenceController(refs)
      : null;
    let lastSeriesPanel = null;
    const seriesFadeScrollRange = Math.max(window.innerHeight * 0.55, 320);
    let activeSeriesVideoToken = 0;
    const seriesVideoFadeOutPauseThreshold = 0.015;
    const deferredArchiveShells = Array.from(document.querySelectorAll("[data-archive-panel]"));

    function getCurrentSeriesPanel() {
      if (!refs.seriesTrack) {
        return lastSeriesPanel;
      }

      return Math.round(refs.seriesTrack.scrollLeft / Math.max(window.innerWidth, 1));
    }

    function getPanelIndexForScroller(scroller) {
      if (!scroller) {
        return null;
      }

      if (scroller === refs.aquaPage) {
        return window.HelloAgain.config.panels.aqua;
      }

      if (scroller === refs.seriesPageThree) {
        return window.HelloAgain.config.panels.three;
      }

      return null;
    }

    function resumeSeriesVideo(video) {
      if (!video) {
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          video.muted = true;
          const fallbackPlay = video.play();
          if (fallbackPlay && typeof fallbackPlay.catch === "function") {
            fallbackPlay.catch(() => {});
          }
        });
      }
    }

    function updateSeriesVideoFade(scroller) {
      if (!scroller) {
        return;
      }

      const stage = scroller.querySelector(".series-video-page__stage");
      const video = scroller.querySelector(".series-video-page__video");
      if (!stage) {
        return;
      }

      const progress = Math.max(Math.min(scroller.scrollTop / seriesFadeScrollRange, 1), 0);
      const opacity = 1 - progress;
      stage.style.setProperty("--series-video-opacity", String(opacity));
      stage.style.setProperty("--series-stage-opacity", String(opacity));

      if (!video) {
        return;
      }

      if (opacity <= seriesVideoFadeOutPauseThreshold) {
        if (!video.paused) {
          video.pause();
          video.dataset.fadePaused = "true";
        }
        return;
      }

      const panelIndex = getPanelIndexForScroller(scroller);
      const isCurrentPanel = panelIndex != null && panelIndex === getCurrentSeriesPanel();

      if (
        isCurrentPanel &&
        video.dataset.shouldPlay === "true" &&
        video.paused &&
        opacity > seriesVideoFadeOutPauseThreshold
      ) {
        delete video.dataset.fadePaused;
        resumeSeriesVideo(video);
      }
    }

    function stopSeriesVideos() {
      activeSeriesVideoToken += 1;
      [refs.seriesPageTwoVideo, refs.seriesPageThreeVideo].forEach((video) => {
        if (!video) {
          return;
        }
        delete video.dataset.fadePaused;
        delete video.dataset.shouldPlay;
        video.pause();
      });
    }

    function resetSeriesVideoPage(scroller) {
      if (!scroller) {
        return;
      }

      if (scroller.scrollTop !== 0) {
        scroller.scrollTop = 0;
      }
    }

    function playSeriesVideo(video) {
      if (!video) {
        return;
      }

      const token = activeSeriesVideoToken;
      try {
        video.currentTime = 0;
      } catch (_) {}

      delete video.dataset.fadePaused;
      video.dataset.shouldPlay = "true";
      video.volume = 0.18;
      video.muted = false;

      const attemptPlay = () => {
        if (token !== activeSeriesVideoToken) {
          return;
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            if (token !== activeSeriesVideoToken) {
              return;
            }

            video.muted = true;
            const fallbackPlay = video.play();
            if (fallbackPlay && typeof fallbackPlay.catch === "function") {
              fallbackPlay.catch(() => {});
            }
          });
        }
      };

      if (video.readyState < 2) {
        video.load();
        video.addEventListener("canplay", attemptPlay, { once: true });
      }

      window.requestAnimationFrame(attemptPlay);
      window.setTimeout(attemptPlay, 120);
      window.setTimeout(attemptPlay, 360);
      window.setTimeout(attemptPlay, 800);
    }

    function getMacArchiveAsset(assetPath) {
      const prefix = window.location.pathname.includes("/mac/") ? "../assets" : "./assets";
      return `${prefix}/${assetPath}`;
    }

    function createMacBookProChineseArchive() {
      const heroImage = getMacArchiveAsset("images/archive-mbp/hero.jpg");
      const chipImage = getMacArchiveAsset("images/archive-mbp/m1-chip.jpg");
      const processorImage = getMacArchiveAsset("images/archive-mbp/processor.png");
      const macosImage = getMacArchiveAsset("images/archive-mbp/macos.png");
      const macosAppsImage = getMacArchiveAsset("images/archive-mbp/macos-apps.png");
      const machineLearningImage = getMacArchiveAsset("images/archive-mbp/machine-learning.png");
      const unifiedMemoryImage = getMacArchiveAsset("images/archive-mbp/unified-memory.jpg");
      const retinaImage = getMacArchiveAsset("images/archive-mbp/retina-hardware.jpg");
      const keyboardImage = getMacArchiveAsset("images/archive-mbp/magic-keyboard.jpg");
      const connectivityImage = getMacArchiveAsset("images/archive-mbp/connectivity.jpg");

      return `
        <style>
          :host {
            display: block;
            width: 100%;
            min-height: 100vh;
            background: #000;
            color: #f5f5f7;
          }

          .mbp-cn {
            min-height: 100vh;
            overflow: hidden;
            background: #000;
            color: #f5f5f7;
            font-family: "PingFang SC", "SF Pro SC", "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
          }

          .mbp-cn__hero {
            min-height: 100vh;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            align-items: center;
            padding: clamp(32px, 6vw, 72px) clamp(20px, 7vw, 104px) 48px;
            box-sizing: border-box;
            text-align: center;
          }

          .mbp-cn__copy-block {
            max-width: 920px;
            margin: 0 auto;
          }

          .mbp-cn__eyebrow {
            margin: 0 0 14px;
            font-size: clamp(26px, 3.6vw, 56px);
            line-height: 1.05;
            font-weight: 600;
            letter-spacing: 0;
          }

          .mbp-cn__headline {
            margin: 0;
            font-size: clamp(48px, 9vw, 128px);
            line-height: 1.02;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__headline-line {
            display: block;
          }

          .mbp-cn__intro {
            max-width: 760px;
            margin: 26px auto 0;
            color: #a1a1a6;
            font-size: clamp(17px, 2vw, 26px);
            line-height: 1.38;
            font-weight: 500;
            letter-spacing: 0;
          }

          .mbp-cn__media {
            align-self: end;
            width: min(1120px, 96vw);
            margin: 34px auto 0;
          }

          .mbp-cn__media img {
            display: block;
            width: 100%;
            height: auto;
            object-fit: contain;
          }

          .mbp-cn__specs {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1px;
            background: #1d1d1f;
          }

          .mbp-cn__spec {
            min-height: 148px;
            display: grid;
            place-items: center;
            padding: 28px 22px;
            box-sizing: border-box;
            background: #0b0b0d;
            text-align: center;
          }

          .mbp-cn__spec strong {
            display: block;
            font-size: clamp(28px, 4.4vw, 58px);
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__spec span {
            display: block;
            margin-top: 10px;
            color: #a1a1a6;
            font-size: 15px;
            line-height: 1.35;
          }

          .mbp-cn__feature {
            min-height: 82vh;
            display: grid;
            grid-template-columns: minmax(0, 0.92fr) minmax(320px, 1fr);
            gap: clamp(28px, 6vw, 92px);
            align-items: center;
            padding: clamp(56px, 9vw, 128px) clamp(24px, 8vw, 118px);
            box-sizing: border-box;
          }

          .mbp-cn__feature:nth-of-type(2n) {
            grid-template-columns: minmax(320px, 1fr) minmax(0, 0.92fr);
          }

          .mbp-cn__feature:nth-of-type(2n) .mbp-cn__feature-copy {
            order: 2;
          }

          .mbp-cn__feature-copy {
            max-width: 560px;
          }

          .mbp-cn__feature-kicker {
            margin: 0 0 12px;
            color: #86868b;
            font-size: 18px;
            line-height: 1.3;
            font-weight: 600;
          }

          .mbp-cn__feature-title {
            margin: 0;
            font-size: clamp(38px, 5.6vw, 82px);
            line-height: 1.02;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__feature-text {
            margin: 24px 0 0;
            color: #a1a1a6;
            font-size: clamp(17px, 1.7vw, 24px);
            line-height: 1.44;
            font-weight: 500;
          }

          .mbp-cn__feature-media {
            min-width: 0;
          }

          .mbp-cn__feature-media img {
            display: block;
            width: 100%;
            max-height: 620px;
            object-fit: contain;
          }

          .mbp-cn__timeline {
            padding: clamp(72px, 10vw, 140px) clamp(24px, 8vw, 118px);
            background: #050505;
          }

          .mbp-cn__section-label {
            margin: 0 0 16px;
            color: #86868b;
            font-size: 18px;
            line-height: 1.3;
            font-weight: 600;
            text-align: center;
          }

          .mbp-cn__section-title {
            max-width: 980px;
            margin: 0 auto 54px;
            font-size: clamp(40px, 6.2vw, 88px);
            line-height: 1.03;
            font-weight: 700;
            letter-spacing: 0;
            text-align: center;
          }

          .mbp-cn__timeline-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1px;
            background: #1d1d1f;
          }

          .mbp-cn__timeline-card {
            min-height: 310px;
            padding: clamp(30px, 4vw, 48px);
            box-sizing: border-box;
            background: #0b0b0d;
          }

          .mbp-cn__timeline-card strong {
            display: block;
            margin-bottom: 18px;
            font-size: clamp(34px, 5vw, 68px);
            line-height: 1;
            font-weight: 700;
          }

          .mbp-cn__timeline-card h3 {
            margin: 0;
            font-size: clamp(22px, 2.4vw, 34px);
            line-height: 1.12;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__timeline-card p {
            margin: 18px 0 0;
            color: #a1a1a6;
            font-size: clamp(16px, 1.45vw, 20px);
            line-height: 1.52;
            font-weight: 500;
          }

          .mbp-cn__essay {
            padding: clamp(80px, 12vw, 160px) clamp(24px, 10vw, 150px);
            background: #000;
          }

          .mbp-cn__essay-inner {
            max-width: 1040px;
            margin: 0 auto;
          }

          .mbp-cn__essay-kicker {
            margin: 0 0 20px;
            color: #86868b;
            font-size: 20px;
            line-height: 1.3;
            font-weight: 600;
          }

          .mbp-cn__essay-title {
            margin: 0;
            font-size: clamp(44px, 7vw, 104px);
            line-height: 1.02;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__essay-copy {
            max-width: 820px;
            margin: 32px 0 0;
            color: #a1a1a6;
            font-size: clamp(18px, 2vw, 28px);
            line-height: 1.44;
            font-weight: 500;
          }

          .mbp-cn__visual-story {
            min-height: 86vh;
            display: grid;
            grid-template-columns: minmax(0, 0.84fr) minmax(360px, 1.16fr);
            gap: clamp(30px, 6vw, 96px);
            align-items: center;
            padding: clamp(72px, 10vw, 140px) clamp(24px, 8vw, 118px);
            box-sizing: border-box;
            background: #050505;
          }

          .mbp-cn__visual-story--reverse {
            grid-template-columns: minmax(360px, 1.16fr) minmax(0, 0.84fr);
            background: #000;
          }

          .mbp-cn__visual-story--reverse .mbp-cn__visual-copy {
            order: 2;
          }

          .mbp-cn__visual-copy {
            max-width: 560px;
          }

          .mbp-cn__visual-kicker {
            margin: 0 0 14px;
            color: #86868b;
            font-size: 18px;
            line-height: 1.3;
            font-weight: 600;
          }

          .mbp-cn__visual-title {
            margin: 0;
            font-size: clamp(36px, 5.4vw, 78px);
            line-height: 1.04;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__visual-text {
            margin: 24px 0 0;
            color: #a1a1a6;
            font-size: clamp(17px, 1.7vw, 24px);
            line-height: 1.46;
            font-weight: 500;
          }

          .mbp-cn__visual-media {
            min-width: 0;
            margin: 0;
          }

          .mbp-cn__visual-media img {
            display: block;
            width: 100%;
            max-height: 700px;
            object-fit: contain;
          }

          .mbp-cn__split-notes {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1px;
            background: #1d1d1f;
          }

          .mbp-cn__note {
            min-height: 420px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: clamp(36px, 5vw, 68px);
            box-sizing: border-box;
            background: #0b0b0d;
          }

          .mbp-cn__note h2 {
            margin: 0;
            font-size: clamp(34px, 4.8vw, 72px);
            line-height: 1.04;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__note p {
            margin: 24px 0 0;
            color: #a1a1a6;
            font-size: clamp(17px, 1.7vw, 24px);
            line-height: 1.45;
            font-weight: 500;
          }

          .mbp-cn__gallery {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1px;
            background: #1d1d1f;
          }

          .mbp-cn__gallery--ai {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mbp-cn__gallery-item {
            min-height: 430px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 28px;
            margin: 0;
            padding: clamp(28px, 4vw, 48px);
            box-sizing: border-box;
            background: #08080a;
          }

          .mbp-cn__gallery-item img {
            display: block;
            width: 100%;
            max-height: 280px;
            object-fit: contain;
          }

          .mbp-cn__gallery--ai .mbp-cn__gallery-item img {
            max-height: 360px;
          }

          .mbp-cn__gallery-caption {
            max-width: 360px;
            color: #a1a1a6;
            font-size: clamp(16px, 1.45vw, 20px);
            line-height: 1.45;
            font-weight: 500;
          }

          .mbp-cn__gallery-caption strong {
            display: block;
            margin-bottom: 10px;
            color: #f5f5f7;
            font-size: clamp(22px, 2.4vw, 34px);
            line-height: 1.12;
            font-weight: 700;
          }

          .mbp-cn__gallery-item--wide {
            grid-column: 1 / -1;
            min-height: 360px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(260px, 0.34fr);
            align-items: center;
          }

          .mbp-cn__gallery-item--wide img {
            width: 100%;
            max-height: none;
            height: clamp(170px, 22vw, 280px);
            object-fit: cover;
          }

          .mbp-cn__closing {
            min-height: 76vh;
            display: grid;
            place-items: center;
            padding: clamp(72px, 12vw, 150px) 24px;
            box-sizing: border-box;
            background:
              radial-gradient(circle at 50% 100%, rgba(74, 112, 255, 0.25), transparent 42%),
              #000;
            text-align: center;
          }

          .mbp-cn__closing h2 {
            max-width: 1040px;
            margin: 0 auto;
            font-size: clamp(48px, 8vw, 116px);
            line-height: 1.02;
            font-weight: 700;
            letter-spacing: 0;
          }

          .mbp-cn__closing p {
            max-width: 720px;
            margin: 30px auto 0;
            color: #a1a1a6;
            font-size: clamp(18px, 2vw, 28px);
            line-height: 1.42;
            font-weight: 500;
          }

          @media (max-width: 800px) {
            .mbp-cn__hero {
              min-height: 100vh;
              padding-top: 44px;
            }

            .mbp-cn__specs,
            .mbp-cn__timeline-grid,
            .mbp-cn__split-notes,
            .mbp-cn__gallery,
            .mbp-cn__visual-story,
            .mbp-cn__visual-story--reverse,
            .mbp-cn__gallery-item--wide,
            .mbp-cn__feature,
            .mbp-cn__feature:nth-of-type(2n) {
              grid-template-columns: 1fr;
            }

            .mbp-cn__visual-story--reverse .mbp-cn__visual-copy,
            .mbp-cn__feature:nth-of-type(2n) .mbp-cn__feature-copy {
              order: 0;
            }

            .mbp-cn__visual-story,
            .mbp-cn__feature {
              min-height: auto;
              padding: 68px 24px;
              text-align: center;
            }

            .mbp-cn__visual-copy,
            .mbp-cn__feature-copy {
              margin: 0 auto;
            }

            .mbp-cn__timeline-card,
            .mbp-cn__note,
            .mbp-cn__gallery-item {
              min-height: auto;
            }

            .mbp-cn__gallery-item--wide img {
              height: 160px;
            }
          }
        </style>
        <article class="mbp-cn" aria-label="13 英寸 MacBook Pro">
          <section class="mbp-cn__hero">
            <div class="mbp-cn__copy-block">
              <p class="mbp-cn__eyebrow">MacBook Pro</p>
              <h1 class="mbp-cn__headline">
                <span class="mbp-cn__headline-line">Mac 从此</span>
                <span class="mbp-cn__headline-line">换了心脏。</span>
              </h1>
              <p class="mbp-cn__intro">
                2020 年，13 英寸 MacBook Pro 迎来 Apple M1。
                它不只是一次性能升级，而是 Mac 从 Intel 时代转向 Apple 芯片时代的起点。
              </p>
            </div>
            <figure class="mbp-cn__media" aria-label="13 英寸 MacBook Pro 产品图">
              <img src="${heroImage}" alt="13 英寸 MacBook Pro">
            </figure>
          </section>

          <section class="mbp-cn__specs" aria-label="性能亮点">
            <div class="mbp-cn__spec">
              <div>
                <strong>2020</strong>
                <span>Apple 芯片 Mac 正式登场</span>
              </div>
            </div>
            <div class="mbp-cn__spec">
              <div>
                <strong>M1</strong>
                <span>Mac 架构的转折点</span>
              </div>
            </div>
            <div class="mbp-cn__spec">
              <div>
                <strong>13 英寸</strong>
                <span>把转变放进熟悉的 Pro 机身</span>
              </div>
            </div>
          </section>

          <section class="mbp-cn__feature">
            <div class="mbp-cn__feature-copy">
              <p class="mbp-cn__feature-kicker">Apple M1 芯片</p>
              <h2 class="mbp-cn__feature-title">Mac 的新纪元，正式开始。</h2>
              <p class="mbp-cn__feature-text">
                M1 把中央处理器、图形处理器、神经网络引擎和统一内存整合到同一块芯片上。
                对 Mac 来说，这意味着性能不再只是更快一点，而是整个计算架构被重新设计。
                也正是这种芯片、内存与机器学习单元的整合，为后来 Mac 进入本地 AI 计算时代提前铺好了底层道路。
                2020 款 MacBook Pro，是这场转变第一次以 Pro 笔记本的形态出现在用户面前。
              </p>
            </div>
            <figure class="mbp-cn__feature-media">
              <img src="${chipImage}" alt="Apple M1 芯片">
            </figure>
          </section>

          <section class="mbp-cn__feature">
            <div class="mbp-cn__feature-copy">
              <p class="mbp-cn__feature-kicker">13 英寸 MacBook Pro</p>
              <h2 class="mbp-cn__feature-title">熟悉的外壳，完全不同的内核。</h2>
              <p class="mbp-cn__feature-text">
                它看起来仍是那台 13 英寸 MacBook Pro，但里面已经不是过去的 Mac。
                更长的续航、更低的能耗、更强的即时响应，让移动办公和专业创作第一次真正站在同一个平衡点上。
                M1 MacBook Pro 证明了：未来的 Mac，不必在性能和效率之间二选一。
              </p>
            </div>
            <figure class="mbp-cn__feature-media">
              <img src="${processorImage}" alt="MacBook Pro 处理器性能展示">
            </figure>
          </section>

          <section class="mbp-cn__timeline" aria-label="跨时代意义">
            <p class="mbp-cn__section-label">为什么它重要</p>
            <h2 class="mbp-cn__section-title">它改变的，不只是这一台电脑。</h2>
            <div class="mbp-cn__timeline-grid">
              <article class="mbp-cn__timeline-card">
                <strong>01</strong>
                <h3>结束一个依赖外部芯片的时代。</h3>
                <p>
                  过去的 Mac 必须围绕 Intel 芯片的节奏更新。M1 之后，Apple 能自己决定芯片、系统和硬件怎样一起进化，
                  Mac 的未来第一次完整握在 Apple 自己手里。
                </p>
              </article>
              <article class="mbp-cn__timeline-card">
                <strong>02</strong>
                <h3>把手机芯片的能效逻辑带到电脑。</h3>
                <p>
                  M1 延续了 Apple 在 iPhone 和 iPad 上积累的芯片经验，却把它放进专业笔记本。
                  高性能和低功耗不再互相排斥，笔记本电脑的评价标准也随之改变。
                </p>
              </article>
              <article class="mbp-cn__timeline-card">
                <strong>03</strong>
                <h3>为后来的 AI 时代提前布局。</h3>
                <p>
                  统一内存让 CPU、GPU 和神经网络引擎可以高效共享数据，减少复制和等待。
                  到本地模型、图像处理、语音识别兴起时，这种架构成为 Mac 适合端侧 AI 计算的重要基础。
                </p>
              </article>
            </div>
          </section>

          <section class="mbp-cn__visual-story">
            <div class="mbp-cn__visual-copy">
              <p class="mbp-cn__visual-kicker">macOS Big Sur</p>
              <h2 class="mbp-cn__visual-title">系统也为新架构重新准备。</h2>
              <p class="mbp-cn__visual-text">
                M1 的跨时代意义，不只在芯片本身。macOS Big Sur 为 Apple 芯片重新调校，
                让系统、续航、图形和安全机制一起配合新硬件。它让用户不必理解架构迁移，
                也能直接感到这台 Mac 反应更快、运行更稳、待机更久。
              </p>
            </div>
            <figure class="mbp-cn__visual-media">
              <img src="${macosImage}" alt="MacBook Pro 运行 macOS Big Sur">
            </figure>
          </section>

          <section class="mbp-cn__visual-story mbp-cn__visual-story--ai">
            <div class="mbp-cn__visual-copy">
              <p class="mbp-cn__visual-kicker">AI 时代的伏笔</p>
              <h2 class="mbp-cn__visual-title">它让 Mac 更早学会在本地处理智能任务。</h2>
              <p class="mbp-cn__visual-text">
                在 2020 年，M1 页面讲的是机器学习；几年后，人们开始用同一条技术路线理解本地 AI。
                统一内存架构让大模型、图像处理、视频分析这类任务可以在 CPU、GPU 和神经网络引擎之间更顺畅地流动；
                神经网络引擎则让语音、图像和自动化处理不必完全依赖云端。M1 MacBook Pro 的真正远见，
                是把“电脑也能高效运行智能计算”这件事变成了 Mac 的芯片基础。
              </p>
            </div>
            <figure class="mbp-cn__visual-media">
              <img src="${machineLearningImage}" alt="M1 MacBook Pro 机器学习能力展示">
            </figure>
          </section>

          <section class="mbp-cn__essay">
            <div class="mbp-cn__essay-inner">
              <p class="mbp-cn__essay-kicker">一次安静但巨大的断代</p>
              <h2 class="mbp-cn__essay-title">它没有换掉 MacBook Pro 的样子，却换掉了 Mac 的底层逻辑。</h2>
              <p class="mbp-cn__essay-copy">
                2020 款 M1 MacBook Pro 的意义，不在于它有多像一台全新机器，而在于它几乎没有改变外观，
                却让用户第一次感到：同样的 Mac，可以更快醒来，更久工作，更少发热，也更少被插座限制。
                更重要的是，它把统一内存、专用机器学习单元和高能效 GPU 放进了 Mac 的基本架构里。
                当 AI 计算后来成为电脑的新任务时，这台 Mac 已经给出了一种方向：让智能计算尽可能发生在本机，
                在性能、隐私和续航之间取得新的平衡。
                这是一种很 Apple 的转变，表面克制，内部剧烈。
              </p>
            </div>
          </section>

          <section class="mbp-cn__visual-story mbp-cn__visual-story--reverse">
            <div class="mbp-cn__visual-copy">
              <p class="mbp-cn__visual-kicker">应用生态</p>
              <h2 class="mbp-cn__visual-title">过渡不是暂停，而是合流。</h2>
              <p class="mbp-cn__visual-text">
                Rosetta 2 让旧 App 继续运行，原生 App 开始释放 M1 的效率，
                iPhone 和 iPad App 也第一次更自然地进入 Mac 世界。
                这台 MacBook Pro 承担的角色，是让整个生态在不断档的情况下完成换轨。
              </p>
            </div>
            <figure class="mbp-cn__visual-media">
              <img src="${macosAppsImage}" alt="MacBook Pro 上的 macOS 应用生态">
            </figure>
          </section>

          <section class="mbp-cn__split-notes" aria-label="影响">
            <article class="mbp-cn__note">
              <h2>专业性能，开始移动化。</h2>
              <p>
                过去，真正的专业性能常常意味着更厚、更热、更依赖电源。
                M1 MacBook Pro 让剪辑、编译、设计和多任务处理可以在更轻的能耗里完成，
                它把“随身的 Pro 电脑”变成了更现实的日常。
              </p>
            </article>
            <article class="mbp-cn__note">
              <h2>Mac、iPad、iPhone 的边界开始变薄。</h2>
              <p>
                统一的芯片架构让 Apple 设备之间的距离变得更近。
                从应用运行到系统体验，M1 让 Mac 不再只是传统桌面电脑的延续，
                而成为 Apple 自研芯片生态中的关键一环。
              </p>
            </article>
          </section>

          <section class="mbp-cn__gallery mbp-cn__gallery--ai" aria-label="AI 时代基础">
            <figure class="mbp-cn__gallery-item">
              <img src="${machineLearningImage}" alt="M1 芯片机器学习图形">
              <figcaption class="mbp-cn__gallery-caption">
                <strong>机器学习成为芯片能力。</strong>
                M1 内置 16 核神经网络引擎，让视频分析、语音识别和图像处理这类任务开始拥有专门的硬件加速。
              </figcaption>
            </figure>
            <figure class="mbp-cn__gallery-item">
              <img src="${unifiedMemoryImage}" alt="M1 芯片统一内存架构">
              <figcaption class="mbp-cn__gallery-caption">
                <strong>统一内存适合 AI 数据流。</strong>
                CPU、GPU 与神经网络引擎共享同一片高带宽内存池，减少数据在不同模块之间来回搬运。
              </figcaption>
            </figure>
          </section>

          <section class="mbp-cn__gallery" aria-label="MacBook Pro 官方细节配图">
            <figure class="mbp-cn__gallery-item">
              <img src="${retinaImage}" alt="13 英寸 MacBook Pro Retina 显示屏">
              <figcaption class="mbp-cn__gallery-caption">
                <strong>仍然是 Pro 的屏幕。</strong>
                架构变了，熟悉的 Retina 显示屏仍承接创作、剪辑和日常工作的视觉中心。
              </figcaption>
            </figure>
            <figure class="mbp-cn__gallery-item">
              <img src="${keyboardImage}" alt="13 英寸 MacBook Pro 妙控键盘">
              <figcaption class="mbp-cn__gallery-caption">
                <strong>熟悉的输入方式。</strong>
                妙控键盘、触控栏和大尺寸触控板，让这次跨代迁移没有打断原来的使用习惯。
              </figcaption>
            </figure>
            <figure class="mbp-cn__gallery-item mbp-cn__gallery-item--wide">
              <img src="${connectivityImage}" alt="13 英寸 MacBook Pro 连接能力">
              <figcaption class="mbp-cn__gallery-caption">
                <strong>继续接入专业工作流。</strong>
                雷雳接口和外接显示器、存储、音频设备一起，让 M1 进入已有的创作环境。
              </figcaption>
            </figure>
          </section>

          <section class="mbp-cn__closing">
            <div>
              <h2>从这台 MacBook Pro 开始，Mac 的未来改写了。</h2>
              <p>
                它不是 M 系列故事的终点，而是开篇。后来的 M1 Pro、M1 Max、M2、M3，
                都能在这台 2020 年的 13 英寸 MacBook Pro 上找到起点。
              </p>
            </div>
          </section>
        </article>
      `;
    }

    async function loadDeferredArchivesForPanel(panelIndex) {
      if (!deferredArchiveShells.length) {
        return;
      }

      await Promise.all(
        deferredArchiveShells.map(async (shell) => {
          const targetPanel = Number(shell.dataset.archivePanel);
          if (
            !targetPanel ||
            panelIndex < targetPanel ||
            shell.dataset.archiveLoaded === "true" ||
            shell.dataset.archiveLoading === "true"
          ) {
            return;
          }

          shell.dataset.archiveLoading = "true";
          try {
            const root = shell.shadowRoot || shell.attachShadow({ mode: "open" });

            if (shell.classList.contains("archive-inline-shell--mbp")) {
              root.innerHTML = createMacBookProChineseArchive();
              shell.dataset.archiveLoaded = "true";
              return;
            }

            const template = shell.querySelector("template[data-archive-template]");
            let html = template?.innerHTML || "";

            if (!html && shell.dataset.archiveFragment) {
              const response = await fetch(shell.dataset.archiveFragment);
              if (!response.ok) {
                throw new Error(`Archive fragment failed: ${response.status}`);
              }
              html = await response.text();
            }

            if (!html) {
              return;
            }

            root.innerHTML = `
              <style>
                :host {
                  display: block;
                  width: 100%;
                  min-height: 100vh;
                  background: #000;
                  color: #f5f5f7;
                }
              </style>
              ${html}
            `;
            shell.dataset.archiveLoaded = "true";
          } catch (error) {
            console.warn("Archive panel failed to load", error);
          } finally {
            delete shell.dataset.archiveLoading;
          }
        })
      );
    }

    function syncSeriesMediaForPanel(panelIndex) {
      stopSeriesVideos();
      loadDeferredArchivesForPanel(panelIndex);

      if (panelIndex === window.HelloAgain.config.panels.aqua) {
        resetSeriesVideoPage(refs.aquaPage);
        updateSeriesVideoFade(refs.aquaPage);
        playSeriesVideo(refs.seriesPageTwoVideo);
      } else if (panelIndex === window.HelloAgain.config.panels.three) {
        resetSeriesVideoPage(refs.seriesPageThree);
        updateSeriesVideoFade(refs.seriesPageThree);
        playSeriesVideo(refs.seriesPageThreeVideo);
      }
    }

    if (motion) {
      seriesShell.setMotionController(motion);
    }

    const swipe = window.HelloAgain.createSeriesSwipeController?.({
      refs,
      seriesShell,
      defaultLastPanel: window.HelloAgain.config.panelLast,
      startPanel: initialPanel,
    });

    refs.macSceneHitarea?.addEventListener("click", () => {
      window.open(
        `${window.HelloAgain.config.externalUrls.classicMac}?t=${Date.now()}`,
        "_blank",
        "noopener"
      );
    });

    refs.seriesTrack?.addEventListener(
      "scroll",
      () => {
        const currentPanel = Math.round(
          refs.seriesTrack.scrollLeft / Math.max(window.innerWidth, 1)
        );

        if (currentPanel !== lastSeriesPanel) {
          syncSeriesMediaForPanel(currentPanel);

          if (lastSeriesPanel === window.HelloAgain.config.panels.sequence) {
            imageSequence?.handlePanelExit?.();
          }

          if (currentPanel === window.HelloAgain.config.panels.sequence) {
            imageSequence?.handlePanelEnter?.();
          }
          lastSeriesPanel = currentPanel;
        }

        if (currentPanel >= window.HelloAgain.config.panels.sequence) {
          imageSequence?.ensureReady();
        }

        seriesShell.scheduleTrackSettle();
      },
      { passive: true }
    );

    swipe?.bind();

    [refs.aquaPage, refs.seriesPageThree].forEach((scroller) => {
      scroller?.addEventListener(
        "scroll",
        () => {
          updateSeriesVideoFade(scroller);
        },
        { passive: true }
      );
    });

    window.addEventListener("resize", () => {
      scenes.updateMacSceneScale();
      motion?.handleResize();
      seriesShell.handleResize();
      imageSequence?.handleResize();
    });

    window.addEventListener("keydown", (event) => {
      seriesShell.handleKeydown(event);
    });

    scenes.updateMacSceneScale();
    motion?.init();
    imageSequence?.init();

    if (window.UnicornStudio && typeof window.UnicornStudio.init === "function") {
      window.UnicornStudio.init();
    }

    refs.seriesPages.forEach((page) => {
      page.scrollTop = 0;
    });
    seriesShell.primeTrackPosition();
    motion?.updateSeriesTrackEffects();
    scenes.ensureMacScene();
    updateSeriesVideoFade(refs.aquaPage);
    updateSeriesVideoFade(refs.seriesPageThree);
    syncSeriesMediaForPanel(initialPanel);
    loadDeferredArchivesForPanel(window.HelloAgain.config.panelLast);

    if (initialPanel === window.HelloAgain.config.panels.sequence) {
      imageSequence?.handlePanelEnter?.();
    }

    lastSeriesPanel = initialPanel;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
