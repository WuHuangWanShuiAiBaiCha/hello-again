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

            const root = shell.shadowRoot || shell.attachShadow({ mode: "open" });
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
