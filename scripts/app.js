(function () {
  window.HelloAgain = window.HelloAgain || {};

  window.HelloAgain.initApp = function initApp() {
    const refs = window.HelloAgain.createRefs();
    const motion = window.HelloAgain.createMotionController
      ? window.HelloAgain.createMotionController(refs)
      : null;
    const scenes = window.HelloAgain.createSceneController(refs);
    const seriesShell = window.HelloAgain.createSeriesShellController(refs);
    const scrollHint = window.HelloAgain.createScrollHintController(refs);
    const imageSequence = window.HelloAgain.createImageSequenceController
      ? window.HelloAgain.createImageSequenceController(refs)
      : null;
    let lastSeriesPanel = null;
    const seriesFadeScrollRange = Math.max(window.innerHeight * 0.55, 320);
    let activeSeriesVideoToken = 0;
    const seriesVideoFadeOutPauseThreshold = 0.015;

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

      if (!video) {
        return;
      }

      if (opacity <= seriesVideoFadeOutPauseThreshold) {
        if (!video.paused) {
          video.pause();
        }
      }
    }

    function stopSeriesVideos() {
      activeSeriesVideoToken += 1;
      [refs.seriesPageTwoVideo, refs.seriesPageThreeVideo].forEach((video) => {
        if (!video) {
          return;
        }
        video.pause();
      });
    }

    function playSeriesVideo(video) {
      if (!video) {
        return;
      }

      const token = activeSeriesVideoToken;
      try {
        video.currentTime = 0;
      } catch (_) {}

      video.volume = 0.18;
      video.muted = false;

      const attemptPlay = () => {
        if (token !== activeSeriesVideoToken) {
          return;
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      };

      if (video.readyState < 2) {
        video.load();
        video.addEventListener("canplay", attemptPlay, { once: true });
      }

      window.requestAnimationFrame(() => {
        attemptPlay();
      });
      window.setTimeout(() => {
        attemptPlay();
      }, 120);
    }

    function syncSeriesMediaForPanel(panelIndex) {
      stopSeriesVideos();

      if (panelIndex === window.HelloAgain.config.panels.aqua) {
        updateSeriesVideoFade(refs.aquaPage);
        playSeriesVideo(refs.seriesPageTwoVideo);
      } else if (panelIndex === window.HelloAgain.config.panels.three) {
        updateSeriesVideoFade(refs.seriesPageThree);
        playSeriesVideo(refs.seriesPageThreeVideo);
      }
    }

    if (motion) {
      seriesShell.setMotionController(motion);
    }

    function bindEvents() {
      refs.macButton?.addEventListener("click", async () => {
        seriesShell.openSeriesAtMac();
        syncSeriesMediaForPanel(window.HelloAgain.config.panels.mac);
        scenes.updateMacSceneScale();
        imageSequence?.handlePanelExit?.();
        scenes.ensureSecondScene();
        await scenes.ensureMacScene();
      });

      refs.macSceneHitarea?.addEventListener("click", () => {
        window.open(`${window.HelloAgain.config.externalUrls.classicMac}?t=${Date.now()}`, "_blank", "noopener");
      });

      refs.seriesTrack?.addEventListener(
        "scroll",
        () => {
          if (!seriesShell.isOpen()) {
            return;
          }

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

      window.addEventListener(
        "scroll",
        () => {
          window.HelloAgain.updateScrollTransition(refs);
          if (window.scrollY > 8) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "wheel",
        (event) => {
          if (window.scrollY <= 8 && event.deltaY > 2) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener(
        "touchmove",
        () => {
          if (window.scrollY <= 8) {
            scrollHint.markHelloScrollInteraction();
          }
        },
        { passive: true }
      );

      window.addEventListener("resize", () => {
        window.HelloAgain.updateScrollTransition(refs);
        scenes.updateMacSceneScale();
        motion?.handleResize();
        seriesShell.handleResize();
        imageSequence?.handleResize();
      });

      window.addEventListener("keydown", (event) => {
        seriesShell.handleKeydown(event);
      });
    }

    window.HelloAgain.updateScrollTransition(refs);
    scenes.updateMacSceneScale();
    bindEvents();
    scrollHint.scheduleHelloHint();
    motion?.init();
    imageSequence?.init();
    scenes.ensureSecondScene();

    if (window.UnicornStudio && typeof window.UnicornStudio.init === "function") {
      window.UnicornStudio.init();
    }

    seriesShell.primeTrackPosition();
    motion?.updateSeriesTrackEffects();
    scenes.ensureFirstScene();
    updateSeriesVideoFade(refs.aquaPage);
    updateSeriesVideoFade(refs.seriesPageThree);
    syncSeriesMediaForPanel(window.HelloAgain.config.panels.mac);
  };
})();
